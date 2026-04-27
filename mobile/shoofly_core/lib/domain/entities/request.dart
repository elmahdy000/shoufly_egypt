import 'package:flutter/material.dart';
import 'package:equatable/equatable.dart';
import '../../core/theme/app_colors.dart';
import 'bid.dart';
import 'delivery_tracking.dart';
import 'user.dart';
import 'brand.dart';

enum RequestStatus { 
  PENDING_ADMIN_REVISION, 
  OPEN_FOR_BIDDING, 
  BIDS_RECEIVED, 
  OFFERS_FORWARDED, 
  ORDER_PAID_PENDING_DELIVERY, 
  CLOSED_SUCCESS, 
  CLOSED_CANCELLED, 
  REJECTED 
}

class Request extends Equatable {
  final int id;
  final int userId;
  final String title;
  final String description;
  final int categoryId;
  final String? categoryName;
  final String? categoryNameAr;
  final List<String> images;
  final RequestStatus status;
  final double? latitude;
  final double? longitude;
  final String? address;
  final DateTime createdAt;
  final List<Bid>? bids;
  final int? selectedBidId;
  final List<DeliveryTracking>? deliveryTracking;
  final User? deliveryAgent;
  final int? brandId;
  final Brand? brand;
  /// Secure server-generated QR token. Used for delivery confirmation.
  final String? qrCode;

  const Request({
    required this.id,
    required this.userId,
    required this.title,
    required this.description,
    required this.categoryId,
    this.categoryName,
    this.categoryNameAr,
    required this.images,
    required this.status,
    this.latitude,
    this.longitude,
    this.address,
    required this.createdAt,
    this.bids,
    this.selectedBidId,
    this.deliveryTracking,
    this.deliveryAgent,
    this.brandId,
    this.brand,
    this.qrCode,
  });

  @override
  List<Object?> get props => [
        id,
        userId,
        title,
        description,
        categoryId,
        categoryName,
        categoryNameAr,
        images,
        status,
        latitude,
        longitude,
        address,
        createdAt,
        bids,
        selectedBidId,
        deliveryTracking,
        deliveryAgent,
        brandId,
        brand,
        qrCode,
      ];
}

extension RequestStatusX on RequestStatus {
  String get displayName {
    switch (this) {
      case RequestStatus.PENDING_ADMIN_REVISION: return 'مراجعة الإدارة';
      case RequestStatus.OPEN_FOR_BIDDING: return 'مفتوح للعروض';
      case RequestStatus.BIDS_RECEIVED: return 'عروض وصلت';
      case RequestStatus.OFFERS_FORWARDED: return 'تم اختيار عرض';
      case RequestStatus.ORDER_PAID_PENDING_DELIVERY: return 'قيد التوصيل';
      case RequestStatus.CLOSED_SUCCESS: return 'مكتمل';
      case RequestStatus.CLOSED_CANCELLED: return 'ملغي';
      case RequestStatus.REJECTED: return 'مرفوض';
    }
  }

  Color get color {
    switch (this) {
      case RequestStatus.PENDING_ADMIN_REVISION: return AppColors.warning;
      case RequestStatus.OPEN_FOR_BIDDING: return AppColors.info;
      case RequestStatus.BIDS_RECEIVED: return AppColors.success;
      case RequestStatus.OFFERS_FORWARDED: return AppColors.primary;
      case RequestStatus.ORDER_PAID_PENDING_DELIVERY: return AppColors.success;
      case RequestStatus.CLOSED_SUCCESS: return AppColors.success;
      case RequestStatus.CLOSED_CANCELLED: return AppColors.error;
      case RequestStatus.REJECTED: return AppColors.error;
    }
  }

  bool get isActive {
    return this != RequestStatus.CLOSED_SUCCESS && 
           this != RequestStatus.CLOSED_CANCELLED && 
           this != RequestStatus.REJECTED;
  }
}
