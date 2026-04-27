import 'package:equatable/equatable.dart';

class Brand extends Equatable {
  final int id;
  final String name;
  final String slug;
  final String type;
  final String? logo;

  const Brand({
    required this.id,
    required this.name,
    required this.slug,
    required this.type,
    this.logo,
  });

  @override
  List<Object?> get props => [id, name, slug, type, logo];
}
