import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:shoofly_core/core/theme/app_colors.dart';
import 'package:shoofly_core/core/theme/app_typography.dart';
import 'package:shoofly_core/core/widgets/modern_widgets.dart';
import 'package:shoofly_core/domain/entities/bid.dart';
import 'package:shoofly_core/presentation/blocs/vendor/vendor_bloc.dart';

class BidDetailsPage extends StatefulWidget {
  final Bid bid;

  const BidDetailsPage({super.key, required this.bid});

  @override
  State<BidDetailsPage> createState() => _BidDetailsPageState();
}

class _BidDetailsPageState extends State<BidDetailsPage> {
  late final TextEditingController _priceController;
  late final TextEditingController _durationController;
  late final TextEditingController _descriptionController;

  bool get _canEdit => widget.bid.status == BidStatus.PENDING;

  /// True only while we are waiting for an update initiated by this page.
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _priceController = TextEditingController(
      text: widget.bid.price.toStringAsFixed(0),
    );
    _durationController = TextEditingController(text: widget.bid.duration);
    _descriptionController = TextEditingController(text: widget.bid.notes);
  }

  @override
  void dispose() {
    _priceController.dispose();
    _durationController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<VendorBloc, VendorState>(
      listener: (context, state) {
        if (!_isSaving) return;
        if (!state.isLoading && state.error == null) {
          _isSaving = false;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('تم حفظ التعديل بنجاح', style: TextStyle(fontFamily: 'Cairo')),
              backgroundColor: AppColors.success,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          );
        } else if (!state.isLoading && state.error != null) {
          _isSaving = false;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.error!),
              backgroundColor: AppColors.error,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          );
        }
      },
      child: Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        appBar: const ModernAppBar(title: 'تفاصيل العرض'),
        body: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Status Section
              _buildStatusHeader(context),
              const SizedBox(height: 24),

              // Bid Content Section
              Text(
                'بيانات عرضك',
                style: AppTypography.labelLarge.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              ModernCard(
                padding: const EdgeInsets.all(20),
                borderRadius: 24,
                elevation: 0,
                borderColor: AppColors.borderColor,
                backgroundColor: Colors.white,
                child: Column(
                  children: [
                    _buildBidInfoRow(
                      context,
                      LucideIcons.banknote,
                      'القيمة المادية',
                      '${widget.bid.price.toStringAsFixed(0)} ج.م',
                      AppColors.success,
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 16),
                      child: Divider(height: 1),
                    ),
                    _buildBidInfoRow(
                      context,
                      LucideIcons.clock,
                      'مدة التوصيل',
                      widget.bid.duration,
                      AppColors.primary,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Edit Section if Pending
              if (_canEdit) ...[
                Text(
                  'تعديل العرض',
                  style: AppTypography.labelLarge.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                ModernTextField(
                  label: 'السعر المعدل (ج.م)',
                  controller: _priceController,
                  prefixIcon: LucideIcons.banknote,
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 16),
                ModernTextField(
                  label: 'المدة المعدلة',
                  controller: _durationController,
                  prefixIcon: LucideIcons.clock,
                ),
                const SizedBox(height: 16),
                ModernTextField(
                  label: 'ملاحظات إضافية',
                  controller: _descriptionController,
                  prefixIcon: LucideIcons.fileText,
                  maxLines: 4,
                ),
                const SizedBox(height: 32),
                BlocBuilder<VendorBloc, VendorState>(
                  builder: (context, state) {
                    return ModernButton(
                      text: 'حفظ التعديلات',
                      isLoading: state.isLoading,
                      onPressed: _save,
                    );
                  },
                ),
              ] else ...[
                // Non-editable Notes
                Text(
                  'ملاحظاتك للعميل',
                  style: AppTypography.labelLarge.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceVariant.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.borderColor),
                  ),
                  child: Text(
                    widget.bid.notes.isEmpty ? 'لا توجد ملاحظات إضافية' : widget.bid.notes,
                    style: AppTypography.bodyMedium.copyWith(
                      color: AppColors.textSecondary,
                      height: 1.6,
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                if (widget.bid.status != BidStatus.ACCEPTED_BY_CLIENT)
                  Text(
                    'لا يمكن تعديل العرض في هذه المرحلة.',
                    style: AppTypography.bodySmall.copyWith(color: AppColors.textDisabled),
                    textAlign: TextAlign.center,
                  ),
              ],
              const SizedBox(height: 24),
              ModernButton(
                text: 'مشاهدة الطلب الأصلي',
                isOutlined: true,
                icon: LucideIcons.eye,
                onPressed: () {
                  // In a real app, we might need to fetch the full Request object first.
                  // For now, we'll try to show what we have.
                  _showSnackBar('جاري جلب تفاصيل الطلب...', isError: false);
                },
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  void _showSnackBar(String message, {required bool isError}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: const TextStyle(fontFamily: 'Cairo')),
        backgroundColor: isError ? AppColors.error : AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  void _save() {
    final price = double.tryParse(_priceController.text.trim());
    final duration = _durationController.text.trim();
    final description = _descriptionController.text.trim();
    if (price == null || price <= 0 || description.length < 3) {
      _showSnackBar('راجع السعر ووصف العرض', isError: true);
      return;
    }
    _isSaving = true;
    context.read<VendorBloc>().add(
      UpdateBidEvent(
        bidId: widget.bid.id,
        price: price,
        duration: duration,
        description: description,
      ),
    );
  }

  Widget _buildStatusHeader(BuildContext context) {
    final statusColor = _statusColor(widget.bid.status);
    return ModernCard(
      padding: const EdgeInsets.all(20),
      borderRadius: 24,
      backgroundColor: statusColor.withOpacity(0.05),
      borderColor: statusColor.withOpacity(0.1),
      elevation: 0,
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(_statusIcon(widget.bid.status), color: statusColor, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _statusText(widget.bid.status),
                  style: AppTypography.labelLarge.copyWith(
                    color: statusColor,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  widget.bid.requestTitle ?? 'طلب #${widget.bid.requestId}',
                  style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBidInfoRow(BuildContext context, IconData icon, String label, String value, Color color) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: color.withOpacity(0.08),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: AppTypography.bodySmall.copyWith(color: AppColors.textDisabled),
              ),
              Text(
                value,
                style: AppTypography.labelLarge.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Color _statusColor(BidStatus status) {
    switch (status) {
      case BidStatus.PENDING:
        return AppColors.info;
      case BidStatus.SELECTED:
        return AppColors.primary;
      case BidStatus.ACCEPTED_BY_CLIENT:
        return AppColors.success;
      case BidStatus.REJECTED:
        return AppColors.error;
      case BidStatus.WITHDRAWN:
        return AppColors.textDisabled;
    }
  }

  String _statusText(BidStatus status) {
    switch (status) {
      case BidStatus.PENDING:
        return 'قيد المراجعة';
      case BidStatus.SELECTED:
        return 'تم اختيار عرضك';
      case BidStatus.ACCEPTED_BY_CLIENT:
        return 'تم قبول العرض';
      case BidStatus.REJECTED:
        return 'تم الرفض';
      case BidStatus.WITHDRAWN:
        return 'تم السحب';
    }
  }

  IconData _statusIcon(BidStatus status) {
    switch (status) {
      case BidStatus.PENDING:
        return LucideIcons.clock;
      case BidStatus.SELECTED:
        return LucideIcons.star;
      case BidStatus.ACCEPTED_BY_CLIENT:
        return Icons.check_circle_rounded;
      case BidStatus.REJECTED:
        return Icons.cancel_rounded;
      case BidStatus.WITHDRAWN:
        return LucideIcons.undo;
    }
  }
}
