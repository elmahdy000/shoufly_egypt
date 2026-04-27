import 'package:dio/dio.dart';
import '../models/user_model.dart';
import '../../core/errors/exceptions.dart';

abstract class AuthRemoteDataSource {
  Future<UserModel> login(String email, String password);
  Future<UserModel> register(String fullName, String email, String password, String role);
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final Dio dio;

  AuthRemoteDataSourceImpl({required this.dio});

  @override
  Future<UserModel> login(String email, String password) async {


    try {
      final response = await dio.post('/auth/login', data: {
        'email': email.toLowerCase().trim(),
        'password': password,
      });

      if (response.statusCode == 200 && response.data != null) {
        return UserModel.fromJson(response.data);
      } else if (response.statusCode == 401) {
        throw UnauthorizedException(message: 'بيانات الدخول غير صحيحة');
      } else {
        final errorMessage = response.data?['error'] ?? response.data?['message'] ?? 'فشل تسجيل الدخول';
        throw ServerException(message: errorMessage);
      }
    } on DioException catch (e) {
      throw _handleDioException(e);
    } on FormatException catch (e) {
      throw ServerException(message: 'خطأ في قراءة البيانات: $e');
    } catch (e) {
      throw ServerException(message: 'حدث خطأ غير متوقع');
    }
  }

  @override
  Future<UserModel> register(String fullName, String email, String password, String role) async {
    try {
      final response = await dio.post('/auth/register', data: {
        'fullName': fullName,
        'email': email,
        'password': password,
        'role': role.toUpperCase(),
      });

      if (response.statusCode == 201 && response.data != null) {
        return UserModel.fromJson(response.data);
      } else if (response.statusCode == 409) {
        throw ConflictException(message: 'البريد الإلكتروني مستخدم بالفعل');
      } else {
        final errorMessage = response.data?['error'] ?? response.data?['message'] ?? 'فشل إنشاء الحساب';
        throw ServerException(message: errorMessage);
      }
    } on DioException catch (e) {
      throw _handleDioException(e);
    } on FormatException catch (e) {
      throw ServerException(message: 'خطأ في قراءة البيانات: $e');
    } catch (e) {
      throw ServerException(message: 'حدث خطأ غير متوقع');
    }
  }

  Exception _handleDioException(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return NetworkException(message: 'انتهى وقت الاتصال، تأكد من اتصالك بالإنترنت');
      case DioExceptionType.connectionError:
        return NetworkException(message: 'لا يوجد اتصال بالإنترنت');
      case DioExceptionType.badResponse:
        final statusCode = e.response?.statusCode;
        final errorData = e.response?.data;
        final errorMessage = errorData?['error'] ?? errorData?['message'] ?? 'خطأ في الخادم';
        
        if (statusCode == 401) {
          return UnauthorizedException(message: 'غير مصرح');
        } else if (statusCode == 403) {
          return ForbiddenException(message: 'الوصول مرفوض');
        } else if (statusCode == 404) {
          return NotFoundException(message: 'المورد غير موجود');
        } else if (statusCode == 409) {
          return ConflictException(message: errorMessage);
        } else if (statusCode != null && statusCode >= 500) {
          return ServerException(message: 'خطأ في الخادم، يرجى المحاولة لاحقاً');
        }
        return ServerException(message: errorMessage);
      case DioExceptionType.cancel:
        return ServerException(message: 'تم إلغاء الطلب');
      default:
        return NetworkException(message: 'حدث خطأ في الاتصال');
    }
  }
}
