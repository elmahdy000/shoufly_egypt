import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:shoofly_core/core/theme/app_colors.dart';
import 'package:shoofly_core/core/theme/app_typography.dart';
import 'package:shoofly_core/core/utils/toasts.dart';
import 'package:shoofly_core/domain/entities/category.dart';
import 'package:shoofly_core/domain/entities/brand.dart';
import 'package:shoofly_core/presentation/blocs/category/category_bloc.dart';
import 'package:shoofly_core/presentation/blocs/request/request_bloc.dart';
import 'create_request_validation.dart';
import 'widgets/details_step.dart';
import 'widgets/image_step.dart';
import 'widgets/location_step.dart';
import 'widgets/map_picker_page.dart';

enum _CreateRequestStep { images, details, location }

class CreateRequestPage extends StatefulWidget {
  final Category? initialCategory;
  final ImageSource? initialImageSource;

  const CreateRequestPage({
    super.key,
    this.initialCategory,
    this.initialImageSource,
  });

  @override
  State<CreateRequestPage> createState() => _CreateRequestPageState();
}

class _CreateRequestPageState extends State<CreateRequestPage> {
  static const int _maxImages = 5;

  final ImagePicker _picker = ImagePicker();
  late final TextEditingController _titleController;
  late final TextEditingController _descriptionController;
  late final TextEditingController _phoneController;

  final List<Map<String, dynamic>> _uploadedImages = [];
  Category? _selectedCategory;
  Brand? _selectedBrand;
  LocationResult? _selectedLocation;
  _CreateRequestStep _currentStep = _CreateRequestStep.images;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController();
    _descriptionController = TextEditingController();
    _phoneController = TextEditingController();
    _selectedCategory = widget.initialCategory;

    final categoryState = context.read<CategoryBloc>().state;
    if (categoryState is! CategoriesLoaded &&
        categoryState is! CategoriesRefreshError &&
        categoryState is! CategoryLoading) {
      context.read<CategoryBloc>().add(LoadCategories());
    }

    if (widget.initialImageSource != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          _pickImage(widget.initialImageSource!);
        }
      });
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  int get _stepIndex => _CreateRequestStep.values.indexOf(_currentStep);
  bool get _isLastStep => _currentStep == _CreateRequestStep.location;
  bool get _hasUnsavedChanges =>
      _uploadedImages.isNotEmpty ||
      _titleController.text.trim().isNotEmpty ||
      _descriptionController.text.trim().isNotEmpty ||
      _phoneController.text.trim().isNotEmpty ||
      _selectedCategory != null ||
      _selectedBrand != null ||
      _selectedLocation != null;

  Future<void> _pickImage(ImageSource source) async {
    if (_uploadedImages.length >= _maxImages) {
      AppToasts.showError(context, 'الحد الأقصى هو $_maxImages صور');
      return;
    }

    try {
      final image = await _picker.pickImage(
        source: source,
        imageQuality: 70,
      );

      if (!mounted || image == null) return;
      context.read<RequestBloc>().add(UploadImage(image.path));
    } catch (_) {
      if (mounted) {
        AppToasts.showError(
          context,
          'فشل في اختيار الصورة، يرجى المحاولة مرة أخرى',
        );
      }
    }
  }

  Future<void> _showImagePickerModal() async {
    await showModalBottomSheet<void>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      backgroundColor: Theme.of(context).cardColor,
      builder: (modalContext) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(24, 18, 24, 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 42,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                Text('إضافة صور للطلب', style: AppTypography.h3),
                const SizedBox(height: 6),
                Text(
                  'اختَر الطريقة المناسبة، وسنجهز المعاينة فوراً.',
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: _PickerOptionCard(
                        icon: LucideIcons.camera,
                        title: 'الكاميرا',
                        subtitle: 'تصوير مباشر',
                        onTap: () {
                          Navigator.pop(modalContext);
                          _pickImage(ImageSource.camera);
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _PickerOptionCard(
                        icon: LucideIcons.image,
                        title: 'المعرض',
                        subtitle: 'اختيار من الصور',
                        onTap: () {
                          Navigator.pop(modalContext);
                          _pickImage(ImageSource.gallery);
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  String? _validateCurrentStep() {
    switch (_currentStep) {
      case _CreateRequestStep.images:
        return null;
      case _CreateRequestStep.details:
        return CreateRequestValidation.validateDetails(
          title: _titleController.text,
          description: _descriptionController.text,
          hasCategory: _selectedCategory != null,
        );
      case _CreateRequestStep.location:
        return CreateRequestValidation.validateLocation(
          location: _selectedLocation,
          deliveryPhone: _phoneController.text,
        );
    }
  }

  Future<bool> _confirmDiscardIfNeeded() async {
    if (!_hasUnsavedChanges) return true;

    final shouldDiscard = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          title: Text('الخروج من الطلب؟', style: AppTypography.h3),
          content: Text(
            'لو خرجت الآن، هتضيع الصور والتفاصيل اللي أضفتها.',
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: const Text('إكمال الطلب'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(dialogContext, true),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error,
                foregroundColor: Colors.white,
              ),
              child: const Text('خروج'),
            ),
          ],
        );
      },
    );

    return shouldDiscard ?? false;
  }

  Future<void> _handleClose() async {
    final shouldClose = await _confirmDiscardIfNeeded();
    if (mounted && shouldClose) {
      Navigator.pop(context);
    }
  }

  void _submitRequest() {
    FocusScope.of(context).unfocus();
    final error = _validateCurrentStep();
    if (error != null) {
      AppToasts.showError(context, error);
      return;
    }

    context.read<RequestBloc>().add(
          CreateRequestSubmitted(
            title: _titleController.text.trim(),
            description: _descriptionController.text.trim(),
            categoryId: _selectedCategory!.id,
            brandId: _selectedBrand?.id,
            images: _uploadedImages,
            latitude: _selectedLocation!.latitude,
            longitude: _selectedLocation!.longitude,
            address: _selectedLocation!.address,
            governorateId: _selectedLocation!.governorate?.id,
            cityId: _selectedLocation!.city?.id,
            deliveryPhone: _phoneController.text.trim(),
          ),
        );
  }

  void _goToNextStep() {
    FocusScope.of(context).unfocus();
    final error = _validateCurrentStep();
    if (error != null) {
      AppToasts.showError(context, error);
      return;
    }

    setState(() {
      if (_currentStep == _CreateRequestStep.images) {
        _currentStep = _CreateRequestStep.details;
      } else if (_currentStep == _CreateRequestStep.details) {
        _currentStep = _CreateRequestStep.location;
      }
    });
  }

  void _goToPreviousStep() {
    FocusScope.of(context).unfocus();
    setState(() {
      if (_currentStep == _CreateRequestStep.location) {
        _currentStep = _CreateRequestStep.details;
      } else if (_currentStep == _CreateRequestStep.details) {
        _currentStep = _CreateRequestStep.images;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (!didPop) {
          await _handleClose();
        }
      },
      child: Directionality(
        textDirection: TextDirection.rtl,
        child: BlocConsumer<RequestBloc, RequestState>(
          listenWhen: (previous, current) =>
              current is ImageUploadSuccess ||
              current is RequestCreateSuccess ||
              current is RequestError,
          buildWhen: (previous, current) =>
              current is ImageUploadInProgress ||
              current is ImageUploadSuccess ||
              current is RequestSubmitInProgress ||
              current is RequestCreateSuccess ||
              current is RequestError,
          listener: (context, state) {
            if (state is ImageUploadSuccess) {
              setState(() => _uploadedImages.add(state.imageData));
            } else if (state is RequestCreateSuccess) {
              Navigator.pop(context);
              AppToasts.showSuccess(
                context,
                'تم نشر طلبك بنجاح! هنوصلّك بأفضل العروض قريباً.',
              );
            } else if (state is RequestError) {
              AppToasts.showError(context, state.message);
            }
          },
          builder: (context, state) {
            final isUploading = state is ImageUploadInProgress;
            final isSubmitting = state is RequestSubmitInProgress;

            return Scaffold(
              backgroundColor: Theme.of(context).scaffoldBackgroundColor,
              appBar: AppBar(
                backgroundColor: Theme.of(context).appBarTheme.backgroundColor,
                elevation: 0,
                leading: IconButton(
                  icon: Icon(
                    Icons.close_rounded,
                    color: Theme.of(context).appBarTheme.foregroundColor,
                  ),
                  onPressed: isSubmitting ? null : _handleClose,
                ),
                titleSpacing: 0,
                title: _CreateRequestHeader(
                  currentIndex: _stepIndex,
                  totalSteps: _CreateRequestStep.values.length,
                  title: _titleForStep(_currentStep),
                  subtitle: _subtitleForStep(_currentStep),
                ),
              ),
              body: Column(
                children: [
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    height: (isUploading || isSubmitting) ? 3 : 0,
                    child: (isUploading || isSubmitting)
                        ? const LinearProgressIndicator(
                            backgroundColor: Colors.white,
                            color: AppColors.primary,
                          )
                        : null,
                  ),
                  Expanded(
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 220),
                      child: _CreateRequestStage(
                        key: ValueKey(_currentStep),
                        title: _sectionTitle(_currentStep),
                        hint: _sectionHint(_currentStep),
                        child: _buildCurrentStep(
                          isUploading: isUploading,
                        ),
                      ),
                    ),
                  ),
                  _CreateRequestBottomBar(
                    isSubmitting: isSubmitting,
                    isLastStep: _isLastStep,
                    stepIndex: _stepIndex,
                    onPrevious: _goToPreviousStep,
                    onNext: _goToNextStep,
                    onSubmit: _submitRequest,
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildCurrentStep({required bool isUploading}) {
    switch (_currentStep) {
      case _CreateRequestStep.images:
        return ImageStep(
          uploadedImages: _uploadedImages,
          isUploading: isUploading,
          onAddImage: _showImagePickerModal,
          onDeleteImage: (index) => setState(() {
            if (index >= 0 && index < _uploadedImages.length) {
              _uploadedImages.removeAt(index);
            }
          }),
          onSkip: _goToNextStep,
        );
      case _CreateRequestStep.details:
        return DetailsStep(
          titleController: _titleController,
          descriptionController: _descriptionController,
          selectedCategory: _selectedCategory,
          selectedBrand: _selectedBrand,
          onCategorySelected: (category) {
            setState(() {
              if (_selectedCategory?.id != category?.id) {
                _selectedBrand = null;
              }
              _selectedCategory = category;
            });
          },
          onBrandSelected: (brand) {
            setState(() => _selectedBrand = brand);
          },
        );
      case _CreateRequestStep.location:
        return LocationStep(
          selectedLocation: _selectedLocation,
          phoneController: _phoneController,
          onLocationChanged: (location) =>
              setState(() => _selectedLocation = location),
        );
    }
  }

  String _titleForStep(_CreateRequestStep step) {
    switch (step) {
      case _CreateRequestStep.images:
        return 'إنشاء طلب جديد';
      case _CreateRequestStep.details:
        return 'تفاصيل الطلب';
      case _CreateRequestStep.location:
        return 'بيانات التوصيل';
    }
  }

  String _subtitleForStep(_CreateRequestStep step) {
    switch (step) {
      case _CreateRequestStep.images:
        return 'ارفع صوراً إن وجدت أو أكمل بالنص فقط';
      case _CreateRequestStep.details:
        return 'خلّي وصفك واضحاً ليصلك عرض أدق';
      case _CreateRequestStep.location:
        return 'حدّد العنوان ورقم التواصل بدقة';
    }
  }

  String _sectionTitle(_CreateRequestStep step) {
    switch (step) {
      case _CreateRequestStep.images:
        return 'إيه اللي بتدور عليه؟';
      case _CreateRequestStep.details:
        return 'اشرح الطلب باختصار واضح';
      case _CreateRequestStep.location:
        return 'مكان التوصيل';
    }
  }

  String _sectionHint(_CreateRequestStep step) {
    switch (step) {
      case _CreateRequestStep.images:
        return 'وجود صورة يساعد الموردين على فهم طلبك أسرع، لكنه ليس إلزامياً.';
      case _CreateRequestStep.details:
        return 'العنوان والوصف الجيدين يوفّران وقتاً في مراجعة الطلب وإرسال العروض.';
      case _CreateRequestStep.location:
        return 'سنستخدم الموقع والمحافظة والمدينة لتوجيه الطلب للموردين المناسبين.';
    }
  }
}

class _CreateRequestHeader extends StatelessWidget {
  final int currentIndex;
  final int totalSteps;
  final String title;
  final String subtitle;

  const _CreateRequestHeader({
    required this.currentIndex,
    required this.totalSteps,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                title,
                style: AppTypography.labelLarge.copyWith(
                  fontWeight: FontWeight.w900,
                  color: Theme.of(context).textTheme.titleLarge?.color,
                ),
              ),
            ),
            Text(
              '${currentIndex + 1}/$totalSteps',
              style: AppTypography.labelSmall.copyWith(
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          subtitle,
          style: AppTypography.bodySmall.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 10),
        Row(
          children: List.generate(totalSteps, (index) {
            final isActive = index == currentIndex;
            final isDone = index < currentIndex;
            return Expanded(
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                height: 6,
                margin: EdgeInsetsDirectional.only(end: index == totalSteps - 1 ? 0 : 6),
                decoration: BoxDecoration(
                  color: isActive
                      ? AppColors.primary
                      : isDone
                          ? AppColors.primary.withValues(alpha: 0.45)
                          : AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
            );
          }),
        ),
      ],
    );
  }
}

class _CreateRequestStage extends StatelessWidget {
  final String title;
  final String hint;
  final Widget child;

  const _CreateRequestStage({
    super.key,
    required this.title,
    required this.hint,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(24, 18, 24, 14),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            border: Border(
              bottom: BorderSide(
                color: AppColors.surfaceVariant.withValues(alpha: 0.5),
              ),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppTypography.h3.copyWith(
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                hint,
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                  height: 1.35,
                ),
              ),
            ],
          ),
        ),
        Expanded(child: child),
      ],
    );
  }
}

class _CreateRequestBottomBar extends StatelessWidget {
  final bool isSubmitting;
  final bool isLastStep;
  final int stepIndex;
  final VoidCallback onPrevious;
  final VoidCallback onNext;
  final VoidCallback onSubmit;

  const _CreateRequestBottomBar({
    required this.isSubmitting,
    required this.isLastStep,
    required this.stepIndex,
    required this.onPrevious,
    required this.onNext,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 14, 20, 24),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 18,
            offset: const Offset(0, -8),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            if (stepIndex > 0) ...[
              _StepSecondaryButton(
                icon: LucideIcons.chevronRight,
                onTap: isSubmitting ? null : onPrevious,
              ),
              const SizedBox(width: 12),
            ],
            Expanded(
              child: ElevatedButton(
                onPressed: isSubmitting ? null : (isLastStep ? onSubmit : onNext),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  disabledBackgroundColor:
                      AppColors.primary.withValues(alpha: 0.55),
                  minimumSize: const Size.fromHeight(56),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(18),
                  ),
                  elevation: 0,
                ),
                child: isSubmitting
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2.4,
                        ),
                      )
                    : Text(
                        isLastStep ? 'نشر الطلب الآن' : 'المتابعة',
                        style: AppTypography.labelLarge.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StepSecondaryButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;

  const _StepSecondaryButton({
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          color: AppColors.surfaceVariant.withValues(alpha: 0.35),
          borderRadius: BorderRadius.circular(18),
        ),
        child: Icon(icon, color: AppColors.textPrimary),
      ),
    );
  }
}

class _PickerOptionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _PickerOptionCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: AppColors.primary.withValues(alpha: 0.1),
          ),
        ),
        child: Column(
          children: [
            Container(
              width: 54,
              height: 54,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
              ),
              child: Icon(icon, color: AppColors.primary),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: AppTypography.labelLarge.copyWith(
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
