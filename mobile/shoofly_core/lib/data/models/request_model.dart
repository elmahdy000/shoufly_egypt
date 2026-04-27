import '../../domain/entities/request.dart';
import 'bid_model.dart';
import 'delivery_tracking_model.dart';
import 'user_model.dart';
import 'brand_model.dart';

class RequestModel extends Request {
  const RequestModel({
    required super.id,
    required super.userId,
    required super.title,
    required super.description,
    required super.categoryId,
    super.categoryName,
    super.categoryNameAr,
    required super.images,
    required super.status,
    super.latitude,
    super.longitude,
    super.address,
    required super.createdAt,
    super.bids,
    super.selectedBidId,
    super.deliveryTracking,
    super.deliveryAgent,
    super.brandId,
    super.brand,
    super.qrCode,
  });

  factory RequestModel.fromJson(Map<String, dynamic> json) {
    final category = json['category'] is Map<String, dynamic>
        ? json['category'] as Map<String, dynamic>
        : const <String, dynamic>{};
    final client = json['client'] is Map<String, dynamic>
        ? json['client'] as Map<String, dynamic>
        : const <String, dynamic>{};

    return RequestModel(
      id: int.tryParse(json['id']?.toString() ?? '') ?? 0,
      userId: int.tryParse((json['clientId'] ?? client['id'])?.toString() ?? '') ?? 0,
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      categoryId: int.tryParse((json['categoryId'] ?? category['id'])?.toString() ?? '') ?? 0,
      categoryName: category['name']?.toString(),
      categoryNameAr: category['nameAr']?.toString(),
      images: json['images'] != null
          ? (json['images'] as List).map((img) => img is String ? img : (img['filePath'] ?? '').toString()).toList()
          : [],
      status: _mapStatus(json['status']?.toString()),
      latitude: json['latitude'] != null ? double.tryParse(json['latitude'].toString()) : null,
      longitude: json['longitude'] != null ? double.tryParse(json['longitude'].toString()) : null,
      address: json['address']?.toString() ?? '',
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
      bids: json['bids'] != null 
          ? (json['bids'] as List)
              .whereType<Map<String, dynamic>>()
              .map((i) => BidModel.fromJson(i))
              .toList()
          : null,
      selectedBidId: int.tryParse(json['selectedBidId']?.toString() ?? ''),
      deliveryTracking: json['deliveryTracking'] != null
          ? (json['deliveryTracking'] as List).map((i) => DeliveryTrackingModel.fromJson(i)).toList()
          : null,
      deliveryAgent: json['deliveryAgent'] != null ? UserModel.fromJson(json['deliveryAgent'] as Map<String, dynamic>).toEntity() : null,
      brandId: json['brandId'] != null ? int.tryParse(json['brandId'].toString()) : null,
      brand: json['brand'] != null ? BrandModel.fromJson(json['brand'] as Map<String, dynamic>) : null,
      qrCode: json['qrCode']?.toString(),
    );
  }

  static RequestStatus _mapStatus(String? status) {
    switch (status) {
      case 'PENDING_ADMIN_REVISION': return RequestStatus.PENDING_ADMIN_REVISION;
      case 'OPEN_FOR_BIDDING': return RequestStatus.OPEN_FOR_BIDDING;
      case 'BIDS_RECEIVED': return RequestStatus.BIDS_RECEIVED;
      case 'OFFERS_FORWARDED': return RequestStatus.OFFERS_FORWARDED;
      case 'ORDER_PAID_PENDING_DELIVERY': return RequestStatus.ORDER_PAID_PENDING_DELIVERY;
      case 'CLOSED_SUCCESS': return RequestStatus.CLOSED_SUCCESS;
      case 'CLOSED_CANCELLED': return RequestStatus.CLOSED_CANCELLED;
      case 'REJECTED': return RequestStatus.REJECTED;
      default: return RequestStatus.OPEN_FOR_BIDDING;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'categoryId': categoryId,
      'images': images,
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
      'brandId': brandId,
    };
  }
}
