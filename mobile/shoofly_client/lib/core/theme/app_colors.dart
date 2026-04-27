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

  // Creative Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, Color(0xFFFF8C00)],
    begin: Alignment.centerRight,
    end: Alignment.centerLeft,
  );

  static const LinearGradient heroGradient = LinearGradient(
    colors: [
      Color(0xFFFF6B00),
      Color(0xFFFF8C00),
      Color(0xFFFFB347),
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}