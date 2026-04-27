import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:shoofly_core/core/di/injection.dart';
import 'package:shoofly_core/presentation/blocs/auth/auth_bloc.dart';
import 'package:shoofly_core/presentation/blocs/request/request_bloc.dart';
import 'package:shoofly_core/presentation/blocs/notification/notification_bloc.dart';
import 'package:shoofly_core/presentation/blocs/category/category_bloc.dart';
import 'package:shoofly_core/presentation/blocs/brand/brand_bloc.dart';
import 'package:shoofly_core/presentation/blocs/location/location_bloc.dart';
import 'package:shoofly_core/presentation/blocs/wallet/wallet_bloc.dart';
import 'package:shoofly_core/presentation/blocs/theme/theme_bloc.dart';
import 'package:shoofly_core/core/constants/app_strings.dart';
import 'package:shoofly_core/core/theme/app_theme.dart' as core_theme;
import 'presentation/pages/auth/landing_page.dart';
import 'presentation/pages/home/home_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initInjection();
  runApp(const ShooflyClientApp());
}

class ShooflyClientApp extends StatelessWidget {
  const ShooflyClientApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (context) => sl<AuthBloc>()..add(AuthCheckRequested()),
        ),
        BlocProvider(create: (context) => sl<RequestBloc>()),
        BlocProvider(create: (context) => sl<NotificationBloc>()),
        BlocProvider(create: (context) => sl<CategoryBloc>()),
        BlocProvider(create: (context) => sl<BrandBloc>()),
        BlocProvider(create: (context) => sl<LocationBloc>()),
        BlocProvider(create: (context) => sl<WalletBloc>()),
        BlocProvider(create: (context) => sl<ThemeBloc>()..add(LoadTheme())),
      ],
      child: BlocBuilder<ThemeBloc, ThemeState>(
        builder: (context, themeState) {
          return MaterialApp(
            title: AppStrings.appName,
            debugShowCheckedModeBanner: false,
            theme: core_theme.AppTheme.lightTheme,
            darkTheme: core_theme.AppTheme.darkTheme,
            themeMode: themeState.themeMode,
            locale: const Locale('ar', 'EG'),
            supportedLocales: const [Locale('ar', 'EG')],
            localizationsDelegates: const [
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            home: BlocConsumer<AuthBloc, AuthState>(
              listener: (context, state) {
                if (state is Unauthenticated) {
                  context.read<NotificationBloc>().add(StopNotificationStream());
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (context) => const LandingPage()),
                    (route) => false,
                  );
                } else if (state is Authenticated) {
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (context) => const HomePage()),
                    (route) => false,
                  );
                }
              },
              builder: (context, state) {
                // Show loading only during the initial session check
                if (state is AuthInitial) {
                  return const Scaffold(
                    body: Center(
                      child: CircularProgressIndicator(),
                    ),
                  );
                }
                
                // For all other states (AuthLoading during login, AuthError, etc.) 
                // we stay on the LandingPage so the pushed Login/Register routes 
                // remain visible and functional.
                return const LandingPage();
              },
            ),
          );
        },
      ),
    );
  }
}
