import 'package:equatable/equatable.dart';

class Category extends Equatable {
  final int id;
  final String name;
  final String? nameAr;
  final String slug;
  final int? parentId;
  final String? icon;
  final List<Category>? subcategories;
  final bool requiresBrand;
  final String? brandType;

  const Category({
    required this.id,
    required this.name,
    this.nameAr,
    required this.slug,
    this.parentId,
    this.icon,
    this.subcategories,
    this.requiresBrand = false,
    this.brandType,
  });

  @override
  List<Object?> get props => [id, name, nameAr, slug, parentId, icon, subcategories, requiresBrand, brandType];
}
