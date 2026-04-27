import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:shoofly_core/core/theme/app_colors.dart';
import 'package:shoofly_core/core/theme/app_typography.dart';
import 'package:shoofly_core/domain/entities/category.dart';
import 'package:shoofly_core/domain/entities/brand.dart';
import 'package:shoofly_core/presentation/blocs/category/category_bloc.dart';
import 'package:shoofly_core/presentation/blocs/brand/brand_bloc.dart';

class DetailsStep extends StatelessWidget {
  final TextEditingController titleController;
  final TextEditingController descriptionController;
  final Category? selectedCategory;
  final ValueChanged<Category?> onCategorySelected;
  final Brand? selectedBrand;
  final ValueChanged<Brand?> onBrandSelected;

  const DetailsStep({
    super.key,
    required this.titleController,
    required this.descriptionController,
    required this.selectedCategory,
    required this.onCategorySelected,
    required this.selectedBrand,
    required this.onBrandSelected,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _FieldSection(
            label: 'القسم',
            helper:
                'اختيار القسم الصحيح يوجّه طلبك للموردين الأنسب من البداية.',
            child: _CategorySelector(
              selectedCategory: selectedCategory,
              onCategorySelected: (category) {
                onCategorySelected(category);
                if (category != null) {
                  // فلترة الماركات بـ brandType بتاعت الـ category (الطريقة الصحيحة)
                  context.read<BrandBloc>().add(LoadBrands(type: category.brandType));
                }
              },
            ),
          ),
          if (selectedCategory != null) ...[
            const SizedBox(height: 24),
            _FieldSection(
              label: 'الماركة (اختياري)',
              helper: 'تحديد الماركة يساعد في الحصول على عروض قطع غيار مطابقة تماماً.',
              child: _BrandSelector(
                selectedBrand: selectedBrand,
                onBrandSelected: onBrandSelected,
              ),
            ),
          ],
          const SizedBox(height: 24),
          _FieldSection(
            label: 'عنوان الطلب',
            helper: 'اكتب عنواناً مباشراً يوضح المطلوب في أقل عدد كلمات.',
            child: _RequestTextField(
              controller: titleController,
              hintText: 'مثال: فلتر زيت تويوتا كورولا 2020',
              maxLines: 1,
              maxLength: 100,
              prefixIcon: LucideIcons.pencilLine,
            ),
          ),
          const SizedBox(height: 24),
          _FieldSection(
            label: 'وصف الطلب',
            helper:
                'اذكر أي تفاصيل مهمة مثل المقاس أو اللون أو الحالة أو العدد المطلوب.',
            child: _RequestTextField(
              controller: descriptionController,
              hintText:
                  'مثال: أحتاج قطعتين جديدتين أصلي أو بديل محترم، والتسليم في نفس الأسبوع.',
              maxLines: 6,
              minLines: 5,
              maxLength: 1000,
              prefixIcon: LucideIcons.fileText,
            ),
          ),
        ],
      ),
    );
  }
}

class _CategorySelector extends StatelessWidget {
  final Category? selectedCategory;
  final ValueChanged<Category?> onCategorySelected;

  const _CategorySelector({
    required this.selectedCategory,
    required this.onCategorySelected,
  });

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CategoryBloc, CategoryState>(
      buildWhen: (previous, current) =>
          current is CategoryLoading ||
          current is CategoriesLoaded ||
          current is CategoriesRefreshError ||
          current is CategoryError,
      builder: (context, state) {
        if (state is CategoryLoading) {
          return const _SelectorPlaceholder();
        }

        if (state is CategoriesLoaded || state is CategoriesRefreshError) {
          final categories = state is CategoriesLoaded
              ? state.categories
              : (state as CategoriesRefreshError).categories;
          final subcategories = <Category>[];
          for (var cat in categories) {
            if (cat.subcategories != null && cat.subcategories!.isNotEmpty) {
              subcategories.addAll(cat.subcategories!);
            } else {
              subcategories.add(cat);
            }
          }

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              InkWell(
                onTap: () => _showCategorySheet(context, subcategories),
                borderRadius: BorderRadius.circular(20),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 18,
                    vertical: 16,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: selectedCategory == null
                          ? AppColors.surfaceVariant
                          : AppColors.primary.withValues(alpha: 0.35),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.03),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 42,
                        height: 42,
                        decoration: BoxDecoration(
                          color: selectedCategory == null
                              ? AppColors.surfaceVariant.withValues(alpha: 0.25)
                              : AppColors.primary.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Icon(
                          selectedCategory == null
                              ? LucideIcons.layoutGrid
                              : LucideIcons.check,
                          color: selectedCategory == null
                              ? AppColors.textSecondary
                              : AppColors.primary,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              selectedCategory?.nameAr ?? selectedCategory?.name ?? 'اختر القسم المناسب',
                              style: AppTypography.labelLarge.copyWith(
                                fontWeight: FontWeight.w800,
                                color: selectedCategory == null
                                    ? AppColors.textPrimary
                                    : AppColors.primary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              selectedCategory == null
                                  ? 'اضغط لاختيار قسم فرعي دقيق'
                                  : 'يمكنك تغييره في أي وقت قبل النشر',
                              style: AppTypography.bodySmall.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Icon(
                        LucideIcons.chevronLeft,
                        color: AppColors.textDisabled,
                        size: 18,
                      ),
                    ],
                  ),
                ),
              ),
              if (state is CategoriesRefreshError) ...[
                const SizedBox(height: 10),
                Text(
                  state.message,
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.warning,
                  ),
                ),
              ],
            ],
          );
        }

        return _SelectorErrorState(
          onRetry: () => context.read<CategoryBloc>().add(LoadCategories()),
        );
      },
    );
  }

  Future<void> _showCategorySheet(
    BuildContext context,
    List<Category> subcategories,
  ) async {
    final selected = await showModalBottomSheet<Category>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).cardColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (sheetContext) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                Text('اختر القسم', style: AppTypography.h3),
                const SizedBox(height: 6),
                Text(
                  'كلما كان القسم أدق، وصلت عروض أكثر مناسبة.',
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 18),
                Flexible(
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: subcategories.length,
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final category = subcategories[index];
                      final isSelected = selectedCategory?.id == category.id;
                      return InkWell(
                        onTap: () => Navigator.pop(sheetContext, category),
                        borderRadius: BorderRadius.circular(18),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppColors.primary.withValues(alpha: 0.06)
                                : Colors.white,
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(
                              color: isSelected
                                  ? AppColors.primary.withValues(alpha: 0.3)
                                  : AppColors.surfaceVariant,
                            ),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  category.nameAr ?? category.name,
                                  style: AppTypography.labelLarge.copyWith(
                                    color: isSelected
                                        ? AppColors.primary
                                        : AppColors.textPrimary,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                              if (isSelected)
                                const Icon(
                                  LucideIcons.check,
                                  size: 18,
                                  color: AppColors.primary,
                                ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );

    if (selected != null) {
      onCategorySelected(selected);
    }
  }
}

class _FieldSection extends StatelessWidget {
  final String label;
  final String helper;
  final Widget child;

  const _FieldSection({
    required this.label,
    required this.helper,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTypography.labelLarge),
        const SizedBox(height: 6),
        Text(
          helper,
          style: AppTypography.bodySmall.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 12),
        child,
      ],
    );
  }
}

class _RequestTextField extends StatelessWidget {
  final TextEditingController controller;
  final String hintText;
  final int maxLines;
  final int? minLines;
  final int maxLength;
  final IconData prefixIcon;

  const _RequestTextField({
    required this.controller,
    required this.hintText,
    required this.maxLines,
    this.minLines,
    required this.maxLength,
    required this.prefixIcon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: TextField(
        controller: controller,
        maxLines: maxLines,
        minLines: minLines,
        maxLength: maxLength,
        style: AppTypography.labelLarge.copyWith(
          fontWeight: FontWeight.w600,
        ),
        decoration: InputDecoration(
          prefixIcon: Padding(
            padding: const EdgeInsetsDirectional.only(start: 14, end: 8),
            child: Icon(prefixIcon, size: 18, color: AppColors.textSecondary),
          ),
          prefixIconConstraints: const BoxConstraints(minWidth: 0),
          hintText: hintText,
          hintStyle: AppTypography.bodySmall.copyWith(
            color: AppColors.textDisabled,
            height: 1.45,
          ),
          counterStyle: AppTypography.labelSmall.copyWith(
            color: AppColors.textDisabled,
          ),
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 18,
            vertical: 18,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(20),
            borderSide: BorderSide(
              color: AppColors.surfaceVariant.withValues(alpha: 0.5),
            ),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(20),
            borderSide: BorderSide(
              color: AppColors.surfaceVariant.withValues(alpha: 0.5),
            ),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(20),
            borderSide: const BorderSide(
              color: AppColors.primary,
              width: 1.5,
            ),
          ),
        ),
      ),
    );
  }
}

class _SelectorPlaceholder extends StatelessWidget {
  const _SelectorPlaceholder();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 76,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.surfaceVariant),
      ),
      alignment: Alignment.center,
      child: const SizedBox(
        width: 22,
        height: 22,
        child: CircularProgressIndicator(
          strokeWidth: 2.2,
          color: AppColors.primary,
        ),
      ),
    );
  }
}

class _SelectorErrorState extends StatelessWidget {
  final VoidCallback onRetry;

  const _SelectorErrorState({required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.surfaceVariant),
      ),
      child: Row(
        children: [
          const Icon(
            LucideIcons.triangleAlert,
            color: AppColors.warning,
            size: 18,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'تعذر تحميل الأقسام الآن',
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ),
          TextButton(
            onPressed: onRetry,
            child: const Text('إعادة المحاولة'),
          ),
        ],
      ),
    );
  }
}
class _BrandSelector extends StatelessWidget {
  final Brand? selectedBrand;
  final ValueChanged<Brand?> onBrandSelected;

  const _BrandSelector({
    required this.selectedBrand,
    required this.onBrandSelected,
  });

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<BrandBloc, BrandState>(
      builder: (context, state) {
        final isLoading = state is BrandLoading;
        final brands = state is BrandsLoaded ? state.brands : <Brand>[];

        return InkWell(
          onTap: isLoading || brands.isEmpty
              ? null
              : () => _showBrandSheet(context, brands),
          borderRadius: BorderRadius.circular(20),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: selectedBrand == null
                    ? AppColors.surfaceVariant
                    : AppColors.primary.withValues(alpha: 0.35),
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: selectedBrand == null
                        ? AppColors.surfaceVariant.withValues(alpha: 0.25)
                        : AppColors.primary.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: isLoading
                      ? const Padding(
                          padding: EdgeInsets.all(12),
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: AppColors.primary,
                          ),
                        )
                      : Icon(
                          selectedBrand == null
                              ? LucideIcons.tags
                              : LucideIcons.check,
                          color: selectedBrand == null
                              ? AppColors.textSecondary
                              : AppColors.primary,
                          size: 20,
                        ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        selectedBrand?.name ?? 'اختر الماركة',
                        style: AppTypography.labelLarge.copyWith(
                          fontWeight: FontWeight.w800,
                          color: selectedBrand == null
                              ? AppColors.textPrimary
                              : AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        isLoading
                            ? 'جاري تحميل الماركات...'
                            : brands.isEmpty
                                ? 'لا توجد ماركات لهذا القسم'
                                : selectedBrand == null
                                    ? 'اختياري ولكن يفضل تحديده'
                                    : 'تم التحديد بنجاح',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(
                  LucideIcons.chevronLeft,
                  color: AppColors.textDisabled,
                  size: 18,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _showBrandSheet(BuildContext context, List<Brand> brands) async {
    final selected = await showModalBottomSheet<Brand>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).cardColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (sheetContext) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                Text('اختر الماركة', style: AppTypography.h3),
                const SizedBox(height: 6),
                Text(
                  'اختر ماركة السيارة أو المنتج للحصول على قطع غيار دقيقة.',
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 18),
                Flexible(
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: brands.length,
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final brand = brands[index];
                      final isSelected = selectedBrand?.id == brand.id;
                      return InkWell(
                        onTap: () => Navigator.pop(sheetContext, brand),
                        borderRadius: BorderRadius.circular(18),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppColors.primary.withValues(alpha: 0.06)
                                : Colors.white,
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(
                              color: isSelected
                                  ? AppColors.primary.withValues(alpha: 0.3)
                                  : AppColors.surfaceVariant,
                            ),
                          ),
                          child: Row(
                            children: [
                              if (brand.logo != null) ...[
                                Image.network(
                                  brand.logo!,
                                  width: 24,
                                  height: 24,
                                  errorBuilder: (_, __, ___) =>
                                      const Icon(LucideIcons.image, size: 24),
                                ),
                                const SizedBox(width: 12),
                              ],
                              Expanded(
                                child: Text(
                                  brand.name,
                                  style: AppTypography.labelLarge.copyWith(
                                    color: isSelected
                                        ? AppColors.primary
                                        : AppColors.textPrimary,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                              if (isSelected)
                                const Icon(
                                  LucideIcons.check,
                                  size: 18,
                                  color: AppColors.primary,
                                ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );

    if (selected != null) {
      onBrandSelected(selected);
    }
  }
}
