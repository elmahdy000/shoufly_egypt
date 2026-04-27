import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../theme/app_colors.dart';

class ShimmerPlaceholder extends StatelessWidget {
  final double width;
  final double height;
  final double borderRadius;
  final EdgeInsetsGeometry? margin;

  const ShimmerPlaceholder({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius = 12,
    this.margin,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.surfaceVariant.withOpacity(0.5),
      highlightColor: AppColors.surfaceVariant,
      child: Container(
        width: width,
        height: height,
        margin: margin,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }

  static Widget card({
    double height = 100,
    double borderRadius = 16,
    EdgeInsetsGeometry? margin,
  }) {
    return ShimmerPlaceholder(
      width: double.infinity,
      height: height,
      borderRadius: borderRadius,
      margin: margin,
    );
  }

  static Widget list({
    int count = 3,
    double height = 100,
    double spacing = 16,
    EdgeInsetsGeometry? padding,
  }) {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: padding,
      itemCount: count,
      separatorBuilder: (_, __) => SizedBox(height: spacing),
      itemBuilder: (_, __) => card(height: height),
    );
  }
}
