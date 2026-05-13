class UserModel {
  final String userId;
  final String username;
  final String name;
  final String email;
  final String mobile;
  final String address;
  final String profileImage;
  final bool is2FAEnabled;

  UserModel({
    required this.userId,
    required this.username,
    required this.name,
    required this.email,
    required this.mobile,
    required this.address,
    required this.profileImage,
    required this.is2FAEnabled,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      userId: json['userId'] ?? '',
      username: json['username'] ?? '',
      name: json['name'] ?? "",
      email: json['email'] ?? "",
      mobile: json['mobile'] ?? "",
      address: json['address'] ?? "",
      profileImage: json['profile_image'] ?? "",
      is2FAEnabled: json['is2FAEnabled'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'username': username,
      'name': name,
      'email': email,
      'mobile': mobile,
      'address': address,
      'profile_image': profileImage,
      'is2FAEnabled': is2FAEnabled,
    };
  }
}
