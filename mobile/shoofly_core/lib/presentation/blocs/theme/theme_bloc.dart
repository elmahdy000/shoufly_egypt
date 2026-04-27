import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';

// --- Events ---
abstract class ThemeEvent extends Equatable {
  const ThemeEvent();
  @override
  List<Object?> get props => [];
}

class ThemeChanged extends ThemeEvent {
  final ThemeMode themeMode;
  const ThemeChanged(this.themeMode);
  @override
  List<Object?> get props => [themeMode];
}

class LoadTheme extends ThemeEvent {}

// --- State ---
class ThemeState extends Equatable {
  final ThemeMode themeMode;
  const ThemeState(this.themeMode);
  @override
  List<Object?> get props => [themeMode];
}

// --- Bloc ---
class ThemeBloc extends Bloc<ThemeEvent, ThemeState> {
  static const String _themeKey = 'app_theme_mode';
  final SharedPreferences _prefs;

  ThemeBloc(this._prefs) : super(const ThemeState(ThemeMode.system)) {
    on<ThemeChanged>(_onThemeChanged);
    on<LoadTheme>(_onLoadTheme);
  }

  void _onThemeChanged(ThemeChanged event, Emitter<ThemeState> emit) {
    _prefs.setString(_themeKey, event.themeMode.toString());
    emit(ThemeState(event.themeMode));
  }

  void _onLoadTheme(LoadTheme event, Emitter<ThemeState> emit) {
    final themeStr = _prefs.getString(_themeKey);
    if (themeStr != null) {
      final mode = ThemeMode.values.firstWhere(
        (e) => e.toString() == themeStr,
        orElse: () => ThemeMode.system,
      );
      emit(ThemeState(mode));
    }
  }
}
