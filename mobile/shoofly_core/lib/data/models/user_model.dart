import 'package:freezed_annotation/freezed_annotation.dart';
import '../../domain/entities/user.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

@freezed
class UserModel with _$UserModel {
  const factory UserModel({
    required int id,
    required String fullName,
    required String email,
    required UserRole role,
    String? phone,
    @Default(false) bool isVerified,
    @Default(0.0) double walletBalance,
    String? token,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) => _$UserModelFromJson(json);
}

extension UserModelX on UserModel {
  User toEntity() => User(
        id: id,
        fullName: fullName,
        email: email,
        role: role,
        phone: phone,
        isVerified: isVerified,
        walletBalance: walletBalance,
        token: token,
      );
}
