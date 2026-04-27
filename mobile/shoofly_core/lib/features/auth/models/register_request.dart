/// Register request model
class RegisterRequest {
  final String email;
  final String password;
  final String fullName;
  final String role;
  final String? phone;

  RegisterRequest({
    required this.email,
    required this.password,
    required this.fullName,
    required this.role,
    this.phone,
  });

  Map<String, dynamic> toJson() => {
        'email': email,
        'password': password,
        'fullName': fullName,
        'role': role,
        if (phone != null) 'phone': phone,
      };

  factory RegisterRequest.fromJson(Map<String, dynamic> json) => RegisterRequest(
        email: json['email'] as String,
        password: json['password'] as String,
        fullName: json['fullName'] as String,
        role: json['role'] as String,
        phone: json['phone'] as String?,
      );
}
