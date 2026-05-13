class DocumentModel {
  final String id;
  final String documentName;
  final String typeOfDocument;
  final String documentUrl;

  DocumentModel({
    required this.id,
    required this.documentName,
    required this.typeOfDocument,
    required this.documentUrl,
  });

  factory DocumentModel.fromJson(Map<String, dynamic> json) {
    return DocumentModel(
      id: json['_id'] ?? '',
      documentName: json['documentName'] ?? '',
      typeOfDocument: json['typeOfDocument'] ?? '',
      documentUrl: json['documentFile'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'documentName': documentName,
      'typeOfDocument': typeOfDocument,
      'documentHtml': documentUrl,
    };
  }
}
