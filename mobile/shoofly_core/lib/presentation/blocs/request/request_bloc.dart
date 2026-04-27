import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/utils/error_messages.dart';
import '../../../domain/entities/request.dart';
import '../../../domain/repositories/request_repository.dart';

// --- Events ---
abstract class RequestEvent extends Equatable {
  const RequestEvent();
  @override
  List<Object?> get props => [];
}

class LoadMyRequests extends RequestEvent {}

class LoadActiveRequests extends RequestEvent {}

class LoadRequestDetails extends RequestEvent {
  final int requestId;
  const LoadRequestDetails(this.requestId);
  @override
  List<Object?> get props => [requestId];
}

class UploadImage extends RequestEvent {
  final String filePath;
  const UploadImage(this.filePath);
  @override
  List<Object?> get props => [filePath];
}

class CreateRequestSubmitted extends RequestEvent {
  final String title;
  final String description;
  final int categoryId;
  final List<dynamic> images;
  final int? brandId;
  final double? latitude;
  final double? longitude;
  final String? address;
  final int? governorateId;
  final int? cityId;
  final String? deliveryPhone;

  const CreateRequestSubmitted({
    required this.title,
    required this.description,
    required this.categoryId,
    required this.images,
    this.brandId,
    this.latitude,
    this.longitude,
    this.address,
    this.governorateId,
    this.cityId,
    this.deliveryPhone,
  });

  @override
  List<Object?> get props => [
    title,
    description,
    categoryId,
    images,
    brandId,
    latitude,
    longitude,
    address,
    governorateId,
    cityId,
    deliveryPhone,
  ];
}

class SelectBidEvent extends RequestEvent {
  final int requestId;
  final int bidId;
  const SelectBidEvent(this.requestId, this.bidId);
  @override
  List<Object?> get props => [requestId, bidId];
}

class PayRequestEvent extends RequestEvent {
  final int requestId;
  const PayRequestEvent(this.requestId);
  @override
  List<Object?> get props => [requestId];
}

class ConfirmReceiptEvent extends RequestEvent {
  final int requestId;
  final String? qrCode;
  const ConfirmReceiptEvent(this.requestId, {this.qrCode});
  @override
  List<Object?> get props => [requestId, qrCode];
}

class SubmitReviewEvent extends RequestEvent {
  final int requestId;
  final int rating;
  final String? comment;
  const SubmitReviewEvent({required this.requestId, required this.rating, this.comment});
  @override
  List<Object?> get props => [requestId, rating, comment];
}

// --- State ---
abstract class RequestState extends Equatable {
  const RequestState();
  @override
  List<Object?> get props => [];
}

class RequestInitial extends RequestState {}

class RequestLoading extends RequestState {}

class RequestListLoading extends RequestState {} // Loading list of requests

class RequestDetailsLoading
    extends RequestState {} // Loading single request details

class RequestPaymentProcessing extends RequestState {} // Processing payment

class ImageUploadInProgress extends RequestState {} // Explicit: Image upload state

class RequestSubmitInProgress extends RequestState {} // Explicit: Request submission state

class RequestBidSelecting extends RequestState {} // Selecting a bid

class RequestLoaded extends RequestState {
  final List<Request> requests;
  const RequestLoaded(this.requests);
  @override
  List<Object?> get props => [requests];
}

class ActiveRequestsLoaded extends RequestState {
  final List<Request> requests;
  const ActiveRequestsLoaded(this.requests);
  @override
  List<Object?> get props => [requests];
}

class RequestDetailsLoaded extends RequestState {
  final Request request;
  const RequestDetailsLoaded(this.request);
  @override
  List<Object?> get props => [request];
}

class RequestSuccess extends RequestState {
  final Request request;
  const RequestSuccess(this.request);
  @override
  List<Object?> get props => [request];
}

class RequestActionSuccess extends RequestState {
  final String message;
  const RequestActionSuccess(this.message);
  @override
  List<Object?> get props => [message];
}

class RequestPaymentRedirect extends RequestState {
  final String redirectUrl;
  const RequestPaymentRedirect(this.redirectUrl);
  @override
  List<Object?> get props => [redirectUrl];
}

class RequestError extends RequestState {
  final String message;
  const RequestError(this.message);
  @override
  List<Object?> get props => [message];
}

class ImageUploadSuccess extends RequestState {
  final Map<String, dynamic> imageData;
  const ImageUploadSuccess(this.imageData);
  @override
  List<Object?> get props => [imageData];
}

class RequestCreateSuccess extends RequestState {
  final Request request;
  const RequestCreateSuccess({required this.request});
  @override
  List<Object?> get props => [request];
}

// --- Bloc ---
class RequestBloc extends Bloc<RequestEvent, RequestState> {
  final RequestRepository repository;

  // Prevent double-submission
  bool _isProcessingPayment = false;

  RequestBloc({required this.repository}) : super(RequestInitial()) {
    on<LoadMyRequests>(_onLoadMyRequests);
    on<LoadActiveRequests>(_onLoadActiveRequests);
    on<LoadRequestDetails>(_onLoadRequestDetails);
    on<CreateRequestSubmitted>(_onCreateRequestSubmitted);
    on<UploadImage>(_onUploadImage);
    on<SelectBidEvent>(_onSelectBid);
    on<PayRequestEvent>(_onPayRequest);
    on<ConfirmReceiptEvent>(_onConfirmReceipt);
    on<SubmitReviewEvent>(_onSubmitReview);
  }

  Future<void> _onLoadMyRequests(
    LoadMyRequests event,
    Emitter<RequestState> emit,
  ) async {
    emit(RequestListLoading());
    final result = await repository.getMyRequests();
    result.fold(
      (failure) =>
          emit(RequestError(ErrorMessages.mapFailureToMessage(failure))),
      (requests) => emit(RequestLoaded(requests)),
    );
  }

  Future<void> _onLoadActiveRequests(
    LoadActiveRequests event,
    Emitter<RequestState> emit,
  ) async {
    emit(RequestLoading());
    final result = await repository.getActiveRequests(limit: 10);
    result.fold(
      (failure) =>
          emit(RequestError(ErrorMessages.mapFailureToMessage(failure))),
      (requests) => emit(ActiveRequestsLoaded(requests)),
    );
  }

  Future<void> _onLoadRequestDetails(
    LoadRequestDetails event,
    Emitter<RequestState> emit,
  ) async {
    emit(RequestDetailsLoading());
    final result = await repository.getRequestDetails(event.requestId);
    result.fold(
      (failure) =>
          emit(RequestError(ErrorMessages.mapFailureToMessage(failure))),
      (request) => emit(RequestDetailsLoaded(request)),
    );
  }

  Future<void> _onCreateRequestSubmitted(
    CreateRequestSubmitted event,
    Emitter<RequestState> emit,
  ) async {
    // Validate required fields
    if (event.title.isEmpty || event.description.isEmpty) {
      emit(const RequestError('عنوان ووصف الطلب مطلوبان'));
      return;
    }

    // Images are optional because the client UI supports text-only requests.
    for (final imagePath in event.images) {
      if (imagePath.isEmpty) {
        emit(const RequestError('مسار الصورة غير صالح'));
        return;
      }
    }

    emit(RequestSubmitInProgress());
    final result = await repository.createRequest(
      title: event.title,
      description: event.description,
      categoryId: event.categoryId,
      brandId: event.brandId,
      address: event.address,
      latitude: event.latitude,
      longitude: event.longitude,
      governorateId: event.governorateId,
      cityId: event.cityId,
      deliveryPhone: event.deliveryPhone,
      images: event.images,
    );

    result.fold(
      (failure) =>
          emit(RequestError(ErrorMessages.mapFailureToMessage(failure))),
      (request) => emit(RequestCreateSuccess(request: request)),
    );
  }

  Future<void> _onUploadImage(
    UploadImage event,
    Emitter<RequestState> emit,
  ) async {
    emit(ImageUploadInProgress());
    final result = await repository.uploadImageMetadata(event.filePath);
    result.fold(
      (failure) =>
          emit(RequestError(ErrorMessages.mapFailureToMessage(failure))),
      (imageData) => emit(ImageUploadSuccess(imageData)),
    );
  }

  Future<void> _onSelectBid(
    SelectBidEvent event,
    Emitter<RequestState> emit,
  ) async {
    emit(RequestBidSelecting());
    final result = await repository.selectBid(event.requestId, event.bidId);
    result.fold(
      (failure) =>
          emit(RequestError(ErrorMessages.mapFailureToMessage(failure))),
      (_) => add(LoadRequestDetails(event.requestId)),
    );
  }

  Future<void> _onPayRequest(
    PayRequestEvent event,
    Emitter<RequestState> emit,
  ) async {
    // Prevent double-submission
    if (_isProcessingPayment) {
      return;
    }

    _isProcessingPayment = true;
    emit(RequestPaymentProcessing());

    final result = await repository.payRequest(event.requestId);

    _isProcessingPayment = false;

    result.fold(
      (failure) =>
          emit(RequestError(ErrorMessages.mapFailureToMessage(failure))),
      (redirectData) {
        final redirectUrl =
            redirectData['redirectUrl'] as String? ??
            redirectData['url'] as String? ??
            redirectData.toString();
        if (redirectUrl.isEmpty) {
          emit(const RequestError('فشل في إنشاء رابط الدفع'));
        } else {
          emit(RequestPaymentRedirect(redirectUrl));
        }
      },
    );
  }

  Future<void> _onConfirmReceipt(
    ConfirmReceiptEvent event,
    Emitter<RequestState> emit,
  ) async {
    emit(RequestLoading());
    final result = await repository.confirmReceipt(
      event.requestId,
      qrCode: event.qrCode,
    );
    result.fold(
      (failure) =>
          emit(RequestError(ErrorMessages.mapFailureToMessage(failure))),
      (_) => emit(
        const RequestActionSuccess(
          'تمت عملية الاستلام بنجاح، شكراً لاستخدامك شوفلي!',
        ),
      ),
    );
  }

  Future<void> _onSubmitReview(
    SubmitReviewEvent event,
    Emitter<RequestState> emit,
  ) async {
    emit(RequestLoading());
    final result = await repository.addReview(
      requestId: event.requestId,
      rating: event.rating,
      comment: event.comment,
    );
    result.fold(
      (failure) => emit(RequestError(ErrorMessages.mapFailureToMessage(failure))),
      (_) => emit(const RequestActionSuccess('شكراً لتقييمك!')),
    );
  }
}
