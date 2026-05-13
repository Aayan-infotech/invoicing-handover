class SecuritySettings {
  final bool is2FAEnabled;
  final List<DeviceInfo> deviceDetails;

  SecuritySettings({
    required this.is2FAEnabled,
    required this.deviceDetails,
  });

  factory SecuritySettings.fromJson(Map<String, dynamic> json) {
    return SecuritySettings(
      is2FAEnabled: json['is2FAEnabled'] ?? false,
      deviceDetails: (json['deviceDetails'] as List<dynamic>? ?? [])
          .map((e) => DeviceInfo.fromJson(e))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'is2FAEnabled': is2FAEnabled,
      'deviceDetails': deviceDetails.map((e) => e.toJson()).toList(),
    };
  }
}

class DeviceInfo {
  final String id;
  final String deviceToken;
  final String deviceType;
  final String deviceName;
  final String deviceModel;
  final bool isLoggedIn;
  final String userId;
  final DateTime createdAt;
  final DateTime updatedAt;

  DeviceInfo({
    required this.id,
    required this.deviceToken,
    required this.deviceType,
    required this.deviceName,
    required this.deviceModel,
    required this.isLoggedIn,
    required this.userId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory DeviceInfo.fromJson(Map<String, dynamic> json) {
    return DeviceInfo(
      id: json['_id'] ?? '',
      deviceToken: json['deviceToken'] ?? '',
      deviceType: json['deviceType'] ?? '',
      deviceName: json['deviceName'] ?? '',
      deviceModel: json['deviceModel'] ?? '',
      isLoggedIn: json['isLoggedIn'] ?? false,
      userId: json['userId'] ?? '',
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'deviceToken': deviceToken,
      'deviceType': deviceType,
      'deviceName': deviceName,
      'deviceModel': deviceModel,
      'isLoggedIn': isLoggedIn,
      'userId': userId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
