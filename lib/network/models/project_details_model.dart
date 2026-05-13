class ProjectDetails {
  final String id;
  final String projectName;
  final String description;
  final DateTime startDate;
  final DateTime endDate;
  final String status;
  final List<Task> tasks;
  final List<AssignedMember> assignedMembersDetails;

  ProjectDetails({
    required this.id,
    required this.projectName,
    required this.description,
    required this.startDate,
    required this.endDate,
    required this.status,
    required this.tasks,
    required this.assignedMembersDetails,
  });

  factory ProjectDetails.fromJson(Map<String, dynamic> json) {
    return ProjectDetails(
      id: json['_id'] ?? '',
      projectName: json['projectName'] ?? '',
      description: json['description'] ?? '',
      startDate: DateTime.parse(json['startDate']),
      endDate: DateTime.parse(json['endDate']),
      status: json['status'] ?? '',
      tasks: json['projectTasks'] is List
          ? (json['projectTasks'] as List<dynamic>)
              .map((e) => Task.fromJson(e))
              .toList()
          : (json['projectTasks'] as Map<String, dynamic>)
              .values
              .map((e) => Task.fromJson(e))
              .toList(),
      assignedMembersDetails: (json['assignedMembersDetails'] as List<dynamic>)
          .map((e) => AssignedMember.fromJson(e))
          .toList(),
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
      'tasks': tasks.map((e) => e.toJson()).toList(),
      'assignedMembersDetails':
          assignedMembersDetails.map((e) => e.toJson()).toList(),
    };
  }
}

class Task {
  final String id;
  final String taskName;
  final int amount;
  final String description;
  final String status;

  Task({
    required this.id,
    required this.taskName,
    required this.amount,
    required this.description,
    required this.status,
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['_id'] ?? '',
      taskName: json['taskName'] ?? '',
      amount: json['amount'] ?? 0,
      description: json['description'] ?? '',
      status: json['status'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'taskName': taskName,
      'amount': amount,
      'description': description,
      'status': status,
    };
  }
}

class AssignedMember {
  final String userId;
  final String? name;
  final String username;
  final String? profileImage;

  AssignedMember({
    required this.userId,
    this.name,
    required this.username,
    this.profileImage,
  });

  factory AssignedMember.fromJson(Map<String, dynamic> json) {
    return AssignedMember(
      userId: json['userId'] ?? '',
      name: json['name'],
      username: json['username'] ?? '',
      profileImage: json['profile_image'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'name': name,
      'username': username,
      'profile_image': profileImage,
    };
  }
}
