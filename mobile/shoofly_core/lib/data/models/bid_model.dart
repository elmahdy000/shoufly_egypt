import '../../domain/entities/bid.dart';

class BidModel extends Bid {
  const BidModel({
    required super.id,
    required super.requestId,
    super.requestTitle,
    required super.vendorId,
    required super.vendorName,
    required super.vendorRating,
    super.vendorAvatar,
    required super.price,
    required super.duration,
    required super.notes,
    required super.status,
    super.deliveryStatus,
    required super.createdAt,
  });

  factory BidModel.fromJson(Map<String, dynamic> json) {
    final vendor = json['vendor'] is Map<String, dynamic>
        ? json['vendor'] as Map<String, dynamic>
        : const <String, dynamic>{};
    final request = json['request'] is Map<String, dynamic>
        ? json['request'] as Map<String, dynamic>
        : const <String, dynamic>{};
    final tracking = request['deliveryTracking'] is List
        ? request['deliveryTracking'] as List
        : const [];
    final latestTracking = tracking.isNotEmpty && tracking.first is Map
        ? tracking.first as Map
        : const {};

    final id = int.tryParse(json['id']?.toString() ?? '') ?? 0;
    final requestId = int.tryParse(json['requestId']?.toString() ?? '') ?? 0;
    final vendorId = int.tryParse(json['vendorId']?.toString() ?? '') ?? 0;

    return BidModel(
      id: id,
      requestId: requestId,
      requestTitle: request['title']?.toString(),
      vendorId: vendorId,
      vendorName: vendor['fullName']?.toString() ?? 'مورد #$vendorId',
      // 0.0 signals "no rating data" — UI should check and show "مورد جديد" instead of a score
      vendorRating: vendor['rating'] != null
          ? (double.tryParse(vendor['rating'].toString()) ?? 0.0)
          : 0.0,
      vendorAvatar: vendor['avatarUrl']?.toString(),
      price:
          double.tryParse(
            (json['clientPrice'] ?? json['netPrice'] ?? 0).toString(),
          ) ??
          0.0,
      duration: json['duration']?.toString() ?? '',
      notes: json['description']?.toString() ?? '',
      status: _mapStatus(json['status']?.toString()),
      deliveryStatus: latestTracking['status']?.toString(),
      createdAt:
          DateTime.tryParse(json['createdAt']?.toString() ?? '') ??
          DateTime.now(),
    );
  }

  static BidStatus _mapStatus(String? status) {
    switch (status) {
      case 'PENDING':
        return BidStatus.PENDING;
      case 'SELECTED':
        return BidStatus.SELECTED;
      case 'ACCEPTED_BY_CLIENT':
        return BidStatus.ACCEPTED_BY_CLIENT;
      case 'REJECTED':
        return BidStatus.REJECTED;
      case 'WITHDRAWN':
        return BidStatus.WITHDRAWN;
      default:
        return BidStatus.PENDING;
    }
  }
}
