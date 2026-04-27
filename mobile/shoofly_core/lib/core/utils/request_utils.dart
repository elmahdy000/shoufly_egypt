import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../../domain/entities/request.dart';

extension RequestStatusUI on RequestStatus {
  String get displayName {
    switch (this) {
      case RequestStatus.PENDING_ADMIN_REVISION:
        return 'قيد المراجعة';
      case RequestStatus.OPEN_FOR_BIDDING:
        return 'مفتوح للعروض';
      case RequestStatus.BIDS_RECEIVED:
        return 'عروض وصلت';
      case RequestStatus.OFFERS_FORWARDED:
        return 'تم اختيار عرض';
      case RequestStatus.ORDER_PAID_PENDING_DELIVERY:
        return 'تم الدفع - قيد التوصيل';
      case RequestStatus.CLOSED_SUCCESS:
        return 'مكتمل';
      case RequestStatus.CLOSED_CANCELLED:
        return 'ملغي';
      case RequestStatus.REJECTED:
        return 'مرفوض';
    }
  }

  Color get color {
    switch (this) {
      case RequestStatus.PENDING_ADMIN_REVISION:
        return AppColors.warning;
      case RequestStatus.OPEN_FOR_BIDDING:
      case RequestStatus.OFFERS_FORWARDED:
        return AppColors.primary;
      case RequestStatus.BIDS_RECEIVED:
      case RequestStatus.ORDER_PAID_PENDING_DELIVERY:
      case RequestStatus.CLOSED_SUCCESS:
        return AppColors.success;
      case RequestStatus.CLOSED_CANCELLED:
      case RequestStatus.REJECTED:
        return AppColors.error;
    }
  }

  bool get isActive {
    return this != RequestStatus.CLOSED_SUCCESS &&
        this != RequestStatus.CLOSED_CANCELLED &&
        this != RequestStatus.REJECTED;
  }
}
