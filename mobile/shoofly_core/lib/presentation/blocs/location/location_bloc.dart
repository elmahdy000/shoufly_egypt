import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shoofly_core/data/models/location_model.dart';
import 'package:shoofly_core/features/locations/data/location_service.dart';
import 'package:shoofly_core/core/di/injection.dart';

// --- Events ---
abstract class LocationEvent extends Equatable {
  const LocationEvent();
  @override
  List<Object?> get props => [];
}

class LoadGovernorates extends LocationEvent {}

class LoadCities extends LocationEvent {
  final int governorateId;
  const LoadCities(this.governorateId);
  @override
  List<Object?> get props => [governorateId];
}

// --- States ---
class LocationState extends Equatable {
  final List<GovernorateModel> governorates;
  final List<CityModel> cities;
  final bool isLoading;
  final String? error;

  const LocationState({
    this.governorates = const [],
    this.cities = const [],
    this.isLoading = false,
    this.error,
  });

  LocationState copyWith({
    List<GovernorateModel>? governorates,
    List<CityModel>? cities,
    bool? isLoading,
    String? error,
  }) {
    return LocationState(
      governorates: governorates ?? this.governorates,
      cities: cities ?? this.cities,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  @override
  List<Object?> get props => [governorates, cities, isLoading, error];
}

class LocationInitial extends LocationState {}

// --- BLoC ---
class LocationBloc extends Bloc<LocationEvent, LocationState> {
  final LocationService _locationService;
  List<GovernorateModel>? _governoratesCache;
  final Map<int, List<CityModel>> _citiesCache = {};
  int? _lastRequestedGovernorateId;

  LocationBloc() : _locationService = sl<LocationService>(), super(const LocationState()) {
    on<LoadGovernorates>(_onLoadGovernorates);
    on<LoadCities>(_onLoadCities);
  }

  Future<void> _onLoadGovernorates(LoadGovernorates event, Emitter<LocationState> emit) async {
    if (_governoratesCache != null && _governoratesCache!.isNotEmpty) {
      emit(state.copyWith(
        governorates: _governoratesCache,
        isLoading: false,
        error: null,
      ));
      return;
    }

    emit(state.copyWith(isLoading: true, error: null));
    try {
      final governorates = await _locationService.getGovernorates();
      _governoratesCache = governorates;
      emit(state.copyWith(isLoading: false, governorates: governorates));
    } catch (e) {
      emit(state.copyWith(isLoading: false, error: e.toString()));
    }
  }

  Future<void> _onLoadCities(LoadCities event, Emitter<LocationState> emit) async {
    if (_citiesCache.containsKey(event.governorateId)) {
      _lastRequestedGovernorateId = event.governorateId;
      emit(state.copyWith(
        cities: _citiesCache[event.governorateId],
        isLoading: false,
        error: null,
      ));
      return;
    }

    if (_lastRequestedGovernorateId == event.governorateId && state.isLoading) {
      return;
    }

    _lastRequestedGovernorateId = event.governorateId;
    emit(state.copyWith(isLoading: true, error: null));
    try {
      final cities = await _locationService.getCities(event.governorateId);
      _citiesCache[event.governorateId] = cities;
      emit(state.copyWith(isLoading: false, cities: cities));
    } catch (e) {
      emit(state.copyWith(isLoading: false, error: e.toString()));
    }
  }
}
