import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import 'package:shoofly_core/domain/entities/wallet.dart';
import 'package:shoofly_core/domain/entities/wallet_transaction.dart';

abstract class WalletRepository {
  Future<Either<Failure, Wallet>> getBalance();
  Future<Either<Failure, String>> topUp(double amount); // Returns redirect URL
  Future<Either<Failure, List<WalletTransaction>>> getTransactions();
}
