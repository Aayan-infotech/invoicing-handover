import 'dart:io';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:invoice_app/project_details/data_sheet.dart';
import 'package:invoice_app/network/models/doc_type_model.dart';
import 'package:invoice_app/network/provider/project_provider.dart';
import 'package:invoice_app/utills/app_colors.dart';
import 'package:provider/provider.dart';

class DocumentsScreen extends StatefulWidget {
  final String projectId;
  final String projectName;

  const DocumentsScreen({
    Key? key,
    required this.projectId,
    required this.projectName,
  }) : super(key: key);

  @override
  _DocumentsScreenState createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  static const List<Map<String, String>> expectedDocTypes = [
    {'name': 'RAMS', 'key': 'RAMS'},
    {'name': 'Data Sheets', 'key': 'Data Sheets'},
    {'name': 'Drawings', 'key': 'Drawings'},
    {'name': 'Tool Box Talks', 'key': 'Tool Box Talks'},
    {'name': 'ITPs', 'key': 'ITPs'},
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      async();
    });
  }

  async() async {
    final provider = Provider.of<ProjectProvider>(context, listen: false);
    await provider.fetchDocType(widget.projectId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Pallete.backgroundColor,
      appBar: AppBar(
        forceMaterialTransparency: true,
        elevation: 0,
        title: Text(
          widget.projectName,
          style: const TextStyle(
            color: Pallete.whiteColor,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        leading: _buildPlatformBackButton(context),
      ),
      body: Consumer<ProjectProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return _buildLoadingState();
          }

          final documents = provider.documentTypes;

          final List<DocumentItem> docItems = expectedDocTypes.map((docType) {
            final exists = documents.any(
              (doc) => doc.documentName == docType['key'],
            );

            final document = exists
                ? documents.firstWhere(
                    (doc) => doc.documentName == docType['key'],
                  )
                : null;

            return DocumentItem(
              name: docType['name']!,
              key: docType['key']!,
              exists: exists,
              document: document,
            );
          }).toList();

          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 4.0, vertical: 4),
                  child: Text(
                    'Documents',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Pallete.whiteColor,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: ListView.separated(
                    itemCount: docItems.length,
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final item = docItems[index];
                      return _buildDocumentCard(
                        context,
                        item.name,
                        item.exists,
                        item.exists
                            ? () => _handleDocumentTap(item.document!)
                            : null,
                      );
                    },
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildLoadingState() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 4.0, vertical: 4),
            child: Text(
              'Documents',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Pallete.whiteColor,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: ListView.separated(
              itemCount: expectedDocTypes.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                return _buildDocumentShimmer();
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDocumentShimmer() {
    return Container(
      decoration: BoxDecoration(
        color: Pallete.secondaryBackgroundColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Pallete.outLineColor),
      ),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Pallete.outLineColor,
          radius: 24,
        ),
        title: Container(
          height: 14,
          decoration: BoxDecoration(
            color: Pallete.outLineColor,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 8),
          child: Container(
            height: 10,
            width: 100,
            decoration: BoxDecoration(
              color: Pallete.outLineColor,
              borderRadius: BorderRadius.circular(4),
            ),
          ),
        ),
        trailing: CircleAvatar(
          backgroundColor: Pallete.outLineColor,
          radius: 16,
        ),
      ),
    );
  }

  Widget _buildPlatformBackButton(BuildContext context) {
    return IconButton(
      icon: Platform.isIOS
          ? const Icon(CupertinoIcons.back, color: Pallete.whiteColor)
          : const Icon(Icons.arrow_back, color: Pallete.whiteColor),
      onPressed: () => Navigator.of(context).pop(),
    );
  }

  Widget _buildDocumentCard(
    BuildContext context,
    String title,
    bool enabled,
    VoidCallback? onTap,
  ) {
    final iconBg = enabled
        ? Pallete.accentColor.withOpacity(0.15)
        : Pallete.outLineColor.withOpacity(0.4);
    final iconColor = enabled ? Pallete.accentColor : Pallete.subHeading;
    final titleColor = enabled ? Pallete.whiteColor : Pallete.subHeading;
    final subtitleColor = enabled
        ? Pallete.subHeading
        : Pallete.subHeading.withOpacity(0.6);
    final borderColor = enabled
        ? Pallete.accentColor.withOpacity(0.25)
        : Pallete.outLineColor;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      splashColor: Pallete.accentColor.withOpacity(0.1),
      child: Container(
        decoration: BoxDecoration(
          color: Pallete.secondaryBackgroundColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: borderColor),
        ),
        child: ListTile(
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 12,
          ),
          leading: Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: iconBg,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(Icons.description_outlined, color: iconColor, size: 26),
          ),
          title: Text(
            title,
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 16,
              color: titleColor,
            ),
          ),
          subtitle: Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              enabled ? 'Tap to view details' : 'Not available',
              style: TextStyle(fontSize: 13, color: subtitleColor),
            ),
          ),
          trailing: Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: iconBg,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(Icons.chevron_right, color: iconColor, size: 22),
          ),
        ),
      ),
    );
  }

  void _handleDocumentTap(DocumentType docType) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => DataSheetsScreen(
          pdfUrl: docType.documentFile,
          documentName: docType.documentName,
        ),
      ),
    );
  }
}
