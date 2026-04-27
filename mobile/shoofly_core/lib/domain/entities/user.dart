import 'package:equatable/equatable.dart';

enum UserRole { CLIENT, VENDOR, DELIVERY, ADMIN }

class User extends Equatable {
  final int id;
  final String fullName;
  final String email;
  final UserRole role;
  final String? phone;
  final bool isVerified;
  final double walletBalance;
  final String? token;

  const User({
    required this.id,
    required this.fullName,
    required this.email,
    required this.role,
    this.phone,
    this.isVerified = false,
    this.walletBalance = 0.0,
    this.token,
  });

  @override
  List<Object?> get props => [id, email, role, fullName, isVerified, walletBalance, token];
}
