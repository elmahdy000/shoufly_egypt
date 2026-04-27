import 'package:get_it/get_it.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../api/api_client.dart';

import '../../data/datasources/auth_remote_data_source.dart';
import '../../data/datasources/request_remote_data_source.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../data/repositories/request_repository_impl.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/repositories/request_repository.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/register_usecase.dart';
import '../../presentation/blocs/auth/auth_bloc.dart';
import '../../presentation/blocs/request/request_bloc.dart';
import '../../presentation/blocs/notification/notification_bloc.dart';
import '../../presentation/blocs/category/category_bloc.dart';
import '../../data/datasources/category_remote_data_source.dart';
import '../../data/repositories/category_repository_impl.dart';
import '../../domain/repositories/category_repository.dart';
import '../../presentation/blocs/wallet/wallet_bloc.dart';
import '../../data/datasources/wallet_remote_data_source.dart';
import '../../data/repositories/wallet_repository_impl.dart';
import '../../domain/repositories/wallet_repository.dart';
import '../../presentation/blocs/brand/brand_bloc.dart';
import '../../data/datasources/brand_remote_data_source.dart';
import '../../data/repositories/brand_repository_impl.dart';
import '../../domain/repositories/brand_repository.dart';
import '../../features/auth/data/auth_service.dart';
import '../../features/home/data/home_service.dart';
import '../../features/home/data/request_service.dart';
import '../../features/notifications/data/notification_stream_service.dart';
import '../../features/locations/data/location_service.dart';
import '../../presentation/blocs/location/location_bloc.dart';
import '../../features/vendor/data/vendor_service.dart';
import '../../presentation/blocs/vendor/vendor_bloc.dart';
import '../../presentation/blocs/theme/theme_bloc.dart';
import '../../presentation/blocs/chat/chat_bloc.dart';
import '../../presentation/blocs/tracking/tracking_bloc.dart';
import '../../data/datasources/chat_remote_data_source.dart';
import '../../data/repositories/chat_repository_impl.dart';
import '../../domain/repositories/chat_repository.dart';
import '../../domain/repositories/vendor_repository.dart';
import '../../data/repositories/vendor_repository_impl.dart';
final sl = GetIt.instance;

Future<void> initInjection() async {
  // 1. External
  final sharedPreferences = await SharedPreferences.getInstance();
  sl.registerLazySingleton(() => sharedPreferences);
  sl.registerLazySingleton(() => const FlutterSecureStorage());

  // 2. API Layer
  sl.registerLazySingleton(() => ApiClient());
  sl.registerLazySingleton(() => AuthService(sl<ApiClient>()));
  sl.registerLazySingleton(() => HomeService(sl<ApiClient>()));
  sl.registerLazySingleton(() => RequestService(sl<ApiClient>()));
  sl.registerLazySingleton(() => NotificationStreamService());
  sl.registerLazySingleton(() => LocationService(sl<ApiClient>()));
  sl.registerLazySingleton(() => VendorService(sl<ApiClient>()));

  // 2. Data Sources
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(dio: sl<ApiClient>().dio),
  );
  sl.registerLazySingleton<RequestRemoteDataSource>(
    () => RequestRemoteDataSourceImpl(dio: sl<ApiClient>().dio),
  );

  // 3. Repositories
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: sl(),
      sharedPreferences: sl(),
    ),
  );
  sl.registerLazySingleton<RequestRepository>(
    () => RequestRepositoryImpl(remoteDataSource: sl()),
  );

  // 4. Use Cases
  sl.registerLazySingleton(() => LoginUseCase(repository: sl()));
  sl.registerLazySingleton(() => RegisterUseCase(sl()));

  // 5. Blocs
  sl.registerFactory(() => AuthBloc());
  sl.registerFactory(() => RequestBloc(repository: sl()));
  sl.registerFactory(() => NotificationBloc());
  sl.registerFactory(() => LocationBloc());
  sl.registerFactory(() => VendorBloc());
  
  // Category
  sl.registerLazySingleton<CategoryRemoteDataSource>(
    () => CategoryRemoteDataSourceImpl(dio: sl<ApiClient>().dio),
  );
  sl.registerLazySingleton<CategoryRepository>(
    () => CategoryRepositoryImpl(remoteDataSource: sl()),
  );
  sl.registerFactory(() => CategoryBloc());

  // Brand
  sl.registerLazySingleton<BrandRemoteDataSource>(
    () => BrandRemoteDataSourceImpl(dio: sl<ApiClient>().dio),
  );
  sl.registerLazySingleton<BrandRepository>(
    () => BrandRepositoryImpl(remoteDataSource: sl()),
  );
  sl.registerFactory(() => BrandBloc(repository: sl()));

  // Wallet
  sl.registerLazySingleton<WalletRemoteDataSource>(
    () => WalletRemoteDataSourceImpl(dio: sl<ApiClient>().dio),
  );
  sl.registerLazySingleton<WalletRepository>(
    () => WalletRepositoryImpl(remoteDataSource: sl()),
  );
  sl.registerFactory(() => WalletBloc(repository: sl()));
  sl.registerFactory(() => ThemeBloc(sl()));

  // Chat
  sl.registerLazySingleton<ChatRemoteDataSource>(
    () => ChatRemoteDataSourceImpl(dio: sl<ApiClient>().dio),
  );
  sl.registerLazySingleton<ChatRepository>(
    () => ChatRepositoryImpl(remoteDataSource: sl()),
  );
  sl.registerFactory(() => ChatBloc(repository: sl()));
  sl.registerFactory(() => TrackingBloc(repository: sl()));

  // Vendor
  sl.registerLazySingleton<VendorRepository>(
    () => VendorRepositoryImpl(sl<VendorService>()),
  );
}
