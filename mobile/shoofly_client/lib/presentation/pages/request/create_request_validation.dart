import 'widgets/map_picker_page.dart';

class CreateRequestValidation {
  const CreateRequestValidation._();

  static String? validateDetails({
    required String title,
    required String description,
    required bool hasCategory,
  }) {
    if (title.trim().length < 3) {
      return 'يرجى كتابة عنوان واضح للطلب';
    }
    if (!hasCategory) {
      return 'يرجى اختيار القسم المناسب';
    }
    if (description.trim().length < 10) {
      return 'يرجى كتابة وصف للطلب لا يقل عن 10 حروف';
    }
    return null;
  }

  static String? validateLocation({
    required LocationResult? location,
    required String deliveryPhone,
  }) {
    if (location == null) {
      return 'يرجى تحديد موقع التوصيل على الخريطة';
    }
    if (location.governorate == null || location.city == null) {
      return 'يرجى اختيار المحافظة والمدينة من شاشة الخريطة';
    }
    if ((location.address).trim().length < 5) {
      return 'يرجى تحديد عنوان توصيل واضح';
    }
    if (!RegExp(r'^\+?[0-9\s\-()]{8,}$').hasMatch(deliveryPhone.trim())) {
      return 'يرجى إدخال رقم تليفون صحيح للتواصل';
    }
    return null;
  }
}
