import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../entities/request.dart';

abstract class RequestRepository {
  Future<Either<Failure, Request>> createRequest({
    required String title,
    required String description,
    required int categoryId,
    required List<dynamic> images,
    int? brandId,
    double? latitude,
    double? longitude,
    String? address,
    int? governorateId,
    int? cityId,
    String? deliveryPhone,
  });

  Future<Either<Failure, List<Request>>> getMyRequests();
  Future<Either<Failure, List<Request>>> getActiveRequests({int limit = 10});

  Future<Either<Failure, Request>> getRequestDetails(int requestId);

  Future<Either<Failure, String>> uploadImage(String filePath);
  Future<Either<Failure, Map<String, dynamic>>> uploadImageMetadata(String filePath);

  // New: Smart Request lifecycle methods
  Future<Either<Failure, void>> selectBid(int requestId, int bidId);
  Future<Either<Failure, Map<String, dynamic>>> payRequest(int requestId);
  Future<Either<Failure, void>> confirmReceipt(int requestId, {String? qrCode});
  Future<Either<Failure, void>> addReview({
    required int requestId,
    required int rating,
    String? comment,
  });
}
