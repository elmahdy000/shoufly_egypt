/// Model for creating a new request
class CreateRequestModel {
  final String title;
  final String description;
  final String categoryId;
  final String? location;
  final double? budget;
  final List<String>? imagePaths;

  CreateRequestModel({
    required this.title,
    required this.description,
    required this.categoryId,
    this.location,
    this.budget,
    this.imagePaths,
  });

  Map<String, dynamic> toJson() => {
        'title': title,
        'description': description,
        'categoryId': categoryId,
        if (location != null) 'location': location,
        if (budget != null) 'budget': budget,
      };

  factory CreateRequestModel.fromJson(Map<String, dynamic> json) => CreateRequestModel(
        title: json['title'] as String,
        description: json['description'] as String,
        categoryId: json['categoryId'] as String,
        location: json['location'] as String?,
        budget: json['budget'] != null ? double.tryParse(json['budget'].toString()) : null,
        imagePaths: json['imagePaths'] != null 
            ? List<String>.from(json['imagePaths'] as List) 
            : null,
      );
}
