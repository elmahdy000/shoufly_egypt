import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shoofly_core/core/di/injection.dart';
import 'package:shoofly_core/core/theme/app_colors.dart';
import 'package:shoofly_core/core/theme/app_typography.dart';
import 'package:shoofly_core/core/widgets/modern_widgets.dart';
import 'package:shoofly_core/presentation/blocs/category/category_bloc.dart';
import 'package:shoofly_core/domain/entities/category.dart';
import 'brands_page.dart';
import '../request/create_request_page.dart';

class SubcategoriesPage extends StatelessWidget {
  final Category category;

  const SubcategoriesPage({
    super.key,
    required this.category,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: ModernAppBar(
        title: category.name,
        backgroundColor: Theme.of(context).appBarTheme.backgroundColor,
        elevation: 0,
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back_ios_rounded),
        ),
      ),
      body: BlocProvider(
        create: (context) => sl<CategoryBloc>()..add(LoadSubcategories(category.id.toString())),
        child: BlocBuilder<CategoryBloc, CategoryState>(
          builder: (context, state) {
            if (state is CategoryLoading) {
              return const Center(child: CircularProgressIndicator());
            }

            if (state is SubcategoriesLoaded) {
              if (state.subcategories.isEmpty) {
                return _buildEmptyState(context);
              }
              return _buildSubcategoriesList(context, state.subcategories);
            }

            if (state is CategoryError) {
              return _buildErrorState(context, state.message);
            }

            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }

  Widget _buildSubcategoriesList(BuildContext context, List<Category> subcategories) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: subcategories.length,
      itemBuilder: (context, index) {
        final subcategory = subcategories[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: ModernCard(
            onTap: () => _onSubcategoryTap(context, subcategory),
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
                  child: const Icon(
                    Icons.category_outlined,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        subcategory.name,
                        style: AppTypography.labelLarge.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
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
            Icons.category_outlined,
            size: 64,
            color: AppColors.textDisabled,
          ),
          const SizedBox(height: 16),
          Text(
            'لا توجد تصنيفات فرعية',
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
            onPressed: () => _navigateToCreateRequest(context, category: category),
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
              context.read<CategoryBloc>().add(LoadSubcategories(category.id.toString()));
            },
            icon: Icons.refresh,
          ),
        ],
      ),
    );
  }

  void _onSubcategoryTap(BuildContext context, Category subcategory) {
    // Navigate to brands page or create request if no brands
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => BrandsPage(
          category: category,
          subcategory: subcategory,
        ),
      ),
    );
  }

  void _navigateToCreateRequest(BuildContext context, {required Category category, Category? subcategory}) {
    final targetCategory = subcategory ?? category;
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CreateRequestPage(initialCategory: targetCategory),
      ),
    );
  }
}
