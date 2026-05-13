import 'dart:io' show Platform;

import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:open_file/open_file.dart';
// import 'package:open_filex/open_filex.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';

import 'package:invoice_app/network/provider/auth_provider.dart';
import 'package:invoice_app/network/models/activity_model.dart';
import 'package:invoice_app/utills/app_colors.dart';

class ActivityScreen extends StatefulWidget {
  const ActivityScreen({Key? key}) : super(key: key);

  @override
  State<ActivityScreen> createState() => _ActivityScreenState();
}

class _ActivityScreenState extends State<ActivityScreen> {
  final Map<String, bool> _downloadingMap = {};
  final Map<String, double> _downloadProgress = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchActivities();
    });
  }

  Future<void> _fetchActivities() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (authProvider.lstActivity.isEmpty) {
      await authProvider.getActitvity();
    }
  }

  Future<void> _downloadInvoice(ActivityModel activity) async {
    if (_downloadingMap[activity.id] == true) return;

    setState(() {
      _downloadingMap[activity.id] = true;
      _downloadProgress[activity.id] = 0.0;
    });

    try {
      final dir = await getApplicationDocumentsDirectory();
      final fileName = 'Invoice_${activity.taskName}.pdf';  
      final filePath = '${dir.path}/$fileName';

      await Dio().download(
        activity.invoiceUrl, 
        filePath,
        onReceiveProgress: (received, total) {
          if (total > 0 && mounted) {
            setState(() {
              _downloadProgress[activity.id] = received / total;
            });
          }
        },
      );

      if (!mounted) return;
      _openDownloadedFile(filePath);
      // await OpenFilex.open(filePath);

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Invoice downloaded'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Download failed'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _downloadingMap[activity.id] = false;
        });
      }
    }
  }

  Future<void> _openDownloadedFile(String filePath) async {
    final result = await OpenFile.open(filePath);

    if (result.type != ResultType.done && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Could not open file: ${result.message}'),
          action: SnackBarAction(
            label: 'RETRY',
            onPressed: () => _openDownloadedFile(filePath),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Pallete.backgroundColor,
      appBar: AppBar(
        forceMaterialTransparency: true,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          'Activity',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: Pallete.whiteColor,
          ),
        ),
        leading: _getPlatformBackButton(context),
      ),
      body: Consumer<AuthProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.lstActivity.isEmpty) {
            return const Center(
              child: Text(
                'No activities yet',
                style: TextStyle(fontSize: 18, color: Pallete.subHeading),
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.only(bottom: 20),
            itemCount: provider.lstActivity.length,
            itemBuilder: (context, index) {
              return _buildProjectItem(provider.lstActivity[index]);
            },
          );
        },
      ),
    );
  }

  Widget _getPlatformBackButton(BuildContext context) {
    if (Platform.isIOS) {
      return CupertinoButton(
        padding: EdgeInsets.zero,
        child: const Icon(CupertinoIcons.back, color: Pallete.whiteColor),
        onPressed: () => Navigator.pop(context),
      );
    }
    return IconButton(
      icon: const Icon(Icons.arrow_back, color: Pallete.whiteColor),
      onPressed: () => Navigator.pop(context),
    );
  }

  Widget _buildProjectItem(ActivityModel activity) {
    final isDownloading = _downloadingMap[activity.id] ?? false;
    final progress = _downloadProgress[activity.id] ?? 0.0;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Pallete.secondaryBackgroundColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Pallete.outLineColor),
      ),
      child: Row(
        children: [
          Container(
            height: 56,
            width: 56,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF6A11CB), Color(0xFF2575FC)],
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.receipt, color: Colors.white),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  activity.projectName,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Pallete.whiteColor,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  activity.taskName,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: Pallete.subHeading,
                  ),
                ),
                SizedBox(height: 6),
                Text(
                  _formatDate(activity.createdAt),
                  style: const TextStyle(fontSize: 12, color: Pallete.subHeading),
                ),
              ],
            ),
          ),
          isDownloading
              ? SizedBox(
                  height: 40,
                  width: 40,
                  child: CircularProgressIndicator(
                    color: Colors.green,
                    value: progress,
                    strokeWidth: 3,
                  ),
                )
              : IconButton(
                  icon: const Icon(Icons.download, color: Colors.green),
                  onPressed: () => _downloadInvoice(activity),
                ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    final hour = date.hour > 12 ? date.hour - 12 : date.hour;
    final minute = date.minute.toString().padLeft(2, '0');
    final period = date.hour >= 12 ? 'PM' : 'AM';

    return '${date.day} ${months[date.month - 1]} ${date.year} $hour:$minute $period';
  }
}
