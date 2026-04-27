import 'package:flutter/material.dart';

class AppSpacing {
  static const double xs = 4.0;
  static const double s = 8.0;
  static const double m = 16.0;
  static const double l = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;

  static const SizedBox heightXs = SizedBox(height: xs);
  static const SizedBox heightS = SizedBox(height: s);
  static const SizedBox heightM = SizedBox(height: m);
  static const SizedBox heightL = SizedBox(height: l);
  static const SizedBox heightXl = SizedBox(height: xl);

  static const SizedBox widthXs = SizedBox(width: xs);
  static const SizedBox widthS = SizedBox(width: s);
  static const SizedBox widthM = SizedBox(width: m);
  static const SizedBox widthL = SizedBox(width: l);
}

class AppRadius {
  static const double s = 8.0;
  static const double m = 12.0;
  static const double l = 16.0;
  static const double xl = 20.0;
  static const double xxl = 24.0;

  static final BorderRadius borderRadiusS = BorderRadius.circular(s);
  static final BorderRadius borderRadiusM = BorderRadius.circular(m);
  static final BorderRadius borderRadiusL = BorderRadius.circular(l);
  static final BorderRadius borderRadiusXl = BorderRadius.circular(xl);
  static final BorderRadius borderRadiusXxl = BorderRadius.circular(xxl);
}
