import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shoofly_client/presentation/pages/auth/landing_page.dart';

void main() {
  testWidgets('Landing page shows client entry points', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: LandingPage()));

    expect(find.text('شوفلي مصر'), findsOneWidget);
    expect(find.text('أول منصة ذكية تربطك بأفضل الموردين في مصر.\nاطلب، قارن، ووفر في ثواني.'), findsOneWidget);
    expect(find.text('ابدأ رحلتك الآن'), findsOneWidget);
    expect(find.text('تسجيل الدخول'), findsOneWidget);
    expect(find.byType(ElevatedButton), findsOneWidget);
  });
}
