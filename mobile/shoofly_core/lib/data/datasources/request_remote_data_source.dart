import 'package:dio/dio.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/errors/exceptions.dart';
import '../models/request_model.dart';

abstract class RequestRemoteDataSource {
  Future<RequestModel> createRequest({
    required String title,
    required String description,
    required int categoryId,
    required List<dynamic> images,
    int? brandId,
    double? latitude,
    double? longitude,
    String? address,
    int? governorateId,
    int? cityId,
    String? deliveryPhone,
  });
  Future<List<RequestModel>> getMyRequests();
  Future<List<RequestModel>> getActiveRequests({int limit = 10});
  Future<RequestModel> getRequestDetails(int requestId);
  Future<String> uploadImage(String filePath);
  Future<Map<String, dynamic>> uploadImageMetadata(String filePath);
  Future<void> selectBid(int requestId, int bidId);
  Future<Map<String, dynamic>> payRequest(int requestId);
  Future<void> confirmReceipt(int requestId, {String? qrCode});
  Future<void> addReview({
    required int requestId,
    required int rating,
    String? comment,
  });
}

class RequestRemoteDataSourceImpl implements RequestRemoteDataSource {
  final Dio dio;

  RequestRemoteDataSourceImpl({required this.dio});

  String _errorMessage(DioException e, String fallback) {
    final data = e.response?.data;
    if (data is Map) {
      final error = data['error'] ?? data['message'] ?? data['details'];
      if (error != null && error.toString().trim().isNotEmpty) {
        return error.toString();
      }
    }
    if (data is String && data.trim().isNotEmpty) {
      return data;
    }
    return fallback;
  }

  @override
  Future<RequestModel> createRequest({
    required String title,
    required String description,
    required int categoryId,
    required List<dynamic> images,
    int? brandId,
    double? latitude,
    double? longitude,
    String? address,
    int? governorateId,
    int? cityId,
    String? deliveryPhone,
  }) async {
    try {
      final response = await dio.post(
        '/requests',
        data: {
          'title': title,
          'description': description,
          'categoryId': categoryId,
          'brandId': brandId,
          'images': images.map((img) {
            if (img is Map) return img;
            return {'filePath': img.toString()};
          }).toList(),
          'address': address,
          'latitude': latitude,
          'longitude': longitude,
          'governorateId': governorateId,
          'cityId': cityId,
          'deliveryPhone': deliveryPhone,
        },
      );
      return RequestModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ServerException(message: _errorMessage(e, 'فشل في إنشاء الطلب'));
    } catch (e) {
      throw ServerException(message: 'حدث خطأ غير متوقع');
    }
  }

  @override
  Future<List<RequestModel>> getMyRequests() async {
    try {
      final response = await dio.get('/requests');
      final List data = response.data;
      return data.map((json) => RequestModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['error'] ?? 'فشل في تحميل الطلبات',
      );
    } catch (e) {
      throw ServerException(message: 'حدث خطأ غير متوقع');
    }
  }

  @override
  Future<List<RequestModel>> getActiveRequests({int limit = 10}) async {
    try {
      final response = await dio.get(
        '/requests',
        queryParameters: {'limit': limit},
      );
      final List data = response.data;
      return data.map((json) => RequestModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['error'] ?? 'فشل في تحميل الطلبات النشطة',
      );
    } catch (e) {
      throw ServerException(message: 'حدث خطأ غير متوقع');
    }
  }

  @override
  Future<RequestModel> getRequestDetails(int requestId) async {
    try {
      final response = await dio.get('/requests/$requestId');
      return RequestModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['error'] ?? 'فشل في تحميل تفاصيل الطلب',
      );
    } catch (e) {
      throw ServerException(message: 'حدث خطأ غير متوقع');
    }
  }

  @override
  Future<String> uploadImage(String filePath) async {
    try {
      final fileName = filePath.split('/').last;
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath, filename: fileName),
      });

      final response = await dio.post('/upload', data: formData);
      return response.data['fileUrl'];
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['error'] ?? 'فشل في رفع الصورة',
      );
    } catch (e) {
      throw ServerException(message: 'حدث خطأ أثناء رفع الصورة');
    }
  }

  @override
  Future<Map<String, dynamic>> uploadImageMetadata(String filePath) async {
    try {
      final fileName = filePath.split('/').last;
      final extension = fileName.split('.').last.toLowerCase();
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(
          filePath,
          filename: 'upload.$extension',
        ),
      });

      final response = await dio.post('/upload', data: formData);
      if (response.data['success'] == true) {
        return {
          'filePath': response.data['fileUrl'],
          'fileName': response.data['fileName'],
          'mimeType': response.data['mimeType'],
          'fileSize': response.data['fileSize'],
        };
      } else {
        throw ServerException(
          message: response.data['error'] ?? 'فشل رفع الصورة',
        );
      }
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['error'] ?? 'فشل في رفع الصورة',
      );
    } catch (e) {
      throw ServerException(message: 'حدث خطأ أثناء رفع الصورة');
    }
  }

  @override
  Future<void> selectBid(int requestId, int bidId) async {
    try {
      await dio.patch(ApiEndpoints.acceptOffer(bidId));
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['error'] ?? 'فشل في قبول العرض',
      );
    } catch (e) {
      throw ServerException(message: 'حدث خطأ غير متوقع');
    }
  }

  @override
  Future<Map<String, dynamic>> payRequest(int requestId) async {
    try {
      final response = await dio.post(ApiEndpoints.payRequest(requestId));
      return response.data;
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['error'] ?? 'فشل في عملية الدفع',
      );
    } catch (e) {
      throw ServerException(message: 'حدث خطأ غير متوقع');
    }
  }

  @override
  Future<void> confirmReceipt(int requestId, {String? qrCode}) async {
    try {
      await dio.post(
        ApiEndpoints.confirmReceipt(requestId),
        data: {if (qrCode != null) 'qrCode': qrCode},
      );
    } on DioException catch (e) {
      throw ServerException(message: _errorMessage(e, 'فشل في تأكيد الاستلام'));
    } catch (e) {
      throw ServerException(message: 'حدث خطأ غير متوقع');
    }
  }

  @override
  Future<void> addReview({
    required int requestId,
    required int rating,
    String? comment,
  }) async {
    try {
      await dio.post(
        '/client/reviews',
        data: {
          'requestId': requestId,
          'rating': rating,
          'comment': comment,
        },
      );
    } on DioException catch (e) {
      throw ServerException(message: _errorMessage(e, 'فشل في إضافة التقييم'));
    } catch (e) {
      throw ServerException(message: 'حدث خطأ غير متوقع');
    }
  }
}
