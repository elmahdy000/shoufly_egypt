import 'package:equatable/equatable.dart';

enum TransactionType {
  TOP_UP,
  PAYMENT,
  REFUND,
  CREDIT,
}

enum TransactionStatus {
  PENDING,
  COMPLETED,
  FAILED,
}

class WalletTransaction extends Equatable {
  final String id;
  final TransactionType type;
  final double amount;
  final String? description;
  final DateTime createdAt;
  final TransactionStatus? status;

  const WalletTransaction({
    required this.id,
    required this.type,
    required this.amount,
    this.description,
    required this.createdAt,
    this.status,
  });

  @override
  List<Object?> get props => [id, type, amount, description, createdAt, status];
}
