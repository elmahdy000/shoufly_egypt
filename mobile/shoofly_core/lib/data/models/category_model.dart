import '../../domain/entities/category.dart';

class CategoryModel extends Category {
  const CategoryModel({
    required super.id,
    required super.name,
    super.nameAr,
    required super.slug,
    super.parentId,
    super.icon,
    super.subcategories,
    super.requiresBrand,
    super.brandType,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'],
      name: json['name'],
      nameAr: json['nameAr'],
      slug: json['slug'],
      parentId: json['parentId'],
      icon: json['icon'],
      requiresBrand: json['requiresBrand'] ?? false,
      brandType: json['brandType'],
      subcategories: json['subcategories'] != null
          ? (json['subcategories'] as List)
              .map((e) => CategoryModel.fromJson(e))
              .toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'nameAr': nameAr,
      'slug': slug,
      'parentId': parentId,
      'icon': icon,
      'requiresBrand': requiresBrand,
      'brandType': brandType,
      'subcategories': subcategories?.map((e) => (e as CategoryModel).toJson()).toList(),
    };
  }
}
