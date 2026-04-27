import 'package:dio/dio.dart';
import '../models/category_model.dart';
import '../../core/errors/exceptions.dart';

abstract class CategoryRemoteDataSource {
  Future<List<CategoryModel>> getCategories();
}

class CategoryRemoteDataSourceImpl implements CategoryRemoteDataSource {
  final Dio dio;

  CategoryRemoteDataSourceImpl({required this.dio});

  @override
  Future<List<CategoryModel>> getCategories() async {
    try {
      final response = await dio.get('/categories');
      return (response.data as List)
          .map((e) => CategoryModel.fromJson(e))
          .toList();
    } on DioException catch (e) {
      throw ServerException(message: e.response?.data['error'] ?? 'فشل في جلب الأقسام');
    } catch (e) {
      throw ServerException(message: 'حدث خطأ غير متوقع');
    }
  }
}
