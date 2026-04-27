import 'package:dartz/dartz.dart';
import '../../core/errors/exceptions.dart';
import '../../core/errors/failures.dart';
import 'package:shoofly_core/domain/entities/wallet.dart';
import 'package:shoofly_core/domain/entities/wallet_transaction.dart';
import 'package:shoofly_core/domain/repositories/wallet_repository.dart';
import '../datasources/wallet_remote_data_source.dart';

class WalletRepositoryImpl implements WalletRepository {
  final WalletRemoteDataSource remoteDataSource;

  WalletRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<Failure, Wallet>> getBalance() async {
    try {
      final wallet = await remoteDataSource.getBalance();
      return Right(wallet);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return const Left(ServerFailure('حدث خطأ أثناء جلب الرصيد'));
    }
  }

  @override
  Future<Either<Failure, String>> topUp(double amount) async {
    try {
      final response = await remoteDataSource.topUp(amount);
      if (response.success) {
        return Right(response.redirectUrl);
      } else {
        return const Left(ServerFailure('فشل عملية الشحن'));
      }
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return const Left(ServerFailure('حدث خطأ أثناء الشحن'));
    }
  }

  @override
  Future<Either<Failure, List<WalletTransaction>>> getTransactions() async {
    try {
      final transactions = await remoteDataSource.getTransactions();
      return Right(transactions);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return const Left(ServerFailure('حدث خطأ أثناء جلب سجل العمليات'));
    }
  }
}
