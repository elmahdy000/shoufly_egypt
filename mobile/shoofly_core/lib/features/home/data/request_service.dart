import 'dart:io';
import 'package:dio/dio.dart';
import 'package:shoofly_core/core/api/api_client.dart';
import 'package:shoofly_core/core/api/api_endpoints.dart';
import 'package:shoofly_core/data/models/request_model.dart';

/// Service for creating and managing requests
class RequestService {
  final ApiClient _apiClient;

  RequestService(this._apiClient);

  /// Create a new request
  /// [imagePaths] here are actually the JSON strings or Maps from previous uploads
  Future<RequestModel> createRequest({
    required String title,
    required String description,
    required int categoryId,
    String? location,
    double? latitude,
    double? longitude,
    int? governorateId,
    int? cityId,
    String? deliveryPhone,
    double? budget,
    List<dynamic>? imagePaths, // Can be list of URLs or list of ImageInput Maps
  }) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      ApiEndpoints.requests,
      data: {
        'title': title,
        'description': description,
        'categoryId': categoryId,
        'address': location,
        'latitude': latitude,
        'longitude': longitude,
        'deliveryPhone': deliveryPhone,
        'governorateId': governorateId,
        'cityId': cityId,
        if (budget != null) 'budget': budget,
        if (imagePaths != null) 'images': imagePaths.map((img) {
          if (img is Map) return img;
          return {'filePath': img.toString()};
        }).toList(),
      },
    );

    return RequestModel.fromJson(response);
  }

  /// Upload a single image and return the full metadata object
  Future<Map<String, dynamic>> uploadImage(String imagePath, {void Function(double)? onProgress}) async {
    final file = File(imagePath);
    
    if (!await file.exists()) {
      throw Exception('Image file not found: $imagePath');
    }
    
    final extension = imagePath.split('.').last.toLowerCase();
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(
        imagePath,
        filename: 'upload.$extension',
      ),
    });

    final response = await _apiClient.uploadFile<Map<String, dynamic>>(
      '/upload',
      data: formData,
      onSendProgress: (sent, total) {
        if (onProgress != null) {
          onProgress((sent / total) * 100);
        }
      },
    );

    if (response['success'] == true) {
      return {
        'filePath': response['fileUrl'],
        'fileName': response['fileName'],
        'mimeType': response['mimeType'],
        'fileSize': response['fileSize'],
      };
    } else {
      throw Exception(response['error'] ?? 'فشل رفع الصورة');
    }
  }
}
