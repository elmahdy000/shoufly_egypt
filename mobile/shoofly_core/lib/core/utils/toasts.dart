import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../theme/app_colors.dart';
import '../../presentation/widgets/modern_toast.dart';

class AppToasts {
  static void showNotification(
    BuildContext context, {
    required String title,
    String? message,
    IconData icon = LucideIcons.bell,
    VoidCallback? onTap,
  }) {
    ModernToast.show(
      context,
      title: title,
      message: message ?? '',
      icon: icon,
      onTap: onTap,
    );
  }

  static void showError(BuildContext context, String message) {
    ModernToast.show(
      context,
      title: 'خطأ',
      message: message,
      icon: LucideIcons.circleAlert,
      color: AppColors.error,
    );
  }

  static void showSuccess(BuildContext context, String message) {
    ModernToast.show(
      context,
      title: 'تم بنجاح',
      message: message,
      icon: LucideIcons.check,
      color: AppColors.success,
    );
  }
}
