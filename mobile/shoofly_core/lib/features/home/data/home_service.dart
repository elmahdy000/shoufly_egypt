import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../data/models/category_model.dart';
import '../../../data/models/request_model.dart';

/// Home service for fetching home page data
class HomeService {
  final ApiClient _apiClient;

  HomeService(this._apiClient);

  /// Fetch all categories
  Future<List<CategoryModel>> getCategories() async {
    final response = await _apiClient.get<List<dynamic>>(
      ApiEndpoints.categories,
    );

    return response
        .map((json) => CategoryModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Fetch active requests for the home page
  /// [limit] - number of requests to fetch (default 10)
  Future<List<RequestModel>> getActiveRequests({int limit = 10}) async {
    final response = await _apiClient.get<List<dynamic>>(
      ApiEndpoints.requests,
      queryParameters: {
        'status': 'OPEN_FOR_BIDDING',
        'limit': limit,
      },
    );

    return response
        .map((json) => RequestModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Fetch current user's requests
  Future<List<RequestModel>> getMyRequests() async {
    final response = await _apiClient.get<List<dynamic>>(
      ApiEndpoints.myRequests,
    );

    return response
        .map((json) => RequestModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Fetch request by ID
  Future<RequestModel> getRequestById(Object id) async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      ApiEndpoints.requestById(id),
    );

    return RequestModel.fromJson(response);
  }

  /// Fetch subcategories for a category
  Future<List<CategoryModel>> getSubcategories(String categoryId) async {
    final response = await _apiClient.get<List<dynamic>>(
      '${ApiEndpoints.categories}/$categoryId/subcategories',
    );

    return response
        .map((json) => CategoryModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
