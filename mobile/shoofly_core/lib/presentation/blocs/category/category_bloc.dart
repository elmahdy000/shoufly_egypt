import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/di/injection.dart';
import '../../../core/errors/api_exception.dart';
import '../../../domain/entities/category.dart';
import '../../../features/home/data/home_service.dart';

// --- Events ---
abstract class CategoryEvent extends Equatable {
  const CategoryEvent();
  @override
  List<Object?> get props => [];
}

class LoadCategories extends CategoryEvent {}
class RefreshCategories extends CategoryEvent {}

class LoadSubcategories extends CategoryEvent {
  final String categoryId;
  const LoadSubcategories(this.categoryId);
  @override
  List<Object?> get props => [categoryId];
}

// --- States ---
abstract class CategoryState extends Equatable {
  const CategoryState();
  @override
  List<Object?> get props => [];
}

class CategoryInitial extends CategoryState {}
class CategoryLoading extends CategoryState {}
class CategoriesLoaded extends CategoryState {
  final List<Category> categories;
  const CategoriesLoaded(this.categories);
  @override
  List<Object?> get props => [categories];
}

class SubcategoriesLoaded extends CategoryState {
  final List<Category> subcategories;
  const SubcategoriesLoaded(this.subcategories);
  @override
  List<Object?> get props => [subcategories];
}

class CategoryError extends CategoryState {
  final String message;
  const CategoryError({required this.message});
  @override
  List<Object?> get props => [message];
}

// State for refresh error - keeps old data with error message
class CategoriesRefreshError extends CategoryState {
  final List<Category> categories;
  final String message;
  const CategoriesRefreshError({required this.categories, required this.message});
  @override
  List<Object?> get props => [categories, message];
}

// --- Bloc ---
class CategoryBloc extends Bloc<CategoryEvent, CategoryState> {
  final HomeService _homeService;

  CategoryBloc() : _homeService = sl<HomeService>(), super(CategoryInitial()) {
    on<LoadCategories>(_onLoadCategories);
    on<RefreshCategories>(_onRefreshCategories);
    on<LoadSubcategories>(_onLoadSubcategories);
  }

  Future<void> _onLoadCategories(LoadCategories event, Emitter<CategoryState> emit) async {
    emit(CategoryLoading());
    try {
      final categories = await _homeService.getCategories();
      emit(CategoriesLoaded(categories));
    } on ApiException catch (e) {
      emit(CategoryError(message: e.message));
    } catch (e) {
      emit(CategoryError(message: 'فشل في تحميل الأقسام: ${e.toString()}'));
    }
  }

  Future<void> _onRefreshCategories(RefreshCategories event, Emitter<CategoryState> emit) async {
    // Get current categories to preserve them if refresh fails
    List<Category> currentCategories = [];
    if (state is CategoriesLoaded) {
      currentCategories = (state as CategoriesLoaded).categories;
    } else if (state is CategoriesRefreshError) {
      currentCategories = (state as CategoriesRefreshError).categories;
    }
    
    try {
      final categories = await _homeService.getCategories();
      emit(CategoriesLoaded(categories));
    } on NetworkException {
      // Emit error but keep old data
      if (currentCategories.isNotEmpty) {
        emit(CategoriesRefreshError(
          categories: currentCategories,
          message: 'لا يوجد اتصال بالإنترنت',
        ));
      } else {
        emit(CategoryError(message: 'لا يوجد اتصال بالإنترنت'));
      }
    } on ServerException catch (e) {
      if (currentCategories.isNotEmpty) {
        emit(CategoriesRefreshError(
          categories: currentCategories,
          message: e.message,
        ));
      } else {
        emit(CategoryError(message: e.message));
      }
    } catch (e) {
      if (currentCategories.isNotEmpty) {
        emit(CategoriesRefreshError(
          categories: currentCategories,
          message: 'فشل تحديث الأقسام',
        ));
      } else {
        emit(CategoryError(message: 'فشل تحديث الأقسام'));
      }
    }
  }

  Future<void> _onLoadSubcategories(LoadSubcategories event, Emitter<CategoryState> emit) async {
    emit(CategoryLoading());
    try {
      final subcategories = await _homeService.getSubcategories(event.categoryId);
      emit(SubcategoriesLoaded(subcategories));
    } on ApiException catch (e) {
      emit(CategoryError(message: e.message));
    } catch (e) {
      emit(CategoryError(message: 'فشل في تحميل التصنيفات الفرعية: ${e.toString()}'));
    }
  }
}
