import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../core/errors/exceptions.dart';
import '../../domain/entities/bid.dart';
import '../../domain/entities/request.dart';
import '../../domain/entities/vendor_profile.dart';
import '../../domain/entities/vendor_transaction.dart';
import '../../domain/repositories/vendor_repository.dart';
import '../../features/vendor/data/vendor_service.dart';
import '../models/vendor_profile_model.dart';
import '../models/vendor_transaction_model.dart';

class VendorRepositoryImpl implements VendorRepository {
  final VendorService _vendorService;

  VendorRepositoryImpl(this._vendorService);

  @override
  Future<Either<Failure, List<Request>>> getOpenRequests({int? governorateId, int? cityId}) async {
    try {
      final requests = await _vendorService.getOpenRequests(
        governorateId: governorateId,
        cityId: cityId,
      );
      return Right(requests);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<Bid>>> getMyBids() async {
    try {
      final bids = await _vendorService.getMyBids();
      return Right(bids);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, Bid>> submitBid({
    required int requestId,
    required double price,
    required String duration,
    required String description,
    List<String>? images,
  }) async {
    try {
      final bid = await _vendorService.submitBid(
        requestId: requestId,
        price: price,
        duration: duration,
        description: description,
        images: images,
      );
      return Right(bid);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> updateBidStatus({
    required int bidId,
    required String status,
  }) async {
    try {
      await _vendorService.updateBidStatus(bidId: bidId, status: status);
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, Bid>> updateBid({
    required int bidId,
    required double price,
    required String duration,
    required String description,
  }) async {
    try {
      final bid = await _vendorService.updateBid(
        bidId: bidId,
        price: price,
        duration: duration,
        description: description,
      );
      return Right(bid);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, VendorProfile>> getVendorProfile() async {
    try {
      final data = await _vendorService.getVendorProfile();
      return Right(VendorProfileModel.fromJson(data));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, VendorProfile>> updateVendorProfile({
    required String fullName,
    String? phone,
  }) async {
    try {
      final data = await _vendorService.updateProfile(
        fullName: fullName,
        phone: phone,
      );
      return Right(VendorProfileModel.fromJson(data));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<VendorTransaction>>> getVendorTransactions() async {
    try {
      final data = await _vendorService.getVendorTransactions();
      return Right(data.map((json) => VendorTransactionModel.fromJson(json as Map<String, dynamic>)).toList());
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> requestWithdrawal(double amount) async {
    try {
      await _vendorService.requestWithdrawal(amount);
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> updateOnlineStatus(bool isOnline) async {
    return const Right(null);
  }
}
