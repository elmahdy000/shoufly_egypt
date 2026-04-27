import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:shoofly_core/core/animations/app_animations.dart';
import 'package:shoofly_core/core/theme/app_colors.dart';
import 'package:shoofly_core/core/theme/app_typography.dart';
import 'package:shoofly_core/core/widgets/modern_widgets.dart';
import 'package:shoofly_core/domain/entities/request.dart';
import '../home/widgets/submit_bid_modal.dart';
import '../orders/vendor_order_details_page.dart';
import 'vendor_requests_map_cubit.dart';

class VendorRequestsMapPage extends StatelessWidget {
  const VendorRequestsMapPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => VendorRequestsMapCubit()..loadRequests(),
      child: const VendorRequestsMapView(),
    );
  }
}

class VendorRequestsMapView extends StatelessWidget {
  const VendorRequestsMapView({super.key});

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        body: Stack(
          children: [
            // 1. Map Layer
            const _MapLayer(),

            // 2. Header Layer
            Positioned(
              top: MediaQuery.of(context).padding.top + 10,
              left: 20,
              right: 20,
              child: _buildHeader(context),
            ),

            // 3. Selection Layer (Preview Card)
            const Positioned(
              bottom: 40,
              left: 20,
              right: 20,
              child: _RequestPreviewOverlay(),
            ),

            // 4. Loading Overlay
            BlocBuilder<VendorRequestsMapCubit, VendorRequestsMapState>(
              buildWhen: (prev, curr) => prev.isLoading != curr.isLoading,
              builder: (context, state) {
                if (state.isLoading) {
                  return Container(
                    color: Colors.black.withOpacity(0.05),
                    child: const Center(
                      child: CircularProgressIndicator(),
                    ),
                  );
                }
                return const SizedBox.shrink();
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Row(
      children: [
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: IconButton(
            icon: const Icon(LucideIcons.arrowRight, size: 22),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Container(
            height: 50,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.search, size: 20, color: AppColors.textDisabled),
                const SizedBox(width: 12),
                Text(
                  'ابحث في الخريطة...',
                  style: AppTypography.bodySmall.copyWith(color: AppColors.textDisabled),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _MapLayer extends StatelessWidget {
  const _MapLayer();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<VendorRequestsMapCubit, VendorRequestsMapState>(
      buildWhen: (prev, curr) => 
          prev.markers != curr.markers || 
          prev.currentLocation != curr.currentLocation,
      builder: (context, state) {
        return GoogleMap(
          initialCameraPosition: CameraPosition(
            target: state.currentLocation,
            zoom: 12,
          ),
          markers: state.markers,
          myLocationEnabled: true,
          myLocationButtonEnabled: false,
          zoomControlsEnabled: false,
          mapToolbarEnabled: false,
          onMapCreated: (controller) {
            context.read<VendorRequestsMapCubit>().onMapCreated(controller);
          },
          onTap: (_) => context.read<VendorRequestsMapCubit>().clearSelectedRequest(),
        );
      },
    );
  }
}

class _RequestPreviewOverlay extends StatelessWidget {
  const _RequestPreviewOverlay();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<VendorRequestsMapCubit, VendorRequestsMapState>(
      builder: (context, state) {
        if (state is VendorRequestsMapLoaded && state.selectedRequest != null) {
          final request = state.selectedRequest!;
          return AppAnimations.slideInFromBottom(
            child: ModernCard(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => VendorOrderDetailsPage(request: request),
                  ),
                );
              },
              padding: const EdgeInsets.all(16),
              borderRadius: 24,
              elevation: 8,
              backgroundColor: Colors.white,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: AppColors.surfaceVariant,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: request.images.isNotEmpty
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: Image.network(request.images.first, fit: BoxFit.cover),
                              )
                            : const Icon(LucideIcons.package, color: AppColors.textDisabled),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              request.title,
                              style: AppTypography.labelLarge.copyWith(fontWeight: FontWeight.bold),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              request.address ?? 'موقع غير محدد',
                              style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: ModernButton(
                          text: 'تقديم عرض',
                          height: 40,
                          onPressed: () {
                            showModalBottomSheet(
                              context: context,
                              isScrollControlled: true,
                              backgroundColor: Colors.transparent,
                              builder: (_) => SubmitBidModal(request: request),
                            );
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Container(
                        decoration: BoxDecoration(
                          color: AppColors.surfaceVariant,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: IconButton(
                          icon: const Icon(LucideIcons.eye, size: 20),
                          onPressed: () {
                             Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => VendorOrderDetailsPage(request: request),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        }
        return const SizedBox.shrink();
      },
    );
  }
}
