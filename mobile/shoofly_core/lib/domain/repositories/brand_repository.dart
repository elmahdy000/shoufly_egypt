import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../entities/brand.dart';

abstract class BrandRepository {
  Future<Either<Failure, List<Brand>>> getBrands(String? type);
  Future<Either<Failure, List<Brand>>> getBrandsBySubcategory(String subcategoryId);
}
