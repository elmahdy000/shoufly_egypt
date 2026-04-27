import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:location/location.dart';
import 'package:shoofly_core/domain/entities/request.dart';
import 'package:shoofly_core/domain/repositories/vendor_repository.dart';
import 'package:shoofly_core/core/di/injection.dart';

// --- State ---
abstract class VendorRequestsMapState extends Equatable {
  final Set<Marker> markers;
  final LatLng currentLocation;
  final bool isLoading;
  final String? error;

  const VendorRequestsMapState({
    this.markers = const {},
    this.currentLocation = const LatLng(30.0444, 31.2357),
    this.isLoading = false,
    this.error,
  });

  @override
  List<Object?> get props => [markers, currentLocation, isLoading, error];
}

class VendorRequestsMapInitial extends VendorRequestsMapState {
  const VendorRequestsMapInitial() : super(isLoading: true);
}

class VendorRequestsMapLoaded extends VendorRequestsMapState {
  final List<Request> allRequests;
  final List<Request> visibleRequests;
  final Request? selectedRequest;

  const VendorRequestsMapLoaded({
    required this.allRequests,
    required this.visibleRequests,
    this.selectedRequest,
    super.currentLocation,
    super.isLoading,
    super.error,
    required super.markers,
  });

  VendorRequestsMapLoaded copyWith({
    List<Request>? allRequests,
    List<Request>? visibleRequests,
    Request? selectedRequest,
    LatLng? currentLocation,
    bool? isLoading,
    String? error,
    Set<Marker>? markers,
    bool clearSelection = false,
  }) {
    return VendorRequestsMapLoaded(
      allRequests: allRequests ?? this.allRequests,
      visibleRequests: visibleRequests ?? this.visibleRequests,
      selectedRequest: clearSelection ? null : (selectedRequest ?? this.selectedRequest),
      currentLocation: currentLocation ?? this.currentLocation,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      markers: markers ?? this.markers,
    );
  }

  @override
  List<Object?> get props => [
        ...super.props,
        allRequests,
        visibleRequests,
        selectedRequest,
      ];
}

// --- Cubit ---
class VendorRequestsMapCubit extends Cubit<VendorRequestsMapState> {
  final VendorRepository _repository;
  final Location _locationService = Location();
  GoogleMapController? _mapController;

  VendorRequestsMapCubit()
      : _repository = sl<VendorRepository>(),
        super(const VendorRequestsMapInitial());

  void onMapCreated(GoogleMapController controller) {
    _mapController = controller;
  }

  Future<void> loadRequests() async {
    emit(VendorRequestsMapLoaded(
      allRequests: (state is VendorRequestsMapLoaded) ? (state as VendorRequestsMapLoaded).allRequests : [],
      visibleRequests: (state is VendorRequestsMapLoaded) ? (state as VendorRequestsMapLoaded).visibleRequests : [],
      markers: state.markers,
      currentLocation: state.currentLocation,
      isLoading: true,
    ));

    // 1. Get Location
    LatLng? location;
    try {
      final hasPermission = await _checkPermissions();
      if (hasPermission) {
        final locData = await _locationService.getLocation();
        if (locData.latitude != null && locData.longitude != null) {
          location = LatLng(locData.latitude!, locData.longitude!);
        }
      }
    } catch (_) {}

    // 2. Load Requests from Repository
    final result = await _repository.getOpenRequests();
    
    result.fold(
      (failure) => emit(VendorRequestsMapLoaded(
        allRequests: [],
        visibleRequests: [],
        markers: {},
        currentLocation: location ?? state.currentLocation,
        isLoading: false,
        error: failure.message,
      )),
      (requests) {
        final markers = _buildMarkers(requests, null);
        emit(VendorRequestsMapLoaded(
          allRequests: requests,
          visibleRequests: requests,
          currentLocation: location ?? state.currentLocation,
          markers: markers,
          isLoading: false,
        ));
        
        if (location != null) {
          _animateTo(location);
        }
      },
    );
  }

  Future<bool> _checkPermissions() async {
    bool serviceEnabled = await _locationService.serviceEnabled();
    if (!serviceEnabled) {
      serviceEnabled = await _locationService.requestService();
      if (!serviceEnabled) return false;
    }

    PermissionStatus permissionGranted = await _locationService.hasPermission();
    if (permissionGranted == PermissionStatus.denied) {
      permissionGranted = await _locationService.requestPermission();
      if (permissionGranted != PermissionStatus.granted) return false;
    }
    return true;
  }

  void selectRequest(Request request) {
    if (state is VendorRequestsMapLoaded) {
      final s = state as VendorRequestsMapLoaded;
      final markers = _buildMarkers(s.visibleRequests, request.id);
      emit(s.copyWith(selectedRequest: request, markers: markers));
      
      if (request.latitude != null && request.longitude != null) {
        _animateTo(LatLng(request.latitude!, request.longitude!));
      }
    }
  }

  void clearSelectedRequest() {
    if (state is VendorRequestsMapLoaded) {
      final s = state as VendorRequestsMapLoaded;
      final markers = _buildMarkers(s.visibleRequests, null);
      emit(s.copyWith(clearSelection: true, markers: markers));
    }
  }

  Set<Marker> _buildMarkers(List<Request> requests, int? selectedId) {
    return requests
        .where((r) => r.latitude != null && r.longitude != null)
        .map((r) {
      final isSelected = r.id == selectedId;
      return Marker(
        markerId: MarkerId(r.id.toString()),
        position: LatLng(r.latitude!, r.longitude!),
        icon: BitmapDescriptor.defaultMarkerWithHue(
          isSelected ? BitmapDescriptor.hueAzure : BitmapDescriptor.hueRed,
        ),
        onTap: () => selectRequest(r),
      );
    }).toSet();
  }

  void _animateTo(LatLng position) {
    _mapController?.animateCamera(
      CameraUpdate.newCameraPosition(
        CameraPosition(target: position, zoom: 14),
      ),
    );
  }

  Future<void> refreshRequests() => loadRequests();

  @override
  Future<void> close() {
    _mapController = null;
    return super.close();
  }
}
