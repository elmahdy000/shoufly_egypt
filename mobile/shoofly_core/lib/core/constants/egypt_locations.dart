class Governorate {
  final String id;
  final String nameAr;
  final String nameEn;
  final List<String> cities;

  const Governorate({
    required this.id,
    required this.nameAr,
    required this.nameEn,
    required this.cities,
  });
}

class EgyptLocations {
  static const List<Governorate> governorates = [
    Governorate(
      id: 'cairo',
      nameAr: 'القاهرة',
      nameEn: 'Cairo',
      cities: ['القاهرة الجديدة', 'مدينة نصر', 'المعادي', 'وسط البلد', 'مصر الجديدة', 'حلوان', 'المرج', 'شبرا', 'البساتين', 'روض الفرج', 'الزيتون', 'عين شمس'],
    ),
    Governorate(
      id: 'giza',
      nameAr: 'الجيزة',
      nameEn: 'Giza',
      cities: ['المهندسين', 'الدقي', 'الهرم', 'فيصل', 'أكتوبر', 'الشيخ زايد', 'العمرانية', 'الوراق', 'إمبابة', 'الحوامدية', 'البدرشين', 'العياط'],
    ),
    Governorate(
      id: 'alexandria',
      nameAr: 'الإسكندرية',
      nameEn: 'Alexandria',
      cities: ['سموحة', 'المنتزة', 'العجمي', 'وسط الإسكندرية', 'الرمل', 'سيدي جابر', 'العامرية', 'برج العرب', 'كرموز', 'اللبان'],
    ),
    Governorate(
      id: 'sharqia',
      nameAr: 'الشرقية',
      nameEn: 'Sharqia',
      cities: ['الزقازيق', 'العاشر من رمضان', 'بلبيس', 'منيا القمح', 'أبو حماد', 'فاقوس', 'الحسينية', 'كفر صقر', 'أولاد صقر', 'مشتول السوق', 'ديرب نجم', 'الإبراهيمية'],
    ),
    Governorate(
      id: 'dakahlia',
      nameAr: 'الدقهلية',
      nameEn: 'Dakahlia',
      cities: ['المنصورة', 'طلخا', 'ميت غمر', 'السنبلاوين', 'دكرنس', 'بلقاس', 'شربين', 'المنزلة', 'منية النصر', 'جمصة'],
    ),
    Governorate(
      id: 'beheira',
      nameAr: 'البحيرة',
      nameEn: 'Beheira',
      cities: ['دمنهور', 'كفر الدوار', 'رشيد', 'إيتاي البارود', 'أبو حمص', 'كوم حمادة', 'شبراخيت', 'الدلنجات', 'حوش عيسى', 'وادي النطرون'],
    ),
    Governorate(
      id: 'qalyubia',
      nameAr: 'القليوبية',
      nameEn: 'Qalyubia',
      cities: ['بنها', 'شبرا الخيمة', 'العبور', 'قليوب', 'الخانكة', 'طوخ', 'قها', 'شين القناطر', 'كفر شكر'],
    ),
    Governorate(
      id: 'gharbia',
      nameAr: 'الغربية',
      nameEn: 'Gharbia',
      cities: ['طنطا', 'المحلة الكبرى', 'كفر الزيات', 'زفتى', 'السنطة', 'قطور', 'بسيون', 'سمنود'],
    ),
    Governorate(
      id: 'monufia',
      nameAr: 'المنوفية',
      nameEn: 'Monufia',
      cities: ['شبين الكوم', 'قويسنا', 'بركة السبع', 'منوف', 'مدينة السادات', 'أشمون', 'الباجور', 'تلا', 'الشهداء'],
    ),
    Governorate(
      id: 'fayoum',
      nameAr: 'الفيوم',
      nameEn: 'Fayoum',
      cities: ['الفيوم', 'إطسا', 'طامية', 'سنورس', 'أبشواي', 'يوسف الصديق'],
    ),
    Governorate(
      id: 'kafr_el_sheikh',
      nameAr: 'كفر الشيخ',
      nameEn: 'Kafr El Sheikh',
      cities: ['كفر الشيخ', 'دسوق', 'فوه', 'بيلا', 'الحامول', 'بلطيم', 'مطوبس', 'سيدي سالم', 'قلين'],
    ),
    Governorate(
      id: 'ismailia',
      nameAr: 'الإسماعيلية',
      nameEn: 'Ismailia',
      cities: ['الإسماعيلية', 'التل الكبير', 'فايد', 'القنطرة شرق', 'القنطرة غرب', 'أبو صوير', 'القصاصين'],
    ),
    Governorate(
      id: 'suez',
      nameAr: 'السويس',
      nameEn: 'Suez',
      cities: ['السويس', 'الأربعين', 'الجناين', 'عتاقة', 'فيصل (السويس)'],
    ),
    Governorate(
      id: 'port_said',
      nameAr: 'بورسعيد',
      nameEn: 'Port Said',
      cities: ['بورسعيد', 'بورفؤاد', 'حي العرب', 'حي الشرق', 'حي الضواحي'],
    ),
    Governorate(
      id: 'damietta',
      nameAr: 'دمياط',
      nameEn: 'Damietta',
      cities: ['دمياط', 'دمياط الجديدة', 'رأس البر', 'فارسكور', 'الزرقا', 'كفر سعد', 'السرو'],
    ),
    Governorate(
      id: 'assiut',
      nameAr: 'أسيوط',
      nameEn: 'Assiut',
      cities: ['أسيوط', 'ديروط', 'منفلوط', 'القوصية', 'أبوتيج', 'صدفا', 'الغنايم', 'ساحل سليم', 'البداري'],
    ),
    Governorate(
      id: 'sohag',
      nameAr: 'سوهاج',
      nameEn: 'Sohag',
      cities: ['سوهاج', 'أخميم', 'طما', 'طهطا', 'جرجا', 'البلينا', 'المنشاة', 'ساقلتة', 'دار السلام'],
    ),
    Governorate(
      id: 'qena',
      nameAr: 'قنا',
      nameEn: 'Qena',
      cities: ['قنا', 'نجع حمادي', 'دشنا', 'قوص', 'أبو تشت', 'فرشوط', 'قفط', 'نقادة'],
    ),
    Governorate(
      id: 'minya',
      nameAr: 'المنيا',
      nameEn: 'Minya',
      cities: ['المنيا', 'ملوي', 'بني مزار', 'مغاغة', 'سمالوط', 'أبو قرقاص', 'مطاي', 'العدوة', 'دير مواس'],
    ),
    Governorate(
      id: 'beni_suef',
      nameAr: 'بني سويف',
      nameEn: 'Beni Suef',
      cities: ['بني سويف', 'الواسطى', 'ناصر', 'ببا', 'الفشن', 'سمسطا', 'إهناسيا'],
    ),
    Governorate(
      id: 'luxor',
      nameAr: 'الأقصر',
      nameEn: 'Luxor',
      cities: ['الأقصر', 'إسنا', 'أرمنت', 'البياضية', 'القرنة', 'الطود'],
    ),
    Governorate(
      id: 'aswan',
      nameAr: 'أسوان',
      nameEn: 'Aswan',
      cities: ['أسوان', 'كوم أمبو', 'إدفو', 'نصر النوبة', 'درو', 'أبو سمبل'],
    ),
    Governorate(
      id: 'red_sea',
      nameAr: 'البحر الأحمر',
      nameEn: 'Red Sea',
      cities: ['الغردقة', 'سفاجا', 'القصير', 'مرسى علم', 'رأس غارب', 'شلاتين', 'حلايب'],
    ),
    Governorate(
      id: 'matrouh',
      nameAr: 'مطروح',
      nameEn: 'Matrouh',
      cities: ['مرسى مطروح', 'العلمين', 'الضبعة', 'الحمام', 'سيوة', 'براني', 'السلوم'],
    ),
    Governorate(
      id: 'new_valley',
      nameAr: 'الوادي الجديد',
      nameEn: 'New Valley',
      cities: ['الخارجة', 'الداخلة', 'الفرافرة', 'باريس', 'بلاط'],
    ),
    Governorate(
      id: 'north_sinai',
      nameAr: 'شمال سيناء',
      nameEn: 'North Sinai',
      cities: ['العريش', 'بئر العبد', 'الشيخ زويد', 'رفح', 'الحسنة'],
    ),
    Governorate(
      id: 'south_sinai',
      nameAr: 'جنوب سيناء',
      nameEn: 'South Sinai',
      cities: ['شرم الشيخ', 'طور سيناء', 'دهب', 'نويبع', 'طابا', 'سانت كاترين', 'أبو رديس', 'أبو زنيمة'],
    ),
  ];
}
