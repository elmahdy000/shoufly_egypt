import 'package:dio/dio.dart';
import '../config/app_config.dart';

typedef TokenRefreshCallback = Future<String?> Function();
typedef AuthFailedCallback = void Function();

class ApiClient {
  final Dio dio;
  TokenRefreshCallback? _onTokenRefresh;
  AuthFailedCallback? _onAuthFailed;
  
  ApiClient({required this.dio}) {
    dio.options.baseUrl = AppConfig.apiBaseUrl;
    dio.options.connectTimeout = AppConfig.defaultTimeout;
    dio.options.receiveTimeout = AppConfig.defaultTimeout;
    dio.options.headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
    };
    
    // Only log in debug mode
    if (!AppConfig.isProduction) {
      dio.interceptors.add(LogInterceptor(
        requestBody: true,
        responseBody: true,
      ));
    }

    // Auth & Retry Interceptor
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        if (_token != null) {
          options.headers['Authorization'] = 'Bearer $_token';
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) async {
        // Handle 401 - Unauthorized
        if (e.response?.statusCode == 401 && _onTokenRefresh != null) {
          try {
            final newToken = await _onTokenRefresh!();
            if (newToken != null) {
              _token = newToken;
              // Retry the request with new token
              final options = e.requestOptions;
              options.headers['Authorization'] = 'Bearer $newToken';
              final response = await dio.fetch(options);
              return handler.resolve(response);
            }
          } catch (_) {
            // Token refresh failed
          }
          _onAuthFailed?.call();
        }
        return handler.next(e);
      },
    ));
  }

  String? _token;
  
  void setToken(String? token) {
    _token = token;
  }
  
  void setTokenRefreshCallback(TokenRefreshCallback callback) {
    _onTokenRefresh = callback;
  }
  
  void setAuthFailedCallback(AuthFailedCallback callback) {
    _onAuthFailed = callback;
  }

  void clearAuth() {
    _token = null;
    _onTokenRefresh = null;
    _onAuthFailed = null;
  }
}
