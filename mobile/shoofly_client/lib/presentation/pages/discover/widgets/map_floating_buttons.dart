import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:shoofly_core/core/theme/app_colors.dart';
import '../cubit/requests_map_cubit.dart';

class MapFloatingButtons extends StatelessWidget {
  const MapFloatingButtons({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _buildFab(
          context,
          icon: LucideIcons.rotateCw,
          onTap: () => context.read<RequestsMapCubit>().refreshRequests(),
          isSmall: true,
        ),
        const SizedBox(height: 12),
        _buildFab(
          context,
          icon: LucideIcons.locateFixed,
          onTap: () => context.read<RequestsMapCubit>().getCurrentLocation(),
        ),
      ],
    );
  }

  Widget _buildFab(
    BuildContext context, {
    required IconData icon,
    required VoidCallback onTap,
    bool isSmall = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(isSmall ? 10 : 14),
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.15),
              blurRadius: 15,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Icon(
          icon,
          color: AppColors.primary,
          size: isSmall ? 20 : 24,
        ),
      ),
    );
  }
}
