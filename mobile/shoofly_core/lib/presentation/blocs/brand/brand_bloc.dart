import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../domain/entities/brand.dart';
import '../../../domain/repositories/brand_repository.dart';

// --- Events ---
abstract class BrandEvent extends Equatable {
  const BrandEvent();
  @override
  List<Object?> get props => [];
}

class LoadBrands extends BrandEvent {
  final String? type;
  const LoadBrands({this.type});
  @override
  List<Object?> get props => [type];
}

class LoadBrandsBySubcategory extends BrandEvent {
  final String subcategoryId;
  const LoadBrandsBySubcategory(this.subcategoryId);
  @override
  List<Object?> get props => [subcategoryId];
}

// --- States ---
abstract class BrandState extends Equatable {
  const BrandState();
  @override
  List<Object?> get props => [];
}

class BrandInitial extends BrandState {}
class BrandLoading extends BrandState {}
class BrandsLoaded extends BrandState {
  final List<Brand> brands;
  const BrandsLoaded(this.brands);
  @override
  List<Object?> get props => [brands];
}
class BrandError extends BrandState {
  final String message;
  const BrandError(this.message);
  @override
  List<Object?> get props => [message];
}

// --- Bloc ---
class BrandBloc extends Bloc<BrandEvent, BrandState> {
  final BrandRepository repository;

  BrandBloc({required this.repository}) : super(BrandInitial()) {
    on<LoadBrands>(_onLoadBrands);
    on<LoadBrandsBySubcategory>(_onLoadBrandsBySubcategory);
  }

  Future<void> _onLoadBrands(LoadBrands event, Emitter<BrandState> emit) async {
    emit(BrandLoading());
    final result = await repository.getBrands(event.type);
    result.fold(
      (failure) => emit(BrandError(failure.message)),
      (brands) => emit(BrandsLoaded(brands)),
    );
  }

  Future<void> _onLoadBrandsBySubcategory(LoadBrandsBySubcategory event, Emitter<BrandState> emit) async {
    emit(BrandLoading());
    final result = await repository.getBrandsBySubcategory(event.subcategoryId);
    result.fold(
      (failure) => emit(BrandError(failure.message)),
      (brands) => emit(BrandsLoaded(brands)),
    );
  }
}
