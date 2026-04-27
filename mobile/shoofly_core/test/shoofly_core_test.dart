import 'package:flutter_test/flutter_test.dart';
import 'package:shoofly_core/data/models/bid_model.dart';
import 'package:shoofly_core/data/models/request_model.dart';
import 'package:shoofly_core/data/models/user_model.dart';
import 'package:shoofly_core/data/models/wallet_model.dart';
import 'package:shoofly_core/domain/entities/bid.dart';
import 'package:shoofly_core/domain/entities/request.dart';
import 'package:shoofly_core/domain/entities/user.dart';

import 'package:shoofly_core/shoofly_core.dart';

void main() {
  test('adds one to input values', () {
    final calculator = Calculator();
    expect(calculator.addOne(2), 3);
    expect(calculator.addOne(-7), -6);
    expect(calculator.addOne(0), 1);
  });

  test('models parse numeric strings from API responses', () {
    final wallet = WalletModel.fromJson({'balance': '575'});
    expect(wallet.balance, 575.0);

    final bid = BidModel.fromJson({
      'id': 1,
      'requestId': 2,
      'vendorId': 3,
      'vendor': {'fullName': 'Vendor', 'rating': '4.5'},
      'clientPrice': '575',
      'duration': '2 days',
      'description': 'Ready',
      'status': 'PENDING',
      'createdAt': '2026-04-25T00:00:00.000Z',
    });
    expect(bid.price, 575.0);
    expect(bid.vendorRating, 4.5);
    expect(bid.status, BidStatus.PENDING);

    final request = RequestModel.fromJson({
      'id': 10,
      'clientId': 20,
      'title': 'Need product',
      'description': 'Details',
      'categoryId': 30,
      'images': <String>[],
      'status': 'OPEN_FOR_BIDDING',
      'latitude': '30.0444',
      'longitude': '31.2357',
      'createdAt': '2026-04-25T00:00:00.000Z',
    });
    expect(request.latitude, 30.0444);
    expect(request.longitude, 31.2357);
    expect(request.status, RequestStatus.OPEN_FOR_BIDDING);

    final user = UserModel.fromJson({
      'id': 1,
      'fullName': 'Vendor User',
      'email': 'vendor@example.com',
      'role': 'VENDOR',
      'walletBalance': '575',
    });
    expect(user.walletBalance, 575.0);
    expect(user.role, UserRole.VENDOR);
  });
}
