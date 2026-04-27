import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:shoofly_core/core/theme/app_colors.dart';
import 'package:shoofly_core/core/theme/app_typography.dart';
import '../cubit/requests_map_cubit.dart';

class MapSearchHeader extends StatelessWidget {
  const MapSearchHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildSearchBar(context),
          const Divider(height: 1, color: AppColors.surfaceVariant),
          _buildQuickFilters(context),
        ],
      ),
    );
  }

  Widget _buildSearchBar(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Row(
        children: [
          const Icon(LucideIcons.search, color: AppColors.textDisabled, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: TextField(
              onChanged: (val) => context.read<RequestsMapCubit>().applySearch(val),
              decoration: InputDecoration(
                hintText: 'ابحث عن طلبات (ميكانيكا، كهرباء...)',
                hintStyle: AppTypography.bodySmall.copyWith(color: AppColors.textDisabled),
                border: InputBorder.none,
              ),
              style: AppTypography.labelLarge,
            ),
          ),
          _buildFilterIconButton(context),
        ],
      ),
    );
  }

  Widget _buildFilterIconButton(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: IconButton(
        icon: const Icon(LucideIcons.slidersHorizontal, color: AppColors.primary, size: 18),
        onPressed: () {
          // Future: Show advanced filter bottom sheet
        },
        visualDensity: VisualDensity.compact,
      ),
    );
  }

  Widget _buildQuickFilters(BuildContext context) {
    return BlocBuilder<RequestsMapCubit, RequestsMapState>(
      builder: (context, state) {
        final currentCat = (state is RequestsMapLoaded) ? state.activeCategoryFilter : null;
        
        return Container(
          height: 54,
          padding: const EdgeInsets.symmetric(vertical: 10),
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: [
              _FilterChip(
                label: 'الكل',
                isSelected: currentCat == null,
                onTap: () => context.read<RequestsMapCubit>().applyCategoryFilter(null),
              ),
              const SizedBox(width: 8),
              _FilterChip(
                label: 'ميكانيكا',
                isSelected: currentCat == 1,
                onTap: () => context.read<RequestsMapCubit>().applyCategoryFilter(1),
              ),
              const SizedBox(width: 8),
              _FilterChip(
                label: 'كهرباء',
                isSelected: currentCat == 2,
                onTap: () => context.read<RequestsMapCubit>().applyCategoryFilter(2),
              ),
              const SizedBox(width: 8),
              _FilterChip(
                label: 'إطارات',
                isSelected: currentCat == 3,
                onTap: () => context.read<RequestsMapCubit>().applyCategoryFilter(3),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.surfaceVariant,
          ),
        ),
        child: Text(
          label,
          style: AppTypography.labelSmall.copyWith(
            color: isSelected ? Colors.white : AppColors.textPrimary,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}
