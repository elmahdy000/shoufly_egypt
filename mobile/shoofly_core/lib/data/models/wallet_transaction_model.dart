import 'package:shoofly_core/domain/entities/wallet_transaction.dart';

class WalletTransactionModel extends WalletTransaction {
  const WalletTransactionModel({
    required super.id,
    required super.type,
    required super.amount,
    super.description,
    required super.createdAt,
    super.status,
  });

  factory WalletTransactionModel.fromJson(Map<String, dynamic> json) {
    return WalletTransactionModel(
      id: json['id']?.toString() ?? '',
      type: _parseType(json['type']),
      amount: double.tryParse((json['amount'] ?? 0).toString()) ?? 0.0,
      description: json['description'],
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']) 
          : DateTime.now(),
      status: _parseStatus(json['status']),
    );
  }

  static TransactionType _parseType(String? type) {
    switch (type) {
      case 'TOP_UP': return TransactionType.TOP_UP;
      case 'PAYMENT': return TransactionType.PAYMENT;
      case 'REFUND': return TransactionType.REFUND;
      case 'CREDIT': return TransactionType.CREDIT;
      default: return TransactionType.PAYMENT;
    }
  }

  static TransactionStatus? _parseStatus(String? status) {
    switch (status) {
      case 'PENDING': return TransactionStatus.PENDING;
      case 'COMPLETED': return TransactionStatus.COMPLETED;
      case 'FAILED': return TransactionStatus.FAILED;
      default: return null;
    }
  }
}
