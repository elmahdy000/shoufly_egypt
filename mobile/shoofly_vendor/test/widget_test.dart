import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:shoofly_vendor/main.dart';

void main() {
  testWidgets('ShooflyVendorApp can be constructed', (WidgetTester tester) async {
    const app = ShooflyVendorApp();

    expect(app, isA<StatelessWidget>());
  });
}
