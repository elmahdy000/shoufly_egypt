import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shoofly_core/domain/entities/request.dart';
import 'package:shoofly_core/domain/entities/bid.dart';
import 'package:shoofly_core/domain/entities/vendor_profile.dart';
import 'package:shoofly_core/domain/entities/vendor_transaction.dart';
import 'package:shoofly_core/domain/repositories/vendor_repository.dart';
import 'package:shoofly_core/core/di/injection.dart';

// --- Events ---
abstract class VendorEvent extends Equatable {
  const VendorEvent();
  @override
  List<Object?> get props => [];
}

class LoadOpenRequests extends VendorEvent {
  final int? governorateId;
  final int? cityId;
  const LoadOpenRequests({this.governorateId, this.cityId});
  @override
  List<Object?> get props => [governorateId, cityId];
}

class LoadMyBids extends VendorEvent {}

class UpdateOnlineStatusEvent extends VendorEvent {
  final bool isOnline;
  const UpdateOnlineStatusEvent(this.isOnline);
  @override
  List<Object?> get props => [isOnline];
}

class LoadVendorProfile extends VendorEvent {}
class LoadVendorTransactions extends VendorEvent {}

class UpdateVendorProfileEvent extends VendorEvent {
  final String fullName;
  final String? phone;

  const UpdateVendorProfileEvent({required this.fullName, this.phone});

  @override
  List<Object?> get props => [fullName, phone];
}

class UpdateBidStatusEvent extends VendorEvent {
  final int bidId;
  final String status;

  const UpdateBidStatusEvent({required this.bidId, required this.status});

  @override
  List<Object?> get props => [bidId, status];
}

class UpdateBidEvent extends VendorEvent {
  final int bidId;
  final double price;
  final String duration;
  final String description;

  const UpdateBidEvent({
    required this.bidId,
    required this.price,
    required this.duration,
    required this.description,
  });

  @override
  List<Object?> get props => [bidId, price, duration, description];
}

class SubmitBidEvent extends VendorEvent {
  final int requestId;
  final double price;
  final String duration;
  final String description;
  final List<String>? images;

  const SubmitBidEvent({
    required this.requestId,
    required this.price,
    required this.duration,
    required this.description,
    this.images,
  });

  @override
  List<Object?> get props => [requestId, price, duration, description, images];
}

class RequestWithdrawalEvent extends VendorEvent {
  final double amount;
  const RequestWithdrawalEvent(this.amount);
  @override
  List<Object?> get props => [amount];
}

// --- States ---
class VendorState extends Equatable {
  final List<Request> openRequests;
  final List<Bid> myBids;
  final VendorProfile? vendorProfile;
  final List<VendorTransaction> vendorTransactions;
  final bool isLoading;
  final String? error;
  final Bid? lastSubmittedBid;
  final bool withdrawalSuccess;

  const VendorState({
    this.openRequests = const [],
    this.myBids = const [],
    this.vendorProfile,
    this.vendorTransactions = const [],
    this.isLoading = false,
    this.error,
    this.lastSubmittedBid,
    this.withdrawalSuccess = false,
  });

  VendorState copyWith({
    List<Request>? openRequests,
    List<Bid>? myBids,
    VendorProfile? vendorProfile,
    List<VendorTransaction>? vendorTransactions,
    bool? isLoading,
    String? error,
    Bid? lastSubmittedBid,
    bool? withdrawalSuccess,
  }) {
    return VendorState(
      openRequests: openRequests ?? this.openRequests,
      myBids: myBids ?? this.myBids,
      vendorProfile: vendorProfile ?? this.vendorProfile,
      vendorTransactions: vendorTransactions ?? this.vendorTransactions,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      lastSubmittedBid: lastSubmittedBid ?? this.lastSubmittedBid,
      withdrawalSuccess: withdrawalSuccess ?? this.withdrawalSuccess,
    );
  }

  @override
  List<Object?> get props => [
    openRequests,
    myBids,
    vendorProfile,
    vendorTransactions,
    isLoading,
    error,
    lastSubmittedBid,
    withdrawalSuccess,
  ];
}

// --- BLoC ---
class VendorBloc extends Bloc<VendorEvent, VendorState> {
  final VendorRepository _vendorRepository;

  VendorBloc()
    : _vendorRepository = sl<VendorRepository>(),
      super(const VendorState()) {
    on<LoadOpenRequests>(_onLoadOpenRequests);
    on<LoadMyBids>(_onLoadMyBids);
    on<LoadVendorProfile>(_onLoadVendorProfile);
    on<LoadVendorTransactions>(_onLoadVendorTransactions);
    on<SubmitBidEvent>(_onSubmitBid);
    on<UpdateBidStatusEvent>(_onUpdateBidStatus);
    on<UpdateBidEvent>(_onUpdateBid);
    on<RequestWithdrawalEvent>(_onRequestWithdrawal);
    on<UpdateVendorProfileEvent>(_onUpdateVendorProfile);
    on<UpdateOnlineStatusEvent>(_onUpdateOnlineStatus);
  }

  Future<void> _onLoadVendorProfile(
    LoadVendorProfile event,
    Emitter<VendorState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, error: null));
    final result = await _vendorRepository.getVendorProfile();
    result.fold(
      (failure) => emit(state.copyWith(error: failure.message, isLoading: false)),
      (profile) => emit(state.copyWith(vendorProfile: profile, isLoading: false)),
    );
  }

  Future<void> _onLoadVendorTransactions(
    LoadVendorTransactions event,
    Emitter<VendorState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, error: null));
    final result = await _vendorRepository.getVendorTransactions();
    result.fold(
      (failure) => emit(state.copyWith(error: failure.message, isLoading: false)),
      (transactions) => emit(state.copyWith(vendorTransactions: transactions, isLoading: false)),
    );
  }

  Future<void> _onLoadOpenRequests(
    LoadOpenRequests event,
    Emitter<VendorState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, error: null));
    final result = await _vendorRepository.getOpenRequests(
      governorateId: event.governorateId,
      cityId: event.cityId,
    );
    result.fold(
      (failure) => emit(state.copyWith(error: failure.message, isLoading: false)),
      (requests) => emit(state.copyWith(openRequests: requests, isLoading: false)),
    );
  }

  Future<void> _onLoadMyBids(
    LoadMyBids event,
    Emitter<VendorState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, error: null));
    final result = await _vendorRepository.getMyBids();
    result.fold(
      (failure) => emit(state.copyWith(error: failure.message, isLoading: false)),
      (bids) => emit(state.copyWith(myBids: bids, isLoading: false)),
    );
  }

  Future<void> _onSubmitBid(
    SubmitBidEvent event,
    Emitter<VendorState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, error: null));
    final result = await _vendorRepository.submitBid(
      requestId: event.requestId,
      price: event.price,
      duration: event.duration,
      description: event.description,
      images: event.images,
    );
    result.fold(
      (failure) => emit(state.copyWith(error: failure.message, isLoading: false)),
      (bid) => emit(state.copyWith(lastSubmittedBid: bid, isLoading: false)),
    );
  }

  Future<void> _onUpdateBidStatus(
    UpdateBidStatusEvent event,
    Emitter<VendorState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, error: null));
    final result = await _vendorRepository.updateBidStatus(
      bidId: event.bidId,
      status: event.status,
    );
    result.fold(
      (failure) => emit(state.copyWith(error: failure.message, isLoading: false)),
      (_) async {
        final bidsResult = await _vendorRepository.getMyBids();
        bidsResult.fold(
          (failure) => emit(state.copyWith(error: failure.message, isLoading: false)),
          (bids) => emit(state.copyWith(myBids: bids, isLoading: false)),
        );
      },
    );
  }

  Future<void> _onUpdateBid(
    UpdateBidEvent event,
    Emitter<VendorState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, error: null));
    final result = await _vendorRepository.updateBid(
      bidId: event.bidId,
      price: event.price,
      duration: event.duration,
      description: event.description,
    );
    result.fold(
      (failure) => emit(state.copyWith(error: failure.message, isLoading: false)),
      (_) async {
        final bidsResult = await _vendorRepository.getMyBids();
        bidsResult.fold(
          (failure) => emit(state.copyWith(error: failure.message, isLoading: false)),
          (bids) => emit(state.copyWith(myBids: bids, isLoading: false)),
        );
      },
    );
  }

  Future<void> _onRequestWithdrawal(
    RequestWithdrawalEvent event,
    Emitter<VendorState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, error: null, withdrawalSuccess: false));
    final result = await _vendorRepository.requestWithdrawal(event.amount);
    result.fold(
      (failure) => emit(state.copyWith(error: failure.message, isLoading: false)),
      (_) => emit(state.copyWith(withdrawalSuccess: true, isLoading: false)),
    );
  }

  Future<void> _onUpdateVendorProfile(
    UpdateVendorProfileEvent event,
    Emitter<VendorState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, error: null));
    final result = await _vendorRepository.updateVendorProfile(
      fullName: event.fullName,
      phone: event.phone,
    );
    result.fold(
      (failure) => emit(state.copyWith(error: failure.message, isLoading: false)),
      (profile) => emit(state.copyWith(vendorProfile: profile, isLoading: false)),
    );
  }

  Future<void> _onUpdateOnlineStatus(
    UpdateOnlineStatusEvent event,
    Emitter<VendorState> emit,
  ) async {
    // We don't necessarily need to emit loading for this background-like task
    await _vendorRepository.updateOnlineStatus(event.isOnline);
  }
}
