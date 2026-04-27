import '../../domain/entities/notification.dart';

class NotificationModel extends AppNotification {
  const NotificationModel({
    required super.id,
    required super.title,
    required super.message,
    required super.type,
    required super.isRead,
    required super.createdAt,
    super.data,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'],
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      type: _mapType(json['type']),
      isRead: json['isRead'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
      data: json['data'],
    );
  }

  static NotificationType _mapType(String? type) {
    switch (type) {
      case 'NEW_BID': return NotificationType.NEW_BID;
      case 'REQUEST_ACCEPTED': return NotificationType.REQUEST_ACCEPTED;
      case 'PAYMENT_RECEIVED': return NotificationType.PAYMENT_RECEIVED;
      default: return NotificationType.SYSTEM;
    }
  }
}
