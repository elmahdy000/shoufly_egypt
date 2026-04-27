/// Login response model containing tokens and user data
class LoginResponse {
  final String accessToken;
  final String refreshToken;
  final UserDto user;

  LoginResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) => LoginResponse(
        accessToken: json['accessToken'] as String,
        refreshToken: json['refreshToken'] as String,
        user: UserDto.fromJson(json['user'] as Map<String, dynamic>),
      );

  Map<String, dynamic> toJson() => {
        'accessToken': accessToken,
        'refreshToken': refreshToken,
        'user': user.toJson(),
      };
}

/// User data transfer object from API
class UserDto {
  final String id;
  final String email;
  final String fullName;
  final String role;
  final String? phone;
  final bool isVerified;
  final double? walletBalance;

  UserDto({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    this.phone,
    required this.isVerified,
    this.walletBalance,
  });

  factory UserDto.fromJson(Map<String, dynamic> json) => UserDto(
        id: json['id'].toString(),
        email: json['email'] as String,
        fullName: json['fullName'] as String,
        role: json['role'] as String,
        phone: json['phone'] as String?,
        isVerified: json['isVerified'] as bool? ?? false,
        walletBalance: json['walletBalance'] != null 
          ? double.tryParse(json['walletBalance'].toString())
          : null,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'fullName': fullName,
        'role': role,
        'phone': phone,
        'isVerified': isVerified,
        'walletBalance': walletBalance,
      };
}
