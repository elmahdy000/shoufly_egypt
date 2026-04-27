import 'package:dartz/dartz.dart';
import '../../core/errors/exceptions.dart';
import '../../core/errors/failures.dart';
import '../../domain/entities/request.dart';
import '../../domain/repositories/request_repository.dart';
import '../datasources/request_remote_data_source.dart';

class RequestRepositoryImpl implements RequestRepository {
  final RequestRemoteDataSource remoteDataSource;

  RequestRepositoryImpl({required this.remoteDataSource});

  @override
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
  }) async {
    try {
      final result = await remoteDataSource.createRequest(
        title: title,
        description: description,
        categoryId: categoryId,
        images: images,
        brandId: brandId,
        latitude: latitude,
        longitude: longitude,
        address: address,
        governorateId: governorateId,
        cityId: cityId,
        deliveryPhone: deliveryPhone,
      );
      return Right(result);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return const Left(ServerFailure('فشل في إنشاء الطلب'));
    }
  }

  @override
  Future<Either<Failure, List<Request>>> getMyRequests() async {
    try {
      final result = await remoteDataSource.getMyRequests();
      return Right(result);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return const Left(ServerFailure('فشل في تحميل الطلبات'));
    }
  }

  @override
  Future<Either<Failure, List<Request>>> getActiveRequests({int limit = 10}) async {
    try {
      final result = await remoteDataSource.getActiveRequests(limit: limit);
      return Right(result);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return const Left(ServerFailure('فشل في تحميل الطلبات النشطة'));
    }
  }

  @override
  Future<Either<Failure, Request>> getRequestDetails(int requestId) async {
    try {
      final result = await remoteDataSource.getRequestDetails(requestId);
      return Right(result);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return const Left(ServerFailure('فشل في تحميل تفاصيل الطلب'));
    }
  }

  @override
  Future<Either<Failure, String>> uploadImage(String filePath) async {
    try {
      final result = await remoteDataSource.uploadImage(filePath);
      return Right(result);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return const Left(ServerFailure('فشل في رفع الصورة'));
    }
  }

  @override
  Future<Either<Failure, Map<String, dynamic>>> uploadImageMetadata(String filePath) async {
    try {
      final result = await remoteDataSource.uploadImageMetadata(filePath);
      return Right(result);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return const Left(ServerFailure('فشل في رفع الصورة'));
    }
  }

  @override
  Future<Either<Failure, void>> selectBid(int requestId, int bidId) async {
    try {
      await remoteDataSource.selectBid(requestId, bidId);
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return const Left(ServerFailure('فشل في قبول العرض'));
    }
  }

  @override
  Future<Either<Failure, Map<String, dynamic>>> payRequest(int requestId) async {
    try {
      final result = await remoteDataSource.payRequest(requestId);
      return Right(result);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return const Left(ServerFailure('فشل في عملية الدفع'));
    }
  }

  @override
  Future<Either<Failure, void>> confirmReceipt(int requestId, {String? qrCode}) async {
    try {
      await remoteDataSource.confirmReceipt(requestId, qrCode: qrCode);
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return const Left(ServerFailure('فشل في تأكيد الاستلام'));
    }
  }

  @override
  Future<Either<Failure, void>> addReview({
    required int requestId,
    required int rating,
    String? comment,
  }) async {
    try {
      await remoteDataSource.addReview(
        requestId: requestId,
        rating: rating,
        comment: comment,
      );
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return const Left(ServerFailure('فشل في إضافة التقييم'));
    }
  }
}
