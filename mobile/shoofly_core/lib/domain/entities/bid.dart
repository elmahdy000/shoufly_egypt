import 'package:equatable/equatable.dart';

enum BidStatus { PENDING, SELECTED, ACCEPTED_BY_CLIENT, REJECTED, WITHDRAWN }

class Bid extends Equatable {
  final int id;
  final int requestId;
  final String? requestTitle;
  final int vendorId;
  final String vendorName;
  final double vendorRating;
  final String? vendorAvatar;
  final double price;
  final String duration; // e.g. "2 hours", "1 day"
  final String notes;
  final BidStatus status;
  final String? deliveryStatus;
  final DateTime createdAt;

  const Bid({
    required this.id,
    required this.requestId,
    this.requestTitle,
    required this.vendorId,
    required this.vendorName,
    required this.vendorRating,
    this.vendorAvatar,
    required this.price,
    required this.duration,
    required this.notes,
    required this.status,
    this.deliveryStatus,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
    id,
    requestId,
    vendorId,
    vendorName,
    vendorRating,
    vendorAvatar,
    price,
    duration,
    notes,
    status,
    deliveryStatus,
    createdAt,
  ];
}
