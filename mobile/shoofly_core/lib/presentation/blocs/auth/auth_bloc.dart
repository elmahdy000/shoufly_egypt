import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/di/injection.dart';
import '../../../core/errors/api_exception.dart';
import '../../../core/storage/token_storage.dart';
import '../../../features/auth/data/auth_service.dart';
import '../../../features/auth/models/login_request.dart';
import '../../../features/auth/models/register_request.dart';
import 'auth_event.dart';
import 'auth_state.dart';

export 'auth_event.dart';
export 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthService _authService;

  AuthBloc() : _authService = sl<AuthService>(), super(AuthInitial()) {
    on<LoginSubmitted>(_onLoginSubmitted);
    on<RegisterSubmitted>(_onRegisterSubmitted);
    on<AuthCheckRequested>(_onAuthCheckRequested);
    on<LogoutRequested>(_onLogoutRequested);
    on<RefreshTokenRequested>(_onRefreshTokenRequested);
  }

  Future<void> _onLoginSubmitted(
    LoginSubmitted event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final response = await _authService.login(
        LoginRequest(
          email: event.email,
          password: event.password,
        ),
      );
      emit(Authenticated(
        user: response.user,
        accessToken: response.accessToken,
      ));
    } on ApiException catch (e) {
      emit(AuthError(message: e.message));
    } catch (e) {
      emit(AuthError(message: 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى'));
    }
  }

  Future<void> _onRegisterSubmitted(
    RegisterSubmitted event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final response = await _authService.register(
        RegisterRequest(
          email: event.email,
          password: event.password,
          fullName: event.fullName,
          role: event.role.name,
        ),
      );
      emit(Authenticated(
        user: response.user,
        accessToken: response.accessToken,
      ));
    } on ValidationException catch (e) {
      final errorMsg = e.errors?.entries.first.value?.toString() ?? e.message;
      emit(AuthError(message: errorMsg));
    } on ConflictException {
      emit(AuthError(message: 'البريد الإلكتروني مستخدم بالفعل'));
    } on ApiException catch (e) {
      emit(AuthError(message: e.message));
    } catch (e) {
      emit(AuthError(message: 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى'));
    }
  }

  Future<void> _onAuthCheckRequested(
    AuthCheckRequested event,
    Emitter<AuthState> emit,
  ) async {
    final isLoggedIn = await _authService.isAuthenticated();
    
    if (isLoggedIn) {
      try {
        final user = await _authService.getCurrentUser();
        final token = await TokenStorage.getAccessToken();
        emit(Authenticated(user: user, accessToken: token ?? ''));
      } on ApiException {
        // Token invalid or expired
        await _authService.logout();
        emit(Unauthenticated());
      } catch (e) {
        await _authService.logout();
        emit(Unauthenticated());
      }
    } else {
      emit(Unauthenticated());
    }
  }

  Future<void> _onLogoutRequested(
    LogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    await _authService.logout();
    emit(Unauthenticated());
  }

  Future<void> _onRefreshTokenRequested(
    RefreshTokenRequested event,
    Emitter<AuthState> emit,
  ) async {
    try {
      final newToken = await _authService.refreshToken();
      // Keep current authenticated state with new token
      if (state is Authenticated) {
        final currentUser = (state as Authenticated).user;
        emit(Authenticated(user: currentUser, accessToken: newToken));
      }
    } on ApiException {
      // Token refresh failed - logout user
      await _authService.logout();
      emit(Unauthenticated());
    } catch (e) {
      await _authService.logout();
      emit(Unauthenticated());
    }
  }
}
