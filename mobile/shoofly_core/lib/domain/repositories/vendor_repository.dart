import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../entities/vendor_profile.dart';
import '../entities/vendor_transaction.dart';
import '../entities/bid.dart';
import '../entities/request.dart';

abstract class VendorRepository {
  Future<Either<Failure, List<Request>>> getOpenRequests({int? governorateId, int? cityId});
  
  Future<Either<Failure, List<Bid>>> getMyBids();
  
  Future<Either<Failure, Bid>> submitBid({
    required int requestId,
    required double price,
    required String duration,
    required String description,
    List<String>? images,
  });

  Future<Either<Failure, void>> updateBidStatus({
    required int bidId,
    required String status,
  });

  Future<Either<Failure, Bid>> updateBid({
    required int bidId,
    required double price,
    required String duration,
    required String description,
  });

  Future<Either<Failure, VendorProfile>> getVendorProfile();
  
  Future<Either<Failure, VendorProfile>> updateVendorProfile({
    required String fullName,
    String? phone,
  });

  Future<Either<Failure, List<VendorTransaction>>> getVendorTransactions();

  Future<Either<Failure, void>> updateOnlineStatus(bool isOnline);

  Future<Either<Failure, void>> requestWithdrawal(double amount);
}
