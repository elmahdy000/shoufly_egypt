import 'package:shoofly_core/domain/entities/wallet.dart';

class WalletModel extends Wallet {
  const WalletModel({required super.balance});

  factory WalletModel.fromJson(Map<String, dynamic> json) {
    return WalletModel(
      balance: double.tryParse((json['balance'] ?? 0).toString()) ?? 0.0,
    );
  }
}

class TopUpResponseModel {
  final bool success;
  final String redirectUrl;
  final int transactionId;

  TopUpResponseModel({
    required this.success,
    required this.redirectUrl,
    required this.transactionId,
  });

  factory TopUpResponseModel.fromJson(Map<String, dynamic> json) {
    return TopUpResponseModel(
      success: json['success'] ?? false,
      redirectUrl: json['redirectUrl'] ?? '',
      transactionId: json['transactionId'] ?? 0,
    );
  }
}
