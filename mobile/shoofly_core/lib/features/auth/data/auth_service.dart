import 'dart:convert';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/errors/api_exception.dart';
import '../../../core/storage/token_storage.dart';
import '../models/login_request.dart';
import '../models/login_response.dart';
import '../models/register_request.dart';

/// Authentication service handling all auth-related API calls
class AuthService {
  final ApiClient _apiClient;

  AuthService(this._apiClient);

  /// Login user with email and password
  /// Returns LoginResponse containing tokens and user data
  Future<LoginResponse> login(LoginRequest request) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      ApiEndpoints.login,
      data: request.toJson(),
    );

    // Backend returns a flattened structure: {id, fullName, email, role, token}
    // We need to map it to LoginResponse: {accessToken, refreshToken, user: {id, email, ...}}
    final String? token = response['token'] as String?;
    if (token == null) {
      throw ServerException(message: 'بيانات الدخول غير صحيحة أو رمز الجلسة مفقود');
    }

    // Reconstruct User object from flat response
    final userMap = {
      'id': response['id'],
      'email': response['email'],
      'fullName': response['fullName'],
      'role': response['role'],
      'phone': response['phone'],
      'isVerified': response['isVerified'] ?? true,
      'walletBalance': response['walletBalance'],
    };

    final loginResponse = LoginResponse(
      accessToken: token,
      refreshToken: response['refreshToken'] as String? ?? '', // Optional in backend
      user: UserDto.fromJson(userMap),
    );
    
    // Store tokens securely
    await TokenStorage.saveAccessToken(loginResponse.accessToken);
    if (loginResponse.refreshToken.isNotEmpty) {
      await TokenStorage.saveRefreshToken(loginResponse.refreshToken);
    }
    
    // Save user data as JSON string for persistence
    await TokenStorage.saveUserData(json.encode(loginResponse.user.toJson()));
    
    return loginResponse;
  }

  /// Register new user
  /// Returns LoginResponse if auto-login is enabled, otherwise just confirms success
  Future<LoginResponse> register(RegisterRequest request) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      ApiEndpoints.register,
      data: request.toJson(),
    );

    final String? token = response['token'] as String? ?? response['accessToken'] as String?;
    if (token == null) {
      throw ServerException(message: 'فشل إنشاء الحساب أو رمز الجلسة مفقود');
    }

    // Map flattened response to user object
    final userMap = {
      'id': response['id'],
      'email': response['email'],
      'fullName': response['fullName'],
      'role': response['role'],
      'phone': response['phone'],
      'isVerified': response['isVerified'] ?? false,
      'walletBalance': response['walletBalance'] ?? 0.0,
    };

    final loginResponse = LoginResponse(
      accessToken: token,
      refreshToken: response['refreshToken'] as String? ?? '',
      user: UserDto.fromJson(userMap),
    );
    
    // Save tokens
    await TokenStorage.saveAccessToken(loginResponse.accessToken);
    if (loginResponse.refreshToken.isNotEmpty) {
      await TokenStorage.saveRefreshToken(loginResponse.refreshToken);
    }
    await TokenStorage.saveUserData(json.encode(loginResponse.user.toJson()));
    
    return loginResponse;
  }

  /// Get current user profile
  /// Useful for refreshing user data after app restart
  Future<UserDto> getCurrentUser() async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      ApiEndpoints.me,
    );

    final user = UserDto.fromJson(response);
    await TokenStorage.saveUserData(json.encode(user.toJson()));
    
    return user;
  }

  /// Refresh access token using refresh token
  /// Called automatically by ApiClient when access token expires
  Future<String> refreshToken() async {
    final refreshToken = await TokenStorage.getRefreshToken();
    if (refreshToken == null) {
      throw UnauthorizedException(message: 'No refresh token available');
    }

    final response = await _apiClient.post<Map<String, dynamic>>(
      ApiEndpoints.refreshToken,
      data: {'refreshToken': refreshToken},
    );

    // Validate response contains required fields
    if (response['accessToken'] == null) {
      throw ServerException(message: 'Invalid server response: missing accessToken');
    }

    final newAccessToken = response['accessToken'] as String;
    final newRefreshToken = response['refreshToken'] as String?;

    await TokenStorage.saveAccessToken(newAccessToken);
    if (newRefreshToken != null) {
      await TokenStorage.saveRefreshToken(newRefreshToken);
    }

    return newAccessToken;
  }

  /// Logout user - clear all stored data
  Future<void> logout() async {
    try {
      // Notify backend about logout (optional)
      await _apiClient.post(ApiEndpoints.logout);
    } catch (e) {
      // Ignore backend errors during logout
    } finally {
      // Always clear local storage
      await TokenStorage.clearAll();
    }
  }

  /// Check if user is authenticated
  Future<bool> isAuthenticated() async {
    return await TokenStorage.isLoggedIn();
  }
}
