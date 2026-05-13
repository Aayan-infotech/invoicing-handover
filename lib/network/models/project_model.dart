class ProjectModel {
  final String id;
  final String projectName;
  final String description;
  final DateTime startDate;
  final DateTime endDate;
  final String status;
  final int version;

  ProjectModel({
    required this.id,
    required this.projectName,
    required this.description,
    required this.startDate,
    required this.endDate,
    required this.status,
    required this.version,
  });

  factory ProjectModel.fromJson(Map<String, dynamic> json) {
    return ProjectModel(
      id: json['_id'] ?? '',
      projectName: json['projectName'] ?? '',
      description: json['description'] ?? "",
      startDate: DateTime.parse(json['startDate']),
      endDate: DateTime.parse(json['endDate']),
      status: json['status'] ?? '',
      version: json['__v'] ?? 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'projectName': projectName,
      'description': description,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
      'status': status,
      '__v': version,
    };
  }
}
