import 'package:dio/dio.dart';
import '../models/brand_model.dart';
import '../../core/errors/exceptions.dart';

abstract class BrandRemoteDataSource {
  Future<List<BrandModel>> getBrands(String? type);
  Future<List<BrandModel>> getBrandsBySubcategory(String subcategoryId);
}

class BrandRemoteDataSourceImpl implements BrandRemoteDataSource {
  final Dio dio;

  BrandRemoteDataSourceImpl({required this.dio});

  @override
  Future<List<BrandModel>> getBrands(String? type) async {
    try {
      final response = await dio.get('/brands', queryParameters: type != null ? {'type': type} : null);
      return (response.data as List)
          .map((e) => BrandModel.fromJson(e))
          .toList();
    } on DioException catch (e) {
      throw ServerException(message: e.response?.data['error'] ?? 'فشل في جلب الماركات');
    } catch (e) {
      throw ServerException(message: 'حدث خطأ غير متوقع');
    }
  }

  @override
  Future<List<BrandModel>> getBrandsBySubcategory(String subcategoryId) async {
    try {
      final response = await dio.get(
        '/brands',
        queryParameters: {'subcategoryId': subcategoryId},
      );
      return (response.data as List).map((e) => BrandModel.fromJson(e)).toList();
    } on DioException catch (e) {
      throw ServerException(message: e.response?.data['error'] ?? 'فشل في جلب الماركات');
    } catch (_) {
      throw ServerException(message: 'حدث خطأ غير متوقع');
    }
  }
}
