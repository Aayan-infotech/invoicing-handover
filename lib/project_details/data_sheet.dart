import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_pdfview/flutter_pdfview.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';

class DataSheetsScreen extends StatefulWidget {
  final String pdfUrl;
  final String documentName;

  const DataSheetsScreen({
    Key? key,
    required this.pdfUrl,
    required this.documentName,
  }) : super(key: key);

  @override
  State<DataSheetsScreen> createState() => _DataSheetsScreenState();
}

class _DataSheetsScreenState extends State<DataSheetsScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  String? _localFilePath;
  CancelToken? _cancelToken;

  double _downloadProgress = 0.0; 

  @override
  void initState() {
    super.initState();
    _downloadPdf();
  }

  @override
  void dispose() {
    _cancelToken?.cancel();
    super.dispose();
  }

  Future<void> _downloadPdf() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _downloadProgress = 0.0;
    });

    try {
      if (widget.pdfUrl.isEmpty) {
        throw Exception('Invalid PDF URL');
      }

      _cancelToken = CancelToken();
      final dir = await getTemporaryDirectory();
      final filePath =
          '${dir.path}/${DateTime.now().millisecondsSinceEpoch}.pdf';

      await Dio().download(
        widget.pdfUrl,
        filePath,
        cancelToken: _cancelToken,
        onReceiveProgress: (received, total) {
          if (total > 0) {
            setState(() {
              _downloadProgress = received / total;
            });
          }
        },
      );

      if (!await File(filePath).exists()) {
        throw Exception('File download failed');
      }

      setState(() {
        _localFilePath = filePath;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Failed to load document';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        forceMaterialTransparency: true,
        elevation: 0,
        title: Text(
          widget.documentName,
          style: const TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        leading: _buildPlatformBackButton(context),
        actions: [
          if (!_isLoading && _errorMessage != null)
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: _downloadPdf,
            ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              LinearProgressIndicator(value: _downloadProgress),
              const SizedBox(height: 16),
              Text(
                'Downloading ${(_downloadProgress * 100).toStringAsFixed(0)}%',
                style: const TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 8),
              const Text(
                'Please wait…',
                style: TextStyle(color: Colors.grey),
              ),
            ],
          ),
        ),
      );
    }

    if (_errorMessage != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 20),
              Text(
                _errorMessage!,
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 18, color: Colors.grey[700]),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _downloadPdf,
                child: const Text('Retry Download'),
              ),
            ],
          ),
        ),
      );
    }

    if (_localFilePath != null) {
      return PDFView(
        filePath: _localFilePath,
        enableSwipe: true,
        autoSpacing: true,
        pageFling: true,
        onError: (error) {
          setState(() {
            _errorMessage = 'Failed to load PDF';
            _localFilePath = null;
          });
        },
      );
    }

    return _buildNoDocument();
  }

  Widget _buildNoDocument() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.description, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          const Text('No document available', style: TextStyle(fontSize: 18)),
        ],
      ),
    );
  }

  Widget _buildPlatformBackButton(BuildContext context) {
    return Platform.isIOS
        ? CupertinoButton(
            padding: EdgeInsets.zero,
            child: const Icon(CupertinoIcons.back, color: Colors.black),
            onPressed: () => Navigator.of(context).pop(),
          )
        : IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.black),
            onPressed: () => Navigator.of(context).pop(),
          );
  }
}
