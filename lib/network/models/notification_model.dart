class NotificationModel {
  final String title;
  final String body;
  final bool isRead;
  final String id;

  NotificationModel({
    required this.body,
    required this.id,
    required this.isRead,
    required this.title,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      body: json['body'] ?? "",
      id: json['notificationId'] ?? '',
      isRead: json['isRead'] ?? false,
      title: json['title'] ?? '',
    );
  }
}
