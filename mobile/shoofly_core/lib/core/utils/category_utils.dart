import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../domain/entities/category.dart';

extension CategoryUI on Category {
  IconData get iconData {
    final text = [
      icon,
      slug,
      name,
      brandType,
    ].whereType<String>().join(' ').toLowerCase();

    if (text.contains('phone') || text.contains('mobile') || text.contains('موبايل') || text.contains('هاتف')) {
      return LucideIcons.smartphone;
    }
    if (text.contains('electronic') || text.contains('laptop') || text.contains('computer') || text.contains('كمبيوتر') || text.contains('لابتوب')) {
      return LucideIcons.monitor;
    }
    if (text.contains('home-appliances') || text.contains('appliance') || text.contains('ثلا') || text.contains('غسال') || text.contains('بوتاجاز') || text.contains('تكييف')) {
      return LucideIcons.refrigerator;
    }
    if (text.contains('home-services') || text.contains('home') || text.contains('منزل')) {
      return LucideIcons.house;
    }
    if (text.contains('plumbing') || text.contains('سباك')) {
      return LucideIcons.droplets;
    }
    if (text.contains('electrical') || text.contains('كهربا')) {
      return LucideIcons.zap;
    }
    if (text.contains('car') || text.contains('auto') || text.contains('سيار') || text.contains('ميكانيكا')) {
      return LucideIcons.car;
    }
    if (text.contains('education') || text.contains('training') || text.contains('تعليم') || text.contains('تدريب') || text.contains('مدرس')) {
      return LucideIcons.graduationCap;
    }
    if (text.contains('health') || text.contains('medical') || text.contains('doctor') || text.contains('صحة') || text.contains('طب') || text.contains('تمريض')) {
      return LucideIcons.stethoscope;
    }
    if (text.contains('beauty') || text.contains('salon') || text.contains('barber') || text.contains('تجميل') || text.contains('حلاق')) {
      return LucideIcons.sparkles;
    }
    if (text.contains('food') || text.contains('restaurant') || text.contains('أكل') || text.contains('مطعم') || text.contains('شيف')) {
      return LucideIcons.utensils;
    }
    if (text.contains('transport') || text.contains('delivery') || text.contains('نقل') || text.contains('شحن')) {
      return LucideIcons.truck;
    }
    if (text.contains('event') || text.contains('party') || text.contains('مناسب') || text.contains('فرح')) {
      return LucideIcons.partyPopper;
    }
    if (text.contains('pet') || text.contains('dog') || text.contains('cat') || text.contains('حيوان')) {
      return LucideIcons.dog;
    }
    if (text.contains('business') || text.contains('legal') || text.contains('lawyer') || text.contains('accountant') || text.contains('محامي') || text.contains('محاسب')) {
      return LucideIcons.briefcase;
    }
    if (text.contains('security') || text.contains('camera') || text.contains('أمن') || text.contains('كاميرا')) {
      return LucideIcons.shieldCheck;
    }
    if (text.contains('cleaning') || text.contains('تنظيف')) {
      return LucideIcons.brush;
    }
    if (text.contains('painting') || text.contains('decor') || text.contains('دهان') || text.contains('نقاش')) {
      return LucideIcons.palette;
    }
    if (text.contains('furniture') || text.contains('sofa') || text.contains('أثاث') || text.contains('نجار')) {
      return LucideIcons.armchair;
    }
    if (text.contains('printing') || text.contains('طباعة') || text.contains('تصوير')) {
      return LucideIcons.printer;
    }
    if (text.contains('craft') || text.contains('handmade') || text.contains('خياط')) {
      return LucideIcons.scissors;
    }

    // Direct mapping for specific icon names if provided by backend
    switch (icon?.toLowerCase()) {
      case 'smartphone':
        return LucideIcons.smartphone;
      case 'tv':
        return LucideIcons.tv;
      case 'sofa':
        return LucideIcons.sofa;
      case 'car':
        return LucideIcons.car;
      case 'wrench':
        return LucideIcons.wrench;
      default:
        return LucideIcons.package;
    }
  }

  String get hintText {
    if (requiresBrand) {
      return 'حدد الماركة والتفاصيل للحصول على عرض أدق';
    }
    if ((subcategories ?? const <Category>[]).isNotEmpty) {
      return 'اختر القسم المناسب لطلبك';
    }
    return 'ابدأ طلبك وسنوصله للموردين المناسبين';
  }
}
