import '../../domain/entities/vendor_profile.dart';

class VendorProfileModel extends VendorProfile {
  const VendorProfileModel({
    required super.id,
    required super.fullName,
    required super.email,
    super.phone,
    required super.rating,
    required super.walletBalance,
    required super.isVerified,
    required super.categories,
    required super.brands,
    required super.stats,
  });

  factory VendorProfileModel.fromJson(Map<String, dynamic> json) {
    final profile = json['profile'] as Map<String, dynamic>? ?? {};
    final stats = json['stats'] as Map<String, dynamic>? ?? {};
    
    final categories = (json['categories'] as List?)?.map((e) => e.toString()).toList() ?? [];
    final brands = (json['brands'] as List?)?.map((e) => e.toString()).toList() ?? [];

    return VendorProfileModel(
      id: int.tryParse(profile['id']?.toString() ?? '') ?? 0,
      fullName: profile['fullName']?.toString() ?? '',
      email: profile['email']?.toString() ?? '',
      phone: profile['phone']?.toString(),
      rating: double.tryParse(profile['rating']?.toString() ?? '') ?? 0.0,
      walletBalance: double.tryParse(profile['walletBalance']?.toString() ?? '') ?? 0.0,
      isVerified: profile['isVerified'] == true,
      categories: categories,
      brands: brands,
      stats: stats,
    );
  }
}
