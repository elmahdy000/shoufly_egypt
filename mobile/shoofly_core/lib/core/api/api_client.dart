import 'package:dio/dio.dart';
import '../config/app_config.dart';
import '../errors/api_exception.dart';
import '../storage/token_storage.dart';
import 'api_endpoints.dart';

typedef TokenRefreshCallback = Future<String?> Function();
typedef AuthFailedCallback = void Function();

/// Internal class to queue requests while token is being refreshed
class _QueuedRequest {
  final RequestOptions requestOptions;
  final ErrorInterceptorHandler handler;
  
  _QueuedRequest(this.requestOptions, this.handler);
}

/// Main API client using Dio
/// Handles authentication, error handling, and request/response interceptors
class ApiClient {
  late final Dio _dio;
  late final Dio _refreshDio;
  bool _isRefreshingToken = false;
  final List<_QueuedRequest> _queuedRequests = [];

  ApiClient() {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.fullApiUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json',
        },
      ),
    );
    _refreshDio = Dio(
      BaseOptions(
        baseUrl: AppConfig.fullApiUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json',
        },
      ),
    );

    _setupInterceptors();
  }

  void _setupInterceptors() {
    // Request interceptor - add auth token
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await TokenStorage.getAccessToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          // Only handle 401 - Unauthorized (not other errors)
          final isUnauthorized = error.response?.statusCode == 401;
          final path = error.requestOptions.path;
          final isAuthAction = path.contains(ApiEndpoints.login) || 
                               path.contains(ApiEndpoints.register) ||
                               path.contains(ApiEndpoints.refreshToken);

          if (isUnauthorized && isAuthAction) {
            handler.next(error);
            return;
          }

          if (isUnauthorized) {
            if (_isRefreshingToken) {
              // Token refresh already in progress, queue this request
              _queuedRequests.add(_QueuedRequest(error.requestOptions, handler));
              return;
            }

            _isRefreshingToken = true;

            try {
              final newToken = await _handleTokenRefresh();
              if (newToken != null) {
                await TokenStorage.saveAccessToken(newToken);
                _isRefreshingToken = false;

                // Retry this request
                final options = error.requestOptions;
                options.headers['Authorization'] = 'Bearer $newToken';
                final response = await _dio.fetch(options);
                handler.resolve(response);

                // Process queued requests
                await _processQueuedRequests();
                return;
              }
            } catch (_) {
              // Token refresh failed
            }

            _isRefreshingToken = false;
            await TokenStorage.clearAll();
            _failQueuedRequests(error);
          }
          handler.next(error);
        },
      ),
    );

    // Log interceptor (only in debug mode)
    if (AppConfig.isDev) {
      _dio.interceptors.add(
        LogInterceptor(
          requestBody: false,
          responseBody: false,
          requestHeader: false,
          responseHeader: false,
          error: true,
        ),
      );
    }
  }

  Future<String?> _handleTokenRefresh() async {
    _isRefreshingToken = true;
    try {
      final refreshToken = await TokenStorage.getRefreshToken();
      if (refreshToken == null) {
        await TokenStorage.clearAll();
        return null;
      }

      final response = await _refreshDio.post(
        ApiEndpoints.refreshToken,
        data: {'refreshToken': refreshToken},
        options: Options(
          headers: {'Authorization': null}, // Don't send expired token
        ),
      );

      if (response.statusCode == 200) {
        final newToken = response.data['accessToken'] as String?;
        final newRefreshToken = response.data['refreshToken'] as String?;

        if (newToken != null) {
          await TokenStorage.saveAccessToken(newToken);
          if (newRefreshToken != null) {
            await TokenStorage.saveRefreshToken(newRefreshToken);
          }
          _isRefreshingToken = false;
          return newToken;
        }
      }
    } catch (e) {
      // Refresh failed
    }

    await TokenStorage.clearAll();
    _isRefreshingToken = false;
    return null;
  }

  Future<Response<dynamic>> _retry(RequestOptions requestOptions) async {
    final token = await TokenStorage.getAccessToken();
    final options = Options(
      method: requestOptions.method,
      headers: {
        ...requestOptions.headers,
        'Authorization': 'Bearer $token',
      },
    );
    return _dio.request<dynamic>(
      requestOptions.path,
      data: requestOptions.data,
      queryParameters: requestOptions.queryParameters,
      options: options,
    );
  }

  Future<void> _processQueuedRequests() async {
    while (_queuedRequests.isNotEmpty) {
      final queuedRequest = _queuedRequests.removeAt(0);
      try {
        final response = await _retry(queuedRequest.requestOptions);
        queuedRequest.handler.resolve(response);
      } catch (error) {
        if (error is DioException) {
          queuedRequest.handler.reject(error);
        } else {
          queuedRequest.handler.reject(
            DioException(requestOptions: queuedRequest.requestOptions, error: error.toString()),
          );
        }
      }
    }
  }

  void _failQueuedRequests(DioException sourceError) {
    while (_queuedRequests.isNotEmpty) {
      final queuedRequest = _queuedRequests.removeAt(0);
      queuedRequest.handler.reject(
        DioException(
          requestOptions: queuedRequest.requestOptions,
          response: sourceError.response,
          type: sourceError.type,
          error: sourceError.error,
          message: sourceError.message,
        ),
      );
    }
  }

  /// Convert DioException to our custom exceptions
  ApiException _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return TimeoutException();
      case DioExceptionType.connectionError:
        return NetworkException(message: 'لا يوجد اتصال بالإنترنت');
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        final data = error.response?.data;
        final message = data?['message'] ?? data?['error'] ?? _getDefaultMessage(statusCode);

        switch (statusCode) {
              case 400:
            return ValidationException(
              message: message,
              errors: data?['errors'] != null 
                ? Map<String, dynamic>.from(data['errors']) 
                : null,
            );
          case 401:
            return UnauthorizedException(message: message);
          case 403:
            return ForbiddenException(message: message);
          case 404:
            return NotFoundException(message: message);
          case 409:
            return ConflictException(message: message);
          default:
            if (statusCode != null && statusCode >= 500) {
              return ServerException(message: message);
            }
            return ApiException(message: message, statusCode: statusCode);
        }
      default:
        return NetworkException();
    }
  }

  String _getDefaultMessage(int? statusCode) {
    switch (statusCode) {
      case 400:
        return 'طلب غير صالح';
      case 401:
        return 'غير مصرح';
      case 403:
        return 'الوصول مرفوض';
      case 404:
        return 'غير موجود';
      case 409:
        return 'تعارض في البيانات';
      case 500:
        return 'خطأ في الخادم';
      default:
        return 'حدث خطأ غير متوقع';
    }
  }

  // HTTP Methods
  Future<T> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.get<T>(
        path,
        queryParameters: queryParameters,
        options: options,
      );
      return response.data as T;
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw FormatException(message: e.toString());
    }
  }

  Future<T> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.post<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response.data as T;
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw FormatException(message: e.toString());
    }
  }

  Future<T> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.put<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response.data as T;
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw FormatException(message: e.toString());
    }
  }

  Future<T> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.patch<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response.data as T;
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw FormatException(message: e.toString());
    }
  }

  Future<T> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.delete<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response.data as T;
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw FormatException(message: e.toString());
    }
  }

  /// Upload file with multipart/form-data
  Future<T> uploadFile<T>(
    String path, {
    required FormData data,
    ProgressCallback? onSendProgress,
    Options? options,
  }) async {
    try {
      final response = await _dio.post<T>(
        path,
        data: data,
        options: options?.copyWith(
              sendTimeout: const Duration(minutes: 2),
              receiveTimeout: const Duration(minutes: 2),
            ) ??
            Options(
              sendTimeout: const Duration(minutes: 2),
              receiveTimeout: const Duration(minutes: 2),
            ),
        onSendProgress: onSendProgress,
      );
      return response.data as T;
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw FormatException(message: e.toString());
    }
  }

  /// Get Dio instance for SSE streaming
  Dio get dio => _dio;
}
