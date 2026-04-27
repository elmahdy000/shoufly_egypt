/// Request model for marketplace requests
class RequestModel {
  final String id;
  final String title;
  final String? description;
  final String status;
  final String? categoryId;
  final String? categoryName;
  final String? location;
  final double? budget;
  final List<String>? images;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final String? clientName;
  final int? bidCount;

  RequestModel({
    required this.id,
    required this.title,
    this.description,
    required this.status,
    this.categoryId,
    this.categoryName,
    this.location,
    this.budget,
    this.images,
    required this.createdAt,
    this.updatedAt,
    this.clientName,
    this.bidCount,
  });

  factory RequestModel.fromJson(Map<String, dynamic> json) => RequestModel(
        id: json['id'].toString(),
        title: json['title'] as String,
        description: json['description'] as String?,
        status: json['status'] as String,
        categoryId: json['categoryId']?.toString(),
        categoryName: json['categoryName'] as String?,
        location: json['location'] as String?,
        budget: json['budget'] != null ? double.tryParse(json['budget'].toString()) : null,
        images: json['images'] != null
            ? List<String>.from(json['images'] as List)
            : null,
        createdAt: DateTime.parse(json['createdAt'] as String),
        updatedAt: json['updatedAt'] != null
            ? DateTime.parse(json['updatedAt'] as String)
            : null,
        clientName: json['clientName'] as String?,
        bidCount: json['bidCount'] as int?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'status': status,
        'categoryId': categoryId,
        'categoryName': categoryName,
        'location': location,
        'budget': budget,
        'images': images,
        'createdAt': createdAt.toIso8601String(),
        'updatedAt': updatedAt?.toIso8601String(),
        'clientName': clientName,
        'bidCount': bidCount,
      };

  /// Get status display name in Arabic
  String get statusDisplayName {
    switch (status) {
      case 'DRAFT':
        return 'مسودة';
      case 'PENDING_ADMIN_REVISION':
        return 'قيد المراجعة';
      case 'OPEN_FOR_BIDDING':
        return 'مفتوح للعروض';
      case 'BIDDING_CLOSED':
        return 'مغلق للعروض';
      case 'CLIENT_ACCEPTED_VENDOR':
        return 'تم قبول العرض';
      case 'VENDOR_ACCEPTED':
        return 'تم تأكيد العرض';
      case 'ORDER_PAID_PENDING_DELIVERY':
        return 'مدفوع - قيد التوصيل';
      case 'OUT_FOR_DELIVERY':
        return 'في الطريق';
      case 'DELIVERED_CONFIRMATION_PENDING':
        return 'في انتظار التأكيد';
      case 'CLOSED_SUCCESS':
        return 'مكتمل';
      case 'REFUNDED':
        return 'تم الاسترداد';
      case 'CANCELLED':
        return 'ملغي';
      default:
        return status;
    }
  }

  /// Get status color hex
  String get statusColor {
    switch (status) {
      case 'DRAFT':
        return '#9CA3AF';
      case 'PENDING_ADMIN_REVISION':
        return '#F59E0B';
      case 'OPEN_FOR_BIDDING':
        return '#10B981';
      case 'BIDDING_CLOSED':
        return '#6B7280';
      case 'CLIENT_ACCEPTED_VENDOR':
      case 'VENDOR_ACCEPTED':
        return '#3B82F6';
      case 'ORDER_PAID_PENDING_DELIVERY':
      case 'OUT_FOR_DELIVERY':
        return '#8B5CF6';
      case 'DELIVERED_CONFIRMATION_PENDING':
        return '#F59E0B';
      case 'CLOSED_SUCCESS':
        return '#10B981';
      case 'REFUNDED':
      case 'CANCELLED':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  }
}

/// Request status enum for type safety
enum RequestStatus {
  draft,
  pendingAdminRevision,
  openForBidding,
  biddingClosed,
  clientAcceptedVendor,
  vendorAccepted,
  orderPaidPendingDelivery,
  outForDelivery,
  deliveredConfirmationPending,
  closedSuccess,
  refunded,
  cancelled;

  String get apiValue {
    switch (this) {
      case RequestStatus.draft:
        return 'DRAFT';
      case RequestStatus.pendingAdminRevision:
        return 'PENDING_ADMIN_REVISION';
      case RequestStatus.openForBidding:
        return 'OPEN_FOR_BIDDING';
      case RequestStatus.biddingClosed:
        return 'BIDDING_CLOSED';
      case RequestStatus.clientAcceptedVendor:
        return 'CLIENT_ACCEPTED_VENDOR';
      case RequestStatus.vendorAccepted:
        return 'VENDOR_ACCEPTED';
      case RequestStatus.orderPaidPendingDelivery:
        return 'ORDER_PAID_PENDING_DELIVERY';
      case RequestStatus.outForDelivery:
        return 'OUT_FOR_DELIVERY';
      case RequestStatus.deliveredConfirmationPending:
        return 'DELIVERED_CONFIRMATION_PENDING';
      case RequestStatus.closedSuccess:
        return 'CLOSED_SUCCESS';
      case RequestStatus.refunded:
        return 'REFUNDED';
      case RequestStatus.cancelled:
        return 'CANCELLED';
    }
  }
}
