import 'package:flutter/material.dart';

class AppColors {
  // Brand Colors
  static const Color primary = Color(0xFFFF6B00); // Shoofly Orange
  static const Color primaryDark = Color(0xFFE65100);
  static const Color primaryLight = Color(0xFFFFB347);
  static const Color secondary = Color(0xFFFFF4E6); 

  // Background & Surface
  static const Color background = Color(0xFFF8FAFC); 
  static const Color surface = Color(0xFFFFFFFF); 
  static const Color surfaceVariant = Color(0xFFF1F5F9);
  static const Color divider = Color(0xFFE2E8F0);
  static const Color borderColor = Color(0xFFE5E7EB);

  // Status Colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  // Text Colors
  static const Color textPrimary = Color(0xFF1F2937);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textDisabled = Color(0xFF9CA3AF);

  // Shadow Color
  static const Color shadow = Color(0xFF000000);

  // Dark Mode Palette
  static const Color backgroundDark = Color(0xFF0F172A);
  static const Color surfaceDark = Color(0xFF1E293B);
  static const Color surfaceVariantDark = Color(0xFF334155);
  static const Color dividerDark = Color(0xFF334155);
  static const Color borderColorDark = Color(0xFF334155);
  
  static const Color textPrimaryDark = Color(0xFFF8FAFC);
  static const Color textSecondaryDark = Color(0xFF94A3B8);
  static const Color textDisabledDark = Color(0xFF64748B);

  // Gradients removed per user request
  static const Color accentColor = primary;

  // Helper to get colors based on brightness
  static Color getBackgroundColor(bool isDark) => isDark ? backgroundDark : background;
  static Color getSurfaceColor(bool isDark) => isDark ? surfaceDark : surface;
  static Color getTextColor(bool isDark) => isDark ? textPrimaryDark : textPrimary;
}
