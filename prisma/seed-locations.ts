import { prisma } from '../lib/prisma';

const egyptLocations = [
  {
    governorate: 'القاهرة',
    cities: ['القاهرة', 'حلوان', 'عين شمس', 'مدينة نصر', 'مصر الجديدة', 'المعادي', 'وسط البلد', 'شبرا']
  },
  {
    governorate: 'الإسكندرية',
    cities: ['الإسكندرية', 'برج العرب', 'العامرية', 'العجمي', 'المنتزة', 'مينا البصل']
  },
  {
    governorate: 'الجيزة',
    cities: ['الجيزة', '6 أكتوبر', 'الشيخ زايد', 'الحوامدية', 'البدرشين', 'الصف', 'أطفيح']
  },
  {
    governorate: 'القليوبية',
    cities: ['بنها', 'شبرا الخيمة', 'قليوب', 'الخانكة', 'قنطرة', 'العبور']
  },
  {
    governorate: 'الدقهلية',
    cities: ['المنصورة', 'طلخا', 'ميت غمر', 'السنبلاوين', 'دكرنس', 'بلقاس']
  },
  {
    governorate: 'الشرقية',
    cities: ['الزقازيق', 'بلبيس', 'منيا القمح', 'أبو حماد', 'العاشر من رمضان', 'فاقوس']
  },
  {
    governorate: 'المنوفية',
    cities: ['شبين الكوم', 'أشمون', 'منوف', 'قويسنا', 'الباجور', 'السادات']
  },
  {
    governorate: 'الغربية',
    cities: ['طنطا', 'المحلة الكبرى', 'كفر الزيات', 'زفتى', 'السنطة']
  },
  {
    governorate: 'البحيرة',
    cities: ['دمنهور', 'كفر الدوار', 'رشيد', 'إدكو', 'أبو المطامير', 'كوم حمادة']
  },
  {
    governorate: 'دمياط',
    cities: ['دمياط', 'دمياط الجديدة', 'رأس البر', 'فارسكور', 'الزرقا']
  },
  {
    governorate: 'بورسعيد',
    cities: ['بورسعيد', 'بورفؤاد']
  },
  {
    governorate: 'السويس',
    cities: ['السويس']
  },
  {
    governorate: 'الإسماعيلية',
    cities: ['الإسماعيلية', 'التل الكبير', 'فايد', 'القنطرة شرق', 'القنطرة غرب']
  },
  {
    governorate: 'كفر الشيخ',
    cities: ['كفر الشيخ', 'دسوق', 'فوه', 'بيلا', 'مطوبس', 'بلطيم']
  },
  {
    governorate: 'الفيوم',
    cities: ['الفيوم', 'سنورس', 'إطسا', 'طامية', 'يوسف الصديق']
  },
  {
    governorate: 'بني سويف',
    cities: ['بني سويف', 'الواسطى', 'ناصر', 'ببا', 'سمسطا']
  },
  {
    governorate: 'المنيا',
    cities: ['المنيا', 'ملوي', 'بني مزار', 'مغاغة', 'سمالوط', 'أبوقرقاص']
  },
  {
    governorate: 'أسيوط',
    cities: ['أسيوط', 'ديروط', 'القوصية', 'منفلوط', 'أبوتيج', 'صدفا']
  },
  {
    governorate: 'سوهاج',
    cities: ['سوهاج', 'أخميم', 'طما', 'طهطا', 'جرجا', 'البلينا']
  },
  {
    governorate: 'قنا',
    cities: ['قنا', 'نجع حمادي', 'دشنا', 'قوص', 'نقادة', 'أبوتشت']
  },
  {
    governorate: 'الأقصر',
    cities: ['الأقصر', 'إسنا', 'أرمنت']
  },
  {
    governorate: 'أسوان',
    cities: ['أسوان', 'كوم أمبو', 'إدفو', 'نصر النوبة']
  },
  {
    governorate: 'البحر الأحمر',
    cities: ['الغردقة', 'سفاجا', 'القصير', 'مرسى علم', 'رأس غارب']
  },
  {
    governorate: 'الوادي الجديد',
    cities: ['الخارجة', 'الداخلة', 'الفرافرة']
  },
  {
    governorate: 'مطروح',
    cities: ['مرسى مطروح', 'العلمين', 'الحمام', 'سيوة']
  },
  {
    governorate: 'شمال سيناء',
    cities: ['العريش', 'بئر العبد', 'الشيخ زويد']
  },
  {
    governorate: 'جنوب سيناء',
    cities: ['شرم الشيخ', 'طور سيناء', 'دهب', 'نويبع', 'طابا']
  }
];

async function seed() {
  console.log('🇪🇬 Seeding Egyptian Governorates and Cities...');

  for (const item of egyptLocations) {
    const gov = await prisma.governorate.upsert({
      where: { name: item.governorate },
      update: {},
      create: { name: item.governorate }
    });

    for (const cityName of item.cities) {
      await prisma.city.create({
        data: {
          name: cityName,
          governorateId: gov.id
        }
      });
    }
  }

  console.log('✅ Seeding completed!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
