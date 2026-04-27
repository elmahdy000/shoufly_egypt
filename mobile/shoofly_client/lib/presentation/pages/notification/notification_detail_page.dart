import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:shoofly_core/core/theme/app_colors.dart';
import 'package:shoofly_core/core/theme/app_typography.dart';
import 'package:shoofly_core/core/widgets/modern_widgets.dart';
import 'package:shoofly_core/features/notifications/data/notification_stream_service.dart' as notification_service;

class NotificationDetailPage extends StatelessWidget {
  final notification_service.NotificationEvent notification;

  const NotificationDetailPage({super.key, required this.notification});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: ModernAppBar(
        title: 'تفاصيل الإشعار',
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            ModernCard(
              padding: const EdgeInsets.all(32),
              borderRadius: 32,
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      _getTypeIcon(notification.type),
                      color: AppColors.primary,
                      size: 40,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    notification.title,
                    style: AppTypography.h3,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _formatDate(notification.createdAt),
                    style: AppTypography.bodySmall.copyWith(color: AppColors.textDisabled),
                  ),
                  const SizedBox(height: 32),
                  const Divider(),
                  const SizedBox(height: 32),
                  Text(
                    notification.message ?? '',
                    style: AppTypography.bodyMedium.copyWith(
                      color: AppColors.textSecondary,
                      height: 1.6,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 40),
                  if (notification.requestId != null)
                    ModernButton(
                      text: 'عرض الطلب المرتبط',
                      icon: LucideIcons.externalLink,
                      onPressed: () {
                        // Navigation logic for request handled in the parent/home
                        Navigator.pop(context, 'VIEW_REQUEST');
                      },
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getTypeIcon(String type) {
    switch (type) {
      case 'NEW_BID':
        return LucideIcons.gavel;
      case 'STATUS_CHANGE':
        return LucideIcons.refreshCcw;
      case 'NEW_MESSAGE':
        return LucideIcons.messageSquare;
      default:
        return LucideIcons.bell;
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year} الساعة ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }
}
