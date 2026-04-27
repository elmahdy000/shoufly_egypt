import 'package:dio/dio.dart';
import 'package:shoofly_core/data/models/wallet_model.dart';
import 'package:shoofly_core/data/models/wallet_transaction_model.dart';
import 'package:shoofly_core/core/errors/exceptions.dart';

abstract class WalletRemoteDataSource {
  Future<WalletModel> getBalance();
  Future<TopUpResponseModel> topUp(double amount);
  Future<List<WalletTransactionModel>> getTransactions();
}

class WalletRemoteDataSourceImpl implements WalletRemoteDataSource {
  final Dio dio;

  WalletRemoteDataSourceImpl({required this.dio});

  @override
  Future<WalletModel> getBalance() async {
    try {
      final response = await dio.get('/client/wallet');
      return WalletModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ServerException(message: e.response?.data['error'] ?? 'فشل استرجاع رصيد المحفظة');
    } catch (e) {
      throw ServerException(message: 'حدث خطأ غير متوقع');
    }
  }

  @override
  Future<TopUpResponseModel> topUp(double amount) async {
    try {
      final response = await dio.post(
        '/client/wallet',
        data: {'action': 'topup', 'amount': amount},
      );
      return TopUpResponseModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ServerException(message: e.response?.data['error'] ?? 'فشل عملية الشحن');
    } catch (e) {
      throw ServerException(message: 'حدث خطأ غير متوقع');
    }
  }

  @override
  Future<List<WalletTransactionModel>> getTransactions() async {
    try {
      final response = await dio.get('/client/transactions');
      final List<dynamic> data = response.data is List 
          ? response.data 
          : (response.data['transactions'] ?? []);
      return data.map((json) => WalletTransactionModel.fromJson(json as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      throw ServerException(message: e.response?.data['error'] ?? 'فشل استرجاع سجل العمليات');
    } catch (e) {
      throw ServerException(message: 'حدث خطأ غير متوقع');
    }
  }
}
