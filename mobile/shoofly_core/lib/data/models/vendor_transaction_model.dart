import '../../domain/entities/vendor_transaction.dart';

class VendorTransactionModel extends VendorTransaction {
  const VendorTransactionModel({
    required super.id,
    required super.amount,
    required super.type,
    super.description,
    required super.createdAt,
    super.status,
  });

  factory VendorTransactionModel.fromJson(Map<String, dynamic> json) {
    return VendorTransactionModel(
      id: int.tryParse(json['id']?.toString() ?? '') ?? 0,
      amount: double.tryParse(json['amount']?.toString() ?? '') ?? 0.0,
      type: json['type']?.toString() ?? 'TRANSACTION',
      description: json['description']?.toString(),
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
      status: json['status']?.toString(),
    );
  }
}
