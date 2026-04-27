import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:shoofly_core/core/animations/app_animations.dart';
import 'package:shoofly_core/core/theme/app_colors.dart';
import 'package:shoofly_core/core/theme/app_typography.dart';
import 'package:shoofly_core/core/widgets/modern_widgets.dart';
import 'package:shoofly_core/domain/entities/bid.dart';
import 'package:shoofly_core/presentation/blocs/vendor/vendor_bloc.dart';
import 'bid_details_page.dart';
import 'package:shoofly_core/core/widgets/shimmer_placeholder.dart';
import 'package:shoofly_core/presentation/widgets/empty_state.dart';

class MyBidsPage extends StatefulWidget {
  const MyBidsPage({super.key});

  @override
  State<MyBidsPage> createState() => _MyBidsPageState();
}

class _MyBidsPageState extends State<MyBidsPage> {
  String _selectedFilter = 'ALL';
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _sortBy = 'NEWEST'; // NEWEST, PRICE_DESC, PRICE_ASC

  @override
  void initState() {
    super.initState();
    context.read<VendorBloc>().add(LoadMyBids());
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: ModernAppBar(
        title: 'عروضي المقدمة',
        backgroundColor: Theme.of(context).appBarTheme.backgroundColor,
        elevation: 0,
        actions: [
          IconButton(
            onPressed: _showSortOptions,
            icon: const Icon(LucideIcons.arrowUpDown, size: 20),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: BlocConsumer<VendorBloc, VendorState>(
        listener: (context, state) {
          if (state.error != null && state.myBids.isNotEmpty) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.error!),
                backgroundColor: AppColors.error,
              ),
            );
          }
        },
        builder: (context, state) {
          if (state.isLoading && state.myBids.isEmpty) {
            return ShimmerPlaceholder.list(
              count: 4,
              height: 160,
              padding: const EdgeInsets.all(20),
            );
          }

          if (state.myBids.isNotEmpty) {
            // 1. Status Filter
            var filteredBids = _selectedFilter == 'ALL'
                ? state.myBids
                : state.myBids.where((b) {
                    if (_selectedFilter == 'ACCEPTED') {
                      return b.status == BidStatus.ACCEPTED_BY_CLIENT;
                    }
                    if (_selectedFilter == 'PENDING') {
                      return b.status == BidStatus.PENDING || b.status == BidStatus.SELECTED;
                    }
                    return true;
                  }).toList();

            // 2. Search Filter
            if (_searchQuery.isNotEmpty) {
              filteredBids = filteredBids.where((b) {
                final query = _searchQuery.toLowerCase();
                return (b.requestTitle?.toLowerCase().contains(query) ?? false) ||
                    (b.notes.toLowerCase().contains(query));
              }).toList();
            }

            // 3. Sorting
            if (_sortBy == 'NEWEST') {
              filteredBids.sort((a, b) => b.createdAt.compareTo(a.createdAt));
            } else if (_sortBy == 'PRICE_DESC') {
              filteredBids.sort((a, b) => b.price.compareTo(a.price));
            } else if (_sortBy == 'PRICE_ASC') {
              filteredBids.sort((a, b) => a.price.compareTo(b.price));
            }

            return Column(
              children: [
                _buildSearchHeader(),
                _buildFilterBar(),
                Expanded(
                  child: RefreshIndicator(
                    onRefresh: () async =>
                        context.read<VendorBloc>().add(LoadMyBids()),
                    child: filteredBids.isEmpty
                      ? _buildEmptyFilteredState()
                      : ListView.separated(
                          padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
                          itemCount: filteredBids.length,
                          physics: const AlwaysScrollableScrollPhysics(),
                          separatorBuilder: (context, index) =>
                              const SizedBox(height: 16),
                          itemBuilder: (context, index) => _buildBidCard(
                            context,
                            filteredBids[index],
                            state.isLoading,
                          ),
                        ),
                  ),
                ),
              ],
            );
          }

          if (state.error != null && state.myBids.isEmpty) {
            return EmptyState.error(
              subtitle: state.error,
              onActionPressed: () => context.read<VendorBloc>().add(LoadMyBids()),
            );
          }

          return EmptyState(
            icon: LucideIcons.handCoins,
            title: 'لم تقم بتقديم أي عروض بعد',
            subtitle: 'تصفح الطلبات المتاحة وابدأ في تقديم عروضك الآن',
            onActionPressed: () => context.read<VendorBloc>().add(LoadMyBids()),
            actionLabel: 'تحديث البيانات',
          );
        },
      ),
    );
  }

  Widget _buildFilterBar() {
    return Container(
      height: 60,
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        children: [
          _buildFilterChip('الكل', 'ALL'),
          const SizedBox(width: 8),
          _buildFilterChip('المقبولة', 'ACCEPTED'),
          const SizedBox(width: 8),
          _buildFilterChip('قيد المراجعة', 'PENDING'),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _selectedFilter == value;
    return GestureDetector(
      onTap: () => setState(() => _selectedFilter = value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.borderColor,
          ),
          boxShadow: null,
        ),
        child: Text(
          label,
          style: AppTypography.labelSmall.copyWith(
            color: isSelected ? Colors.white : AppColors.textSecondary,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyFilteredState() {
    return EmptyState.noSearchResults(
      title: 'لا توجد عروض تطابق هذا الاختيار',
      subtitle: 'جرب تغيير الفلتر لعرض المزيد من العروض',
    );
  }

  Widget _buildBidCard(BuildContext context, Bid bid, bool isUpdating) {
    final isAccepted = bid.status == BidStatus.ACCEPTED_BY_CLIENT;
    final nextDeliveryStatus = _nextDeliveryStatus(bid.deliveryStatus);
    final canUpdateDelivery = isAccepted && nextDeliveryStatus != null;

    return ModernCard(
      padding: const EdgeInsets.all(20),
      borderRadius: 20,
      elevation: 0,
      borderColor: Theme.of(context).dividerColor,
      backgroundColor: Theme.of(context).cardTheme.color,
      onTap: () => _openBidDetails(context, bid),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  bid.requestTitle ?? 'طلب #${bid.requestId}',
                  style: AppTypography.labelLarge.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 12),
              _buildStatusBadge(bid.status),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.success.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  LucideIcons.banknote,
                  size: 16,
                  color: AppColors.success,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'عرضك: ${bid.price.toStringAsFixed(0)} ج.م',
                  style: AppTypography.labelMedium.copyWith(
                    color: AppColors.success,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              if (bid.duration.isNotEmpty) ...[
                const Icon(
                  LucideIcons.clock,
                  size: 14,
                  color: AppColors.textDisabled,
                ),
                const SizedBox(width: 4),
                Text(
                  bid.duration,
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ],
          ),
          if (bid.notes.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              bid.notes,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ],
          const SizedBox(height: 20),
          Divider(height: 1, color: Theme.of(context).dividerColor),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Text(
                  'تاريخ التقديم: ${DateFormat('d MMMM', 'ar').format(bid.createdAt)}',
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textDisabled,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              ModernButton(
                text: canUpdateDelivery
                    ? _deliveryActionText(nextDeliveryStatus)
                    : 'التفاصيل',
                icon: canUpdateDelivery ? LucideIcons.truck : LucideIcons.eye,
                fullWidth: false,
                height: 34,
                isOutlined: !canUpdateDelivery,
                backgroundColor: canUpdateDelivery ? AppColors.success : null,
                padding: const EdgeInsets.symmetric(horizontal: 14),
                onPressed: isUpdating
                    ? null
                    : () => canUpdateDelivery
                          ? _showStatusActions(context, bid)
                          : _openBidDetails(context, bid),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showStatusActions(BuildContext context, Bid bid) {
    final nextDeliveryStatus = _nextDeliveryStatus(bid.deliveryStatus);

    showModalBottomSheet(
      context: context,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'تحديث حالة الطلب',
                  style: AppTypography.h4.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 8),
                Text(
                  bid.requestTitle ?? 'طلب #${bid.requestId}',
                  style: AppTypography.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 20),
                if (nextDeliveryStatus == null)
                  ModernCard(
                    elevation: 0,
                    borderColor: AppColors.borderColor,
                    child: Row(
                      children: [
                        const Icon(
                          LucideIcons.circleCheck,
                          color: AppColors.success,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'الطلب جاهز للاستلام بالفعل',
                            style: AppTypography.labelMedium.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  ModernButton(
                    text: _deliveryActionText(nextDeliveryStatus),
                    icon: nextDeliveryStatus == 'VENDOR_PREPARING'
                        ? LucideIcons.packageOpen
                        : LucideIcons.packageCheck,
                    onPressed: () {
                      Navigator.pop(context);
                      context.read<VendorBloc>().add(
                        UpdateBidStatusEvent(
                          bidId: bid.id,
                          status: nextDeliveryStatus,
                        ),
                      );
                    },
                  ),
                if (bid.deliveryStatus != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    'الحالة الحالية: ${_deliveryStatusText(bid.deliveryStatus)}',
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textDisabled,
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  void _openBidDetails(BuildContext context, Bid bid) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => BidDetailsPage(bid: bid)),
    );
  }

  String? _nextDeliveryStatus(String? currentStatus) {
    switch (currentStatus) {
      case null:
      case '':
      case 'ORDER_PLACED':
        return 'VENDOR_PREPARING';
      case 'VENDOR_PREPARING':
        return 'READY_FOR_PICKUP';
      default:
        return null;
    }
  }

  String _deliveryActionText(String status) {
    switch (status) {
      case 'VENDOR_PREPARING':
        return 'بدء التحضير';
      case 'READY_FOR_PICKUP':
        return 'جاهز للاستلام';
      default:
        return 'تحديث الحالة';
    }
  }

  String _deliveryStatusText(String? status) {
    switch (status) {
      case 'ORDER_PLACED':
        return 'تم إنشاء الطلب';
      case 'VENDOR_PREPARING':
        return 'جاري التحضير';
      case 'READY_FOR_PICKUP':
        return 'جاهز للاستلام';
      case 'OUT_FOR_DELIVERY':
      case 'IN_TRANSIT':
        return 'مع المندوب';
      case 'DELIVERED':
        return 'تم التسليم';
      case 'FAILED_DELIVERY':
        return 'فشل التسليم';
      case 'RETURNED':
        return 'مرتجع';
      default:
        return 'غير محددة';
    }
  }

  Widget _buildStatusBadge(BidStatus status) {
    String text = 'قيد المراجعة';
    Color color = AppColors.warning;

    switch (status) {
      case BidStatus.PENDING:
        text = 'قيد المراجعة';
        color = AppColors.warning;
        break;
      case BidStatus.SELECTED:
        text = 'مرشح';
        color = AppColors.info;
        break;
      case BidStatus.ACCEPTED_BY_CLIENT:
        text = 'تم القبول';
        color = AppColors.success;
        break;
      case BidStatus.REJECTED:
        text = 'مرفوض';
        color = AppColors.error;
        break;
      case BidStatus.WITHDRAWN:
        text = 'مسحوب';
        color = AppColors.textDisabled;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text,
        style: AppTypography.labelSmall.copyWith(
          color: color,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildSearchHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
      color: Theme.of(context).appBarTheme.backgroundColor,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          color: AppColors.surfaceVariant.withOpacity(0.3),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.borderColor),
        ),
        child: TextField(
          controller: _searchController,
          onChanged: (val) => setState(() => _searchQuery = val),
          decoration: InputDecoration(
            hintText: 'ابحث في عروضك...',
            hintStyle: AppTypography.bodySmall.copyWith(color: AppColors.textDisabled),
            icon: const Icon(LucideIcons.search, size: 20, color: AppColors.textDisabled),
            border: InputBorder.none,
          ),
        ),
      ),
    );
  }

  void _showSortOptions() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'ترتيب العروض',
              style: AppTypography.h4.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 20),
            _buildSortOption('الأحدث أولاً', 'NEWEST', Icons.access_time_rounded),
            _buildSortOption('السعر: من الأعلى للأقل', 'PRICE_DESC', Icons.arrow_downward_rounded),
            _buildSortOption('السعر: من الأقل للأعلى', 'PRICE_ASC', Icons.arrow_upward_rounded),
          ],
        ),
      ),
    );
  }

  Widget _buildSortOption(String label, String value, IconData icon) {
    final isSelected = _sortBy == value;
    return ListTile(
      onTap: () {
        setState(() => _sortBy = value);
        Navigator.pop(context);
      },
      leading: Icon(icon, color: isSelected ? AppColors.primary : AppColors.textDisabled),
      title: Text(
        label,
        style: AppTypography.labelLarge.copyWith(
          color: isSelected ? AppColors.primary : AppColors.textPrimary,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
      ),
      trailing: isSelected ? const Icon(Icons.check_circle, color: AppColors.primary) : null,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    );
  }
}
