import 'package:equatable/equatable.dart';

class DeliveryTracking extends Equatable {
  final int id;
  final int requestId;
  final String status;
  final double latitude;
  final double longitude;
  final double? speed;
  final String? locationText;
  final DateTime createdAt;

  const DeliveryTracking({
    required this.id,
    required this.requestId,
    required this.status,
    required this.latitude,
    required this.longitude,
    this.speed,
    this.locationText,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
        id,
        requestId,
        status,
        latitude,
        longitude,
        speed,
        locationText,
        createdAt,
      ];
}
