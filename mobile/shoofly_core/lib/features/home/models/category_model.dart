/// Category model for home page categories
class CategoryModel {
  final String id;
  final String name;
  final String? icon;
  final String? color;
  final int? sortOrder;
  final bool isActive;

  CategoryModel({
    required this.id,
    required this.name,
    this.icon,
    this.color,
    this.sortOrder,
    this.isActive = true,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) => CategoryModel(
        id: json['id'].toString(),
        name: json['name'] as String,
        icon: json['icon'] as String?,
        color: json['color'] as String?,
        sortOrder: json['sortOrder'] as int?,
        isActive: json['isActive'] as bool? ?? true,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'icon': icon,
        'color': color,
        'sortOrder': sortOrder,
        'isActive': isActive,
      };
}
