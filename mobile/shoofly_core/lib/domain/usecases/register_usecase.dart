import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../entities/user.dart';
import '../repositories/auth_repository.dart';

class RegisterUseCase {
  final AuthRepository repository;

  RegisterUseCase(this.repository);

  Future<Either<Failure, User>> call({
    required String fullName,
    required String email,
    required String password,
    required UserRole role,
  }) {
    return repository.register(
      fullName: fullName,
      email: email,
      password: password,
      role: role,
    );
  }
}
