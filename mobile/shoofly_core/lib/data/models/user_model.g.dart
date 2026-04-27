// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserModelImpl _$$UserModelImplFromJson(Map<String, dynamic> json) =>
    _$UserModelImpl(
      id: (json['id'] as num).toInt(),
      fullName: json['fullName'] as String,
      email: json['email'] as String,
      role: $enumDecode(_$UserRoleEnumMap, json['role']),
      phone: json['phone'] as String?,
      isVerified: json['isVerified'] as bool? ?? false,
      walletBalance: double.tryParse(json['walletBalance']?.toString() ?? '0') ?? 0.0,
      token: json['token'] as String?,
    );

Map<String, dynamic> _$$UserModelImplToJson(_$UserModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'fullName': instance.fullName,
      'email': instance.email,
      'role': _$UserRoleEnumMap[instance.role]!,
      'phone': instance.phone,
      'isVerified': instance.isVerified,
      'walletBalance': instance.walletBalance,
      'token': instance.token,
    };

const _$UserRoleEnumMap = {
  UserRole.CLIENT: 'CLIENT',
  UserRole.VENDOR: 'VENDOR',
  UserRole.DELIVERY: 'DELIVERY',
  UserRole.ADMIN: 'ADMIN',
};
