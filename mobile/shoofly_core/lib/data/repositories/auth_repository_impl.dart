import 'dart:convert';
import 'package:dartz/dartz.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/errors/exceptions.dart';
import '../../core/errors/failures.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_data_source.dart';
import '../models/user_model.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final SharedPreferences sharedPreferences;

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.sharedPreferences,
  });

  @override
  Future<Either<Failure, User>> login({
    required String email,
    required String password,
  }) async {
    try {
      final userModel = await remoteDataSource.login(email, password);
      if (userModel.token != null) {
        await sharedPreferences.setString('token', userModel.token!);
        await sharedPreferences.setString('user_data', jsonEncode(userModel.toJson()));
      }
      return Right(userModel.toEntity());
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return const Left(ServerFailure('An unexpected error occurred'));
    }
  }

  @override
  Future<Either<Failure, User>> register({
    required String fullName,
    required String email,
    required String password,
    required UserRole role,
  }) async {
    try {
      final userModel = await remoteDataSource.register(
        fullName,
        email,
        password,
        role.name,
      );
      if (userModel.token != null) {
        await sharedPreferences.setString('token', userModel.token!);
        await sharedPreferences.setString('user_data', jsonEncode(userModel.toJson()));
      }
      return Right(userModel.toEntity());
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return const Left(ServerFailure('An unexpected error occurred'));
    }
  }

  @override
  Future<Either<Failure, void>> logout() async {
    await sharedPreferences.remove('token');
    return const Right(null);
  }

  @override
  Future<Either<Failure, User?>> getCurrentUser() async {
    final token = sharedPreferences.getString('token');
    final userData = sharedPreferences.getString('user_data');
    
    if (token == null || userData == null) return const Right(null);
    
    try {
      final userModel = UserModel.fromJson(jsonDecode(userData));
      return Right(userModel.toEntity());
    } catch (e) {
      return const Right(null);
    }
  }
}
