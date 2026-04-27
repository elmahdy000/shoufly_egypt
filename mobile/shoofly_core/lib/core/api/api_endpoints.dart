/// Centralized API endpoints for the Shoofly app
/// All endpoint paths should be defined here to avoid hardcoding in services
class ApiEndpoints {
  ApiEndpoints._();

  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String refreshToken = '/auth/refresh';
  static const String me = '/auth/me';

  // Categories
  static const String categories = '/categories';

  // Requests (Client)
  static const String requests = '/requests';
  static String requestById(Object id) => '/requests/$id';
  static const String myRequests = '/requests';

  // Vendor Specific
  static const String vendorOpenRequests = '/vendor/open-requests';
  static const String vendorMyBids = '/vendor/bids';
  static const String vendorTransactions = '/vendor/transactions';
  static const String vendorProfile = '/vendor/profile';
  static const String vendorWithdrawals = '/vendor/withdrawals';
  static String vendorBidStatus(Object bidId) => '/vendor/bids/$bidId/status';
  static String vendorBidById(Object bidId) => '/vendor/bids/$bidId';

  // Bids & Offers
  static const String bids = '/bids';
  static String bidById(Object id) => '/bids/$id';
  static String requestBids(Object requestId) => '/requests/$requestId/bids';
  static String acceptOffer(Object bidId) => '/client/offers/bid/$bidId/accept';

  // Payments
  static String payRequest(Object requestId) =>
      '/client/payments/request/$requestId';

  // QR & Delivery
  static String confirmReceipt(Object requestId) =>
      '/client/qr/confirm/$requestId';

  // Notifications
  static const String notifications = '/notifications';
  static const String notificationStream = '/notifications/stream';
  static String markNotificationRead(Object id) => '/notifications/$id/read';

  // Wallet & Transactions
  static const String wallet = '/client/wallet';
  static const String walletDeposit = '/client/wallet/deposit';
  static String walletVerify(Object txnId) => '/client/wallet/verify/$txnId';
  static const String transactions = '/client/transactions';

  // Reviews
  static const String reviews = '/client/reviews';

  // User Profile
  static const String userProfile = '/user/profile';
  static const String passwordReset = '/auth/password-reset';
}
