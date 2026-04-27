/// Base exception for API errors
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final Map<String, dynamic>? errors;

  ApiException({
    required this.message,
    this.statusCode,
    this.errors,
  });

  @override
  String toString() => 'ApiException: $message (status: $statusCode)';
}

/// 400 - Bad Request / Validation Error
class ValidationException extends ApiException {
  ValidationException({
    required super.message,
    super.errors,
  }) : super(statusCode: 400);
}

/// 401 - Unauthorized
class UnauthorizedException extends ApiException {
  UnauthorizedException({super.message = 'غير مصرح'}) : super(statusCode: 401);
}

/// 403 - Forbidden
class ForbiddenException extends ApiException {
  ForbiddenException({super.message = 'الوصول مرفوض'}) : super(statusCode: 403);
}

/// 404 - Not Found
class NotFoundException extends ApiException {
  NotFoundException({super.message = 'المورد غير موجود'}) : super(statusCode: 404);
}

/// 409 - Conflict (e.g., email already exists)
class ConflictException extends ApiException {
  ConflictException({super.message = 'تعارض في البيانات'}) : super(statusCode: 409);
}

/// 500+ - Server Error
class ServerException extends ApiException {
  ServerException({super.message = 'خطأ في الخادم'}) : super(statusCode: 500);
}

/// Network errors (timeout, no connection)
class NetworkException extends ApiException {
  NetworkException({super.message = 'خطأ في الاتصال'}) : super(statusCode: null);
}

/// Timeout errors
class TimeoutException extends ApiException {
  TimeoutException({super.message = 'انتهى وقت الاتصال'}) : super(statusCode: null);
}

/// Format/JSON parsing errors
class FormatException extends ApiException {
  FormatException({super.message = 'خطأ في قراءة البيانات'}) : super(statusCode: null);
}
