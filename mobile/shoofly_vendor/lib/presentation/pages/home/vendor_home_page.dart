import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:shoofly_core/core/widgets/shoofly_bottom_nav.dart';
import 'package:shoofly_core/presentation/blocs/vendor/vendor_bloc.dart';
import 'package:shoofly_core/presentation/blocs/notification/notification_bloc.dart';
import 'package:shoofly_core/core/utils/toasts.dart';

import '../requests/my_bids_page.dart';
import '../requests/vendor_requests_page.dart';
import '../wallet/vendor_wallet_page.dart';
import '../profile/vendor_profile_page.dart';
import 'tabs/dashboard_tab.dart';

class VendorHomePage extends StatefulWidget {
  const VendorHomePage({super.key});

  @override
  State<VendorHomePage> createState() => _VendorHomePageState();
}

class _VendorHomePageState extends State<VendorHomePage> {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    context.read<VendorBloc>().add(const LoadOpenRequests());
    context.read<VendorBloc>().add(LoadVendorProfile());
    context.read<NotificationBloc>().add(StartNotificationStream());
  }

  void _setCurrentIndex(int index) {
    if (_currentIndex == index) return;
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: BlocListener<NotificationBloc, NotificationState>(
          listener: (context, state) {
            if (state is NotificationsUpdated && state.latestNotification != null) {
              final n = state.latestNotification!;
              // Filter to show only relevant notifications
              if (n.isBidNotification || n.isStatusChange || n.isMessage || 
                  (n.type == 'general' && n.message != null)) {
                AppToasts.showNotification(
                  context,
                  title: n.title,
                  message: n.message,
                  onTap: () {
                    if (n.isBidNotification || n.isStatusChange) {
                      _setCurrentIndex(2); // Go to My Bids
                    }
                  },
                );
              }
            }
          },
          child: IndexedStack(
            index: _currentIndex,
            children: [
              DashboardTab(onNavigate: _setCurrentIndex),
              const VendorRequestsPage(),
              const MyBidsPage(),
              const VendorWalletPage(),
              const VendorProfilePage(),
            ],
          ),
        ),
      ),
      bottomNavigationBar: ShooflyBottomNav(
        currentIndex: _currentIndex,
        onTap: _setCurrentIndex,
        items: const [
          ShooflyBottomNavItem(icon: LucideIcons.house, label: 'الرئيسية'),
          ShooflyBottomNavItem(icon: LucideIcons.search, label: 'الطلبات'),
          ShooflyBottomNavItem(icon: LucideIcons.handCoins, label: 'عروضي'),
          ShooflyBottomNavItem(icon: LucideIcons.wallet, label: 'المحفظة'),
          ShooflyBottomNavItem(icon: LucideIcons.user, label: 'حسابي'),
        ],
      ),
    );
  }
}
