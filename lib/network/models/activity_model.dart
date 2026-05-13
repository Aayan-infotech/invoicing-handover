class ActivityModel {
  final String id;
  final String taskName;
  final String invoiceUrl;
  final String projectName;
  final DateTime createdAt;

  ActivityModel({
    required this.id,
    required this.taskName,
    required this.invoiceUrl,
    required this.projectName,
    required this.createdAt,
  });

  factory ActivityModel.fromJson(Map<String, dynamic> json) {
    return ActivityModel(
      id: json['_id'] ?? '',
      taskName: json['taskName'] ?? '',
      invoiceUrl: json['invoiceUrl'] ?? '',
      projectName: json['projectName'],
      createdAt: DateTime.now(), //DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'invoiceNumber': taskName,
      'invoiceUrl': invoiceUrl,
      'amount': projectName,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
