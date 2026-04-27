import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

import '../../core/widgets/modern_widgets.dart';

class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? action;
  final VoidCallback? onActionPressed;
  final String? actionLabel;
  final bool isFullScreen;

  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.action,
    this.onActionPressed,
    this.actionLabel,
    this.isFullScreen = false,
  });

  factory EmptyState.noData({
    String title = 'لا توجد بيانات',
    String? subtitle,
    VoidCallback? onActionPressed,
    String? actionLabel,
  }) {
    return EmptyState(
      icon: LucideIcons.inbox,
      title: title,
      subtitle: subtitle,
      onActionPressed: onActionPressed,
      actionLabel: actionLabel,
    );
  }

  factory EmptyState.noOrders({
    String title = 'لا توجد طلبات',
    String? subtitle,
    VoidCallback? onActionPressed,
    String? actionLabel = 'طلب جديد',
  }) {
    return EmptyState(
      icon: LucideIcons.shoppingCart,
      title: title,
      subtitle: subtitle ?? 'لم تقم بإنشاء أي طلبات بعد',
      onActionPressed: onActionPressed,
      actionLabel: actionLabel,
    );
  }

  factory EmptyState.noSearchResults({
    String title = 'لا توجد نتائج',
    String? subtitle,
    VoidCallback? onActionPressed,
    String? actionLabel,
  }) {
    return EmptyState(
      icon: LucideIcons.search,
      title: title,
      subtitle: subtitle ?? 'جرب البحث بكلمات مختلفة',
      onActionPressed: onActionPressed,
      actionLabel: actionLabel,
    );
  }

  factory EmptyState.noInternet({
    VoidCallback? onActionPressed,
    String? actionLabel = 'إعادة المحاولة',
  }) {
    return EmptyState(
      icon: LucideIcons.wifiOff,
      title: 'لا يوجد اتصال',
      subtitle: 'تأكد من اتصالك بالإنترنت وحاول مرة أخرى',
      onActionPressed: onActionPressed,
      actionLabel: actionLabel,
    );
  }

  factory EmptyState.error({
    String title = 'حدث خطأ',
    String? subtitle,
    VoidCallback? onActionPressed,
    String? actionLabel = 'إعادة المحاولة',
  }) {
    return EmptyState(
      icon: Icons.warning_amber,
      title: title,
      subtitle: subtitle ?? 'حدث خطأ غير متوقع',
      onActionPressed: onActionPressed,
      actionLabel: actionLabel,
    );
  }

  @override
  Widget build(BuildContext context) {
    final content = SingleChildScrollView(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          Stack(
            alignment: Alignment.center,
            children: [
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.05),
                  shape: BoxShape.circle,
                ),
              ),
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icon,
                  size: 40,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 32),
          Text(
            title,
            style: AppTypography.h3.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w900,
            ),
            textAlign: TextAlign.center,
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 12),
            Text(
              subtitle!,
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.textSecondary,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
          ],
          if (action != null || onActionPressed != null) ...[
            const SizedBox(height: 32),
            action ??
                ModernButton(
                  text: actionLabel ?? 'إعادة المحاولة',
                  onPressed: onActionPressed,
                  fullWidth: false,
                  padding: const EdgeInsets.symmetric(horizontal: 32),
                  icon: LucideIcons.refreshCw,
                ),
          ],
        ],
      ),
    );

    if (isFullScreen) {
      return Scaffold(
        body: Center(child: content),
      );
    }

    return Center(child: content);
  }
}
