class DocumentType {
  final String id;
  final String documentName;
  final String typeOfDocument;
  final String documentFile;

  DocumentType({
    required this.id,
    required this.documentName,
    required this.typeOfDocument,
    required this.documentFile,
  });

  factory DocumentType.fromJson(Map<String, dynamic> json) {
    return DocumentType(
      id: json['_id'],
      documentName: json['documentTypeId']?['name'] ?? '',
      typeOfDocument: json['typeOfDocument'] ?? '',
      documentFile: json['documentFile'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'documentTypeId': {
        'name': documentName,
      },
      'typeOfDocument': typeOfDocument,
      'documentFile': documentFile,
    };
  }
}

class DocumentItem {
  final String name;
  final String key;
  final bool exists;
  final dynamic
      document; // You can replace `dynamic` with a specific type if known.

  DocumentItem({
    required this.name,
    required this.key,
    required this.exists,
    required this.document,
  });

  factory DocumentItem.fromJson(Map<String, dynamic> json) {
    return DocumentItem(
      name: json['name'] ?? '',
      key: json['key'] ?? '',
      exists: json['exists'] ?? false,
      document: json['document'], // Adjust if document is another model.
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'key': key,
      'exists': exists,
      'document': document,
    };
  }
}
