import 'package:equatable/equatable.dart';

class GovernorateModel extends Equatable {
  final int id;
  final String name;
  final String? nameAr;

  const GovernorateModel({
    required this.id,
    required this.name,
    this.nameAr,
  });

  factory GovernorateModel.fromJson(Map<String, dynamic> json) {
    return GovernorateModel(
      id: json['id'] as int,
      name: json['name'] as String,
      nameAr: json['nameAr'] as String?,
    );
  }

  @override
  List<Object?> get props => [id, name, nameAr];
}

class CityModel extends Equatable {
  final int id;
  final String name;
  final String? nameAr;
  final int governorateId;

  const CityModel({
    required this.id,
    required this.name,
    this.nameAr,
    required this.governorateId,
  });

  factory CityModel.fromJson(Map<String, dynamic> json) {
    return CityModel(
      id: json['id'] as int,
      name: json['name'] as String,
      nameAr: json['nameAr'] as String?,
      governorateId: json['governorateId'] as int,
    );
  }

  @override
  List<Object?> get props => [id, name, nameAr, governorateId];
}
