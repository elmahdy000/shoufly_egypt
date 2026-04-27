import 'package:dartz/dartz.dart';
import '../../core/errors/exceptions.dart';
import '../../core/errors/failures.dart';
import '../../domain/entities/brand.dart';
import '../../domain/repositories/brand_repository.dart';
import '../datasources/brand_remote_data_source.dart';

class BrandRepositoryImpl implements BrandRepository {
  final BrandRemoteDataSource remoteDataSource;

  BrandRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<Failure, List<Brand>>> getBrands(String? type) async {
    try {
      final brands = await remoteDataSource.getBrands(type);
      return Right(brands);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return const Left(ServerFailure('حدث خطأ أثناء جلب الماركات'));
    }
  }

  @override
  Future<Either<Failure, List<Brand>>> getBrandsBySubcategory(String subcategoryId) async {
    try {
      final brands = await remoteDataSource.getBrandsBySubcategory(subcategoryId);
      return Right(brands);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return const Left(ServerFailure('حدث خطأ أثناء جلب الماركات'));
    }
  }
}
