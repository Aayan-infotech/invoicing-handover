class TaskModel {
  final String id;
  final String taskName;
  final String description;
  final String status;
  final int amount;
  final int taskQuantity;
  final int taskCompletedQuantity;
  final String taskUpdateDescription;
  final List<String> taskUpdatePhotos;
  final String invoiceUrl;
  final TaskProjectDetails projectDetails;
  final List<TaskUpdateHistory> taskUpdateHistory;

  TaskModel({
    required this.id,
    required this.taskName,
    required this.description,
    required this.status,
    required this.amount,
    required this.taskQuantity,
    required this.taskCompletedQuantity,
    required this.taskUpdateDescription,
    required this.taskUpdatePhotos,
    required this.invoiceUrl,
    required this.projectDetails,
    required this.taskUpdateHistory,
  });

  factory TaskModel.fromJson(Map<String, dynamic> json) {
    return TaskModel(
      id: json['_id'] ?? '',
      taskName: json['taskName'] ?? '',
      description: json['description'] ?? '',
      status: json['status'] ?? '',
      amount: json['amount'] ?? 0,
      taskQuantity: json['taskQuantity'] ?? 0,
      taskCompletedQuantity: json['taskCompletedQuantity'] ?? 0,
      taskUpdateDescription: json['taskUpdateDescription'] ?? '',
      taskUpdatePhotos: List<String>.from(json['taskUpdatePhotos'] ?? []),
      invoiceUrl: json['invoiceUrl'] ?? '',
      projectDetails: TaskProjectDetails.fromJson(json['projectDetails'] ?? {}),
      taskUpdateHistory: (json['taskUpdateHistory'] as List<dynamic>? ?? [])
          .map((e) => TaskUpdateHistory.fromJson(e))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'taskName': taskName,
      'description': description,
      'status': status,
      'amount': amount,
      'taskQuantity': taskQuantity,
      'taskCompletedQuantity': taskCompletedQuantity,
      'taskUpdateDescription': taskUpdateDescription,
      'taskUpdatePhotos': taskUpdatePhotos,
      'invoiceUrl': invoiceUrl,
      'projectDetails': projectDetails.toJson(),
      'taskUpdateHistory': taskUpdateHistory.map((e) => e.toJson()).toList(),
    };
  }
}

class TaskProjectDetails {
  final String id;
  final String projectName;
  final String description;
  final String status;

  TaskProjectDetails({
    required this.id,
    required this.projectName,
    required this.description,
    required this.status,
  });

  factory TaskProjectDetails.fromJson(Map<String, dynamic> json) {
    return TaskProjectDetails(
      id: json['_id'] ?? '',
      projectName: json['projectName'] ?? '',
      description: json['description'] ?? '',
      status: json['status'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'projectName': projectName,
      'description': description,
      'status': status,
    };
  }
}

class TaskUpdateHistory {
  final String id;
  final String taskId;
  final String updateDescription;
  final int taskCompletedQuantity;
  final String status;
  final List<String> updatePhotos;
  final List<dynamic> updateDocuments;
  final String updatedBy;
  final DateTime createdAt;
  final DateTime updatedAt;

  TaskUpdateHistory({
    required this.id,
    required this.taskId,
    required this.updateDescription,
    required this.taskCompletedQuantity,
    required this.status,
    required this.updatePhotos,
    required this.updateDocuments,
    required this.updatedBy,
    required this.createdAt,
    required this.updatedAt,
  });

  factory TaskUpdateHistory.fromJson(Map<String, dynamic> json) {
    return TaskUpdateHistory(
      id: json['_id'] ?? '',
      taskId: json['taskId'] ?? '',
      updateDescription: json['updateDescription'] ?? '',
      taskCompletedQuantity: json['taskCompletedQuantity'] ?? 0,
      status: json['status'] ?? '',
      updatePhotos: List<String>.from(json['updatePhotos'] ?? []),
      updateDocuments: json['updateDocuments'] ?? [],
      updatedBy: json['updatedBy'] ?? '',
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'taskId': taskId,
      'updateDescription': updateDescription,
      'taskCompletedQuantity': taskCompletedQuantity,
      'status': status,
      'updatePhotos': updatePhotos,
      'updateDocuments': updateDocuments,
      'updatedBy': updatedBy,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
