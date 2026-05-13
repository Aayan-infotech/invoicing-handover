class AttendanceModel {
  final String id;
  final String userId;
  final DateTime clockInTime;
  final bool isClockedIn;
  final String latitude;
  final String longitude;
  final DateTime createdAt;
  final DateTime updatedAt;

  AttendanceModel({
    required this.id,
    required this.userId,
    required this.clockInTime,
    required this.isClockedIn,
    required this.latitude,
    required this.longitude,
    required this.createdAt,
    required this.updatedAt,
  });

  factory AttendanceModel.fromJson(Map<String, dynamic> json) {
    return AttendanceModel(
      id: json['_id'] ?? '',
      userId: json['userId'] ?? '',
      clockInTime: DateTime.parse(json['clockInTime']),
      isClockedIn: json['isClockedIn'] ?? false,
      latitude: json['latitude'] ?? '',
      longitude: json['longitude'] ?? '',
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }
}
