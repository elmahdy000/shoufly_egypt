import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shoofly_core/core/di/injection.dart';
import 'package:shoofly_core/core/theme/app_colors.dart';
import 'package:shoofly_core/core/theme/app_typography.dart';
import 'package:shoofly_core/core/widgets/modern_widgets.dart';
import 'package:shoofly_core/presentation/blocs/brand/brand_bloc.dart';
import 'package:shoofly_core/domain/entities/category.dart';
import 'package:shoofly_core/domain/entities/brand.dart';
import '../request/create_request_page.dart';

class BrandsPage extends StatelessWidget {
  final Category category;
  final Category subcategory;

  const BrandsPage({
    super.key,
    required this.category,
    required this.subcategory,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: ModernAppBar(
        title: '${category.name} - ${subcategory.name}',
        backgroundColor: Theme.of(context).appBarTheme.backgroundColor,
        elevation: 0,
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back_ios_rounded),
        ),
      ),
      body: BlocProvider(
        create: (context) => sl<BrandBloc>()..add(LoadBrandsBySubcategory(subcategory.id.toString())),
        child: BlocBuilder<BrandBloc, BrandState>(
          builder: (context, state) {
            if (state is BrandLoading) {
              return const Center(child: CircularProgressIndicator());
            }

            if (state is BrandsLoaded) {
              if (state.brands.isEmpty) {
                return _buildEmptyState(context);
              }
              return _buildBrandsList(context, state.brands);
            }

            if (state is BrandError) {
              return _buildErrorState(context, state.message);
            }

            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }

  Widget _buildBrandsList(BuildContext context, List<Brand> brands) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: brands.length,
      itemBuilder: (context, index) {
        final brand = brands[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: ModernCard(
            onTap: () => _onBrandTap(context, brand),
            padding: const EdgeInsets.all(16),
            borderRadius: 16,
            elevation: 0,
            borderColor: Theme.of(context).dividerColor,
            backgroundColor: Theme.of(context).cardTheme.color,
            child: Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: brand.logo != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.network(
                            brand.logo!,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => const Icon(
                              Icons.business_outlined,
                              color: AppColors.primary,
                            ),
                          ),
                        )
                      : const Icon(
                          Icons.business_outlined,
                          color: AppColors.primary,
                        ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        brand.name,
                        style: AppTypography.labelLarge.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'نوع: ${brand.type}',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                const Icon(
                  Icons.arrow_forward_ios_rounded,
                  size: 16,
                  color: AppColors.textDisabled,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.business_outlined,
            size: 64,
            color: AppColors.textDisabled,
          ),
          const SizedBox(height: 16),
          Text(
            'لا توجد ماركات',
            style: AppTypography.h3.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'يمكنك إنشاء طلب مباشرة في هذا التصنيف',
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.textDisabled,
            ),
          ),
          const SizedBox(height: 24),
          ModernButton(
            text: 'إنشاء طلب',
            onPressed: () => _navigateToCreateRequest(context),
            icon: Icons.add,
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.error_outline,
            size: 64,
            color: AppColors.error,
          ),
          const SizedBox(height: 16),
          Text(
            'حدث خطأ',
            style: AppTypography.h3.copyWith(
              color: AppColors.error,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            message,
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ModernButton(
            text: 'إعادة المحاولة',
            onPressed: () {
              context.read<BrandBloc>().add(LoadBrandsBySubcategory(subcategory.id.toString()));
            },
            icon: Icons.refresh,
          ),
        ],
      ),
    );
  }

  void _onBrandTap(BuildContext context, Brand brand) {
    _navigateToCreateRequest(context);
  }

  void _navigateToCreateRequest(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CreateRequestPage(
          initialCategory: subcategory,
        ),
      ),
    );
  }
}
