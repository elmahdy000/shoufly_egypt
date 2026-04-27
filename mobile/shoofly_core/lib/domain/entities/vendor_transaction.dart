import 'package:equatable/equatable.dart';

class VendorTransaction extends Equatable {
  final int id;
  final double amount;
  final String type;
  final String? description;
  final DateTime createdAt;
  final String? status;

  const VendorTransaction({
    required this.id,
    required this.amount,
    required this.type,
    this.description,
    required this.createdAt,
    this.status,
  });

  @override
  List<Object?> get props => [id, amount, type, description, createdAt, status];
}
