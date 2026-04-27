import 'package:shoofly_core/core/api/api_client.dart';
import 'package:shoofly_core/core/api/api_endpoints.dart';
import 'package:shoofly_core/data/models/request_model.dart';
import 'package:shoofly_core/data/models/bid_model.dart';

class VendorService {
  final ApiClient _apiClient;

  VendorService(this._apiClient);

  /// Get open requests available for bidding in vendor's categories/locations
  Future<List<RequestModel>> getOpenRequests({
    int? governorateId,
    int? cityId,
  }) async {
    final response = await _apiClient.get<List<dynamic>>(
      ApiEndpoints.vendorOpenRequests,
      queryParameters: {
        if (governorateId != null) 'governorateId': governorateId,
        if (cityId != null) 'cityId': cityId,
      },
    );
    return response
        .map((json) => RequestModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Get requests the vendor has already bid on
  Future<List<BidModel>> getMyBids() async {
    final response = await _apiClient.get<List<dynamic>>(
      ApiEndpoints.vendorMyBids,
    );
    return response
        .map((json) => BidModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Submit a new bid for a request
  Future<BidModel> submitBid({
    required int requestId,
    required double price,
    required String duration,
    required String description,
    List<String>? images,
  }) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      ApiEndpoints.bids,
      data: {
        'requestId': requestId,
        'netPrice': price,
        'duration': duration,
        'description': description,
        if (images != null) 'images': images,
      },
    );
    return BidModel.fromJson(response);
  }

  Future<void> updateBidStatus({
    required int bidId,
    required String status,
  }) async {
    await _apiClient.patch<Map<String, dynamic>>(
      ApiEndpoints.vendorBidStatus(bidId),
      data: {'status': status},
    );
  }

  Future<BidModel> updateBid({
    required int bidId,
    required double price,
    required String duration,
    required String description,
  }) async {
    final response = await _apiClient.patch<Map<String, dynamic>>(
      ApiEndpoints.vendorBidById(bidId),
      data: {
        'netPrice': price,
        'duration': duration,
        'description': description,
      },
    );
    return BidModel.fromJson(response);
  }

  Future<List<dynamic>> getNotifications({int limit = 50}) async {
    return await _apiClient.get<List<dynamic>>(
      ApiEndpoints.notifications,
      queryParameters: {'limit': limit},
    );
  }

  Future<void> markNotificationRead(int notificationId) async {
    await _apiClient.patch<Map<String, dynamic>>(
      ApiEndpoints.markNotificationRead(notificationId),
    );
  }

  /// Get vendor profile details (categories, brands, verification status)
  Future<Map<String, dynamic>> getVendorProfile() async {
    return await _apiClient.get<Map<String, dynamic>>(
      ApiEndpoints.vendorProfile,
    );
  }

  /// Update vendor profile
  Future<Map<String, dynamic>> updateProfile({
    required String fullName,
    String? phone,
  }) async {
    return await _apiClient.patch<Map<String, dynamic>>(
      ApiEndpoints.vendorProfile,
      data: {
        'fullName': fullName,
        if (phone != null) 'phone': phone,
      },
    );
  }

  /// Get vendor wallet and transaction history
  Future<List<dynamic>> getVendorTransactions() async {
    return await _apiClient.get<List<dynamic>>(ApiEndpoints.vendorTransactions);
  }

  /// Request a withdrawal from wallet balance (minimum 50 EGP)
  Future<Map<String, dynamic>> requestWithdrawal(double amount) async {
    return await _apiClient.post<Map<String, dynamic>>(
      ApiEndpoints.vendorWithdrawals,
      data: {'amount': amount},
    );
  }
}
