import '../errors/failures.dart';

class ErrorMessages {
  static String mapFailureToMessage(Failure failure) {
    if (failure is NetworkFailure) {
      return 'مشكلة في الاتصال بالإنترنت، يرجى المحاولة مرة أخرى.';
    } else if (failure is ServerFailure) {
      return failure.message.isNotEmpty
          ? failure.message
          : 'عذراً، حدث خطأ في الخادم. نحن نعمل على إصلاحه.';
    } else if (failure is CacheFailure) {
      return 'فشل في تحميل البيانات المحفوظة.';
    } else {
      return 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.';
    }
  }
}
