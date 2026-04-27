import '../../domain/entities/delivery_tracking.dart';

class DeliveryTrackingModel extends DeliveryTracking {
  const DeliveryTrackingModel({
    required super.id,
    required super.requestId,
    required super.status,
    required super.latitude,
    required super.longitude,
    super.speed,
    super.locationText,
    required super.createdAt,
  });

  factory DeliveryTrackingModel.fromJson(Map<String, dynamic> json) {
    return DeliveryTrackingModel(
      id: json['id'],
      requestId: json['requestId'],
      status: json['status'],
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      speed: json['speed'] != null ? (json['speed'] as num).toDouble() : null,
      locationText: json['locationText'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
