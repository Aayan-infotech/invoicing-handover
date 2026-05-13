class InvoiceModel {
  final String id;
  final String invoiceNumber;
  final int taskCompletedQuantity;
  final String invoiceUrl;
  final int amount;
  final String status;
  final DateTime invoiceDate;
  final UserDetails userDetails;
  final String projectName;
  final String taskName;

  InvoiceModel({
    required this.id,
    required this.invoiceNumber,
    required this.taskCompletedQuantity,
    required this.invoiceUrl,
    required this.amount,
    required this.status,
    required this.invoiceDate,
    required this.userDetails,
    required this.projectName,
    required this.taskName,
  });

  factory InvoiceModel.fromJson(Map<String, dynamic> json) {
    return InvoiceModel(
      id: json['_id'] ?? '',
      invoiceNumber: json['invoiceNumber'] ?? '',
      taskCompletedQuantity: json['taskCompletedQuantity'] ?? 0,
      invoiceUrl: json['invoiceUrl'] ?? '',
      amount: json['amount'] ?? 0,
      status: json['status'] ?? '',
      invoiceDate: DateTime.parse(
        json['InvoiceDate'] ?? DateTime.now().toIso8601String(),
      ),
      userDetails: UserDetails.fromJson(
        json['userDetails'] ?? {},
      ),
      projectName: json['projectName'] ?? '',
      taskName: json['taskName'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'invoiceNumber': invoiceNumber,
      'taskCompletedQuantity': taskCompletedQuantity,
      'invoiceUrl': invoiceUrl,
      'amount': amount,
      'status': status,
      'InvoiceDate': invoiceDate.toIso8601String(),
      'userDetails': userDetails.toJson(),
      'projectName': projectName,
      'taskName': taskName,
    };
  }
}
class UserDetails {
  final String name;
  final String email;
  final String address;
  final String username;

  UserDetails({
    required this.name,
    required this.email,
    required this.address,
    required this.username,
  });

  factory UserDetails.fromJson(Map<String, dynamic> json) {
    return UserDetails(
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      address: json['address'] ?? '',
      username: json['username'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      'address': address,
      'username': username,
    };
  }
}
