import 'package:equatable/equatable.dart';

class VendorProfile extends Equatable {
  final int id;
  final String fullName;
  final String email;
  final String? phone;
  final double rating;
  final double walletBalance;
  final bool isVerified;
  final List<String> categories;
  final List<String> brands;
  final Map<String, dynamic> stats;

  const VendorProfile({
    required this.id,
    required this.fullName,
    required this.email,
    this.phone,
    required this.rating,
    required this.walletBalance,
    required this.isVerified,
    required this.categories,
    required this.brands,
    required this.stats,
  });

  @override
  List<Object?> get props => [
    id,
    fullName,
    email,
    phone,
    rating,
    walletBalance,
    isVerified,
    categories,
    brands,
    stats,
  ];
}
