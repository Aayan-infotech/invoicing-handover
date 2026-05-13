import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:invoice_app/network/call_helpar.dart';
import 'package:invoice_app/network/provider/project_provider.dart';
import 'package:invoice_app/utills/app_colors.dart';
import 'package:invoice_app/utills/app_dialogue.dart';
import 'package:invoice_app/utills/branded_text_filed.dart';
import 'package:invoice_app/utills/constant.dart';
import 'package:invoice_app/utills/shared_pref.dart';
import 'package:path_provider/path_provider.dart';
import 'package:provider/provider.dart';
import 'package:invoice_app/network/models/task_details_model.dart';
import 'package:open_file/open_file.dart';
import 'package:dio/dio.dart';

class TaskScreen extends StatefulWidget {
  final String taskId;
  const TaskScreen({super.key, required this.taskId});

  @override
  State<TaskScreen> createState() => _TaskScreenState();
}

class _TaskScreenState extends State<TaskScreen> {
  int? _selectedOption = 0;
  File? _selectedFile;
  bool _isSubmitting = false;
  bool _isDownloading = false;
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _quantityController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadTaskDetails();
    });
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    _quantityController.dispose();
    super.dispose();
  }

  _loadTaskDetails() async {
    final provider = Provider.of<ProjectProvider>(context, listen: false);
    await provider.fetchTaskDetails(widget.taskId);

    if (provider.taskDetails != null) {
      setState(() {
        _selectedOption =
            provider.taskDetails!.status.toLowerCase() == "completed" ? 1 : 0;
        _descriptionController.text = provider.taskDetails!.description;
      });
    }
  }

  Future<void> _pickFile() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles();

      if (result != null && result.files.single.path != null) {
        setState(() {
          _selectedFile = File(result.files.single.path!);
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('File error: ${e.toString()}')));
    }
  }

  Future<void> _downloadInvoice(String url) async {
    if (url.isEmpty) {
      showCustomDialog(
        context: context,
        type: DialogType.error,
        title: 'Error',
        message: "No invoice available for download",
        onPressed: () => Navigator.pop(context),
      );
      return;
    }

    setState(() => _isDownloading = true);

    try {
      final directory = await getApplicationDocumentsDirectory();
      final invoicesDir = Directory('${directory.path}/Invoices');

      if (!invoicesDir.existsSync()) {
        await invoicesDir.create(recursive: true);
      }

      final fileName = 'Invoice_${DateTime.now().millisecondsSinceEpoch}.pdf';
      final fullPath = '${invoicesDir.path}/$fileName';

      final dio = Dio();
      await dio.download(
        url,
        fullPath,
        onReceiveProgress: (received, total) {
          if (total != -1) {
            debugPrint(
              'Download ${(received / total * 100).toStringAsFixed(0)}%',
            );
          }
        },
      );

      final result = await OpenFile.open(fullPath);
      if (result.type != ResultType.done) {
        throw Exception(result.message);
      }
    } catch (e) {
      showCustomDialog(
        context: context,
        type: DialogType.error,
        title: 'Download Error',
        message: e.toString(),
        onPressed: () => Navigator.pop(context),
      );
    } finally {
      setState(() => _isDownloading = false);
    }
  }

  Future<void> _submitTaskUpdate() async {
    setState(() => _isSubmitting = true);

    if (_quantityController.text.isEmpty) {
      showCustomDialog(
        context: context,
        type: DialogType.error,
        title: 'Error',
        message: "Please enter completed quantity",
        onPressed: () => Navigator.pop(context),
      );
      setState(() => _isSubmitting = false);
      return;
    }

    final completedQuantity = int.tryParse(_quantityController.text);
    if (completedQuantity == null || completedQuantity <= 0) {
      showCustomDialog(
        context: context,
        type: DialogType.error,
        title: 'Error',
        message: "Please enter a valid quantity",
        onPressed: () => Navigator.pop(context),
      );
      setState(() => _isSubmitting = false);
      return;
    }

    try {
      final status = _selectedOption == 0 ? 'in progress' : 'completed';
      final description = _descriptionController.text.isNotEmpty
          ? _descriptionController.text
          : 'Task status updated to $status';

      var uri = Uri.parse(
        '${CallHelper.baseUrl}projects/task-completion-update',
      );
      var request = http.MultipartRequest('PUT', uri);
      String accessToken =
          SharedPrefUtil.getValue(accessTokenPref, "") as String;

      request.headers['Authorization'] = 'Bearer $accessToken';
      request.fields['taskId'] = widget.taskId;
      request.fields['taskUpdateDescription'] = description;
      request.fields['taskCompletedQuantity'] = completedQuantity.toString();

      if (_selectedFile != null) {
        request.files.add(
          await http.MultipartFile.fromPath(
            'taskUpdateFile',
            _selectedFile!.path,
          ),
        );
      }

      var response = await request.send();
      await response.stream.bytesToString();

      if (response.statusCode == 200) {
        await _loadTaskDetails();
        _descriptionController.clear();
        _quantityController.clear();
        setState(() => _selectedFile = null);
        showCustomDialog(
          context: context,
          type: DialogType.success,
          title: 'Updated!',
          message: 'Your Task has been successfully updated.',
          onPressed: () async {
            Navigator.pop(context);
            Navigator.pop(context);
          },
        );
      } else if (response.statusCode == 400) {
        var decodedData = jsonDecode(response.reasonPhrase!);
        debugPrint(decodedData.toString());
      } else {
        showCustomDialog(
          context: context,
          type: DialogType.error,
          title: 'Error',
          message: "Task update failed: ${response.statusCode}",
          onPressed: () => Navigator.pop(context),
        );
      }
    } catch (e) {
      showCustomDialog(
        context: context,
        type: DialogType.error,
        title: 'Error',
        message: "Failed to update task: ${e.toString()}",
        onPressed: () => Navigator.pop(context),
      );
    } finally {
      setState(() => _isSubmitting = false);
    }
  }

  String _formatDate(DateTime date) {
    return DateFormat('dd MMM yyyy, hh:mm a').format(date.toLocal());
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return Pallete.successColor;
      case 'in progress':
        return Pallete.warmLeadIconColor;
      case 'pending':
        return Pallete.accentColor;
      default:
        return Pallete.subHeading;
    }
  }

  BoxDecoration _cardDecoration() => BoxDecoration(
    color: Pallete.secondaryBackgroundColor,
    borderRadius: BorderRadius.circular(16),
    border: Border.all(color: Pallete.outLineColor),
  );

  Widget _sectionTitle(String title) => Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: Text(
      title,
      style: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w700,
        color: Pallete.whiteColor,
        letterSpacing: 0.2,
      ),
    ),
  );

  Widget _buildHistoryItem(TaskUpdateHistory history) {
    final statusColor = _getStatusColor(history.status);
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                _formatDate(history.createdAt),
                style: const TextStyle(
                  fontWeight: FontWeight.w500,
                  color: Pallete.subHeading,
                  fontSize: 12,
                ),
              ),
              Text(
                'By: ${history.updatedBy}',
                style: const TextStyle(
                  fontWeight: FontWeight.w500,
                  color: Pallete.subHeading,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: statusColor.withOpacity(0.5)),
                ),
                child: Text(
                  history.status.toUpperCase(),
                  style: TextStyle(
                    color: statusColor,
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                    letterSpacing: 0.4,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                'Completed: ${history.taskCompletedQuantity}',
                style: const TextStyle(
                  fontWeight: FontWeight.w500,
                  color: Pallete.whiteColor,
                ),
              ),
            ],
          ),
          if (history.updateDescription.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              history.updateDescription,
              style: const TextStyle(
                fontSize: 14,
                color: Pallete.whiteColor,
                height: 1.4,
              ),
            ),
          ],
          if (history.updatePhotos.isNotEmpty) ...[
            const SizedBox(height: 12),
            const Text(
              'Photos',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: Pallete.subHeading,
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              height: 100,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: history.updatePhotos.length,
                itemBuilder: (context, index) {
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.network(
                        history.updatePhotos[index],
                        width: 100,
                        fit: BoxFit.cover,
                        loadingBuilder: (context, child, loadingProgress) {
                          if (loadingProgress == null) return child;
                          return Container(
                            width: 100,
                            color: Pallete.backgroundColor,
                            child: const Center(
                              child: CircularProgressIndicator(
                                color: Pallete.accentColor,
                              ),
                            ),
                          );
                        },
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            width: 100,
                            color: Pallete.backgroundColor,
                            child: const Icon(
                              Icons.broken_image,
                              color: Pallete.subHeading,
                            ),
                          );
                        },
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDetailItem({
    required String label,
    required String value,
    Color? valueColor,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: Pallete.subHeading,
            letterSpacing: 0.3,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: valueColor ?? Pallete.whiteColor,
          ),
        ),
      ],
    );
  }

  Widget _buildStatusButton({
    required String text,
    required bool isSelected,
    required VoidCallback onTap,
    required IconData icon,
  }) {
    final activeColor = Pallete.accentColor;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: isSelected
              ? activeColor.withOpacity(0.15)
              : Pallete.backgroundColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? activeColor : Pallete.outLineColor,
            width: 1.5,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: isSelected ? activeColor : Pallete.subHeading,
              size: 26,
            ),
            const SizedBox(height: 6),
            Text(
              text,
              style: TextStyle(
                color: isSelected ? activeColor : Pallete.subHeading,
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<ProjectProvider>(
      builder: (context, projectProvider, _) {
        if (projectProvider.isTaskLoading) {
          return const Scaffold(
            backgroundColor: Pallete.backgroundColor,
            body: Center(
              child: CircularProgressIndicator(color: Pallete.accentColor),
            ),
          );
        }

        if (projectProvider.taskDetails == null) {
          return Scaffold(
            backgroundColor: Pallete.backgroundColor,
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.error_outline,
                    color: Pallete.errorColor,
                    size: 56,
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Failed to load task details',
                    style: TextStyle(color: Pallete.whiteColor, fontSize: 16),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: _loadTaskDetails,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Pallete.primaryColor,
                      foregroundColor: Pallete.whiteColor,
                    ),
                    child: const Text('Try Again'),
                  ),
                ],
              ),
            ),
          );
        }

        final task = projectProvider.taskDetails!;
        return GestureDetector(
          onTap: () {
            FocusScope.of(context).unfocus();
          },
          child: Scaffold(
            backgroundColor: Pallete.backgroundColor,
            appBar: AppBar(
              title: const Text(
                "Task Details",
                style: TextStyle(
                  color: Pallete.whiteColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
              centerTitle: true,
              forceMaterialTransparency: true,
              iconTheme: const IconThemeData(color: Pallete.whiteColor),
            ),
            body: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Hero task card
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Pallete.primaryColor.withOpacity(0.25),
                          Pallete.accentColor.withOpacity(0.15),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                        color: Pallete.accentColor.withOpacity(0.4),
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: Pallete.accentColor.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(
                            Icons.task_alt,
                            color: Pallete.accentColor,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'TASK',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: 1.2,
                                  color: Pallete.accentColor,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                task.taskName,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Pallete.whiteColor,
                                  height: 1.25,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Invoice card
                  if (task.invoiceUrl.isNotEmpty) ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: _cardDecoration(),
                      child: Row(
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: Pallete.successColor.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(
                              Icons.receipt_long,
                              color: Pallete.successColor,
                            ),
                          ),
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Text(
                              'Invoice Available',
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                color: Pallete.whiteColor,
                                fontSize: 15,
                              ),
                            ),
                          ),
                          ElevatedButton.icon(
                            onPressed: _isDownloading
                                ? null
                                : () => _downloadInvoice(task.invoiceUrl),
                            icon: _isDownloading
                                ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Pallete.whiteColor,
                                    ),
                                  )
                                : const Icon(Icons.download, size: 18),
                            label: Text(
                              _isDownloading ? 'Downloading…' : 'Download',
                              style: const TextStyle(fontSize: 13),
                            ),
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 14,
                                vertical: 10,
                              ),
                              backgroundColor: Pallete.successColor,
                              foregroundColor: Pallete.whiteColor,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Task details card
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: _cardDecoration(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: _buildDetailItem(
                                label: 'TOTAL QUANTITY',
                                value: task.taskQuantity.toString(),
                              ),
                            ),
                            Expanded(
                              child: _buildDetailItem(
                                label: 'REMAINING QUANTITY',
                                value:
                                    (task.taskQuantity -
                                            task.taskCompletedQuantity)
                                        .toString(),
                                valueColor: Pallete.accentColor,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Container(height: 1, color: Pallete.outLineColor),
                        const SizedBox(height: 16),
                        _buildDetailItem(
                          label: 'DAY RATE',
                          value: '${task.amount} \$',
                          valueColor: Pallete.successColor,
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'DESCRIPTION',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                            color: Pallete.subHeading,
                            letterSpacing: 0.3,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          task.description,
                          style: const TextStyle(
                            color: Pallete.whiteColor,
                            fontSize: 14,
                            height: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  _sectionTitle('Task History'),
                  if (task.taskUpdateHistory.isEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 28),
                      decoration: _cardDecoration(),
                      child: const Center(
                        child: Text(
                          'No update history available',
                          style: TextStyle(color: Pallete.subHeading),
                        ),
                      ),
                    )
                  else
                    Column(
                      children: task.taskUpdateHistory
                          .map((history) => _buildHistoryItem(history))
                          .toList(),
                    ),
                  const SizedBox(height: 24),

                  _sectionTitle('Update Task'),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: _cardDecoration(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Completed Quantity',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: Pallete.whiteColor,
                          ),
                        ),
                        const SizedBox(height: 10),
                        BrandedTextField(
                          height: 50,
                          controller: _quantityController,
                          labelText: "Enter completed quantity",
                          keyboardType: TextInputType.number,
                          prefix: const Icon(
                            Icons.format_list_numbered,
                            color: Pallete.subHeading,
                          ),
                          backgroundColor: Pallete.backgroundColor,
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Description',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: Pallete.whiteColor,
                          ),
                        ),
                        const SizedBox(height: 10),
                        BrandedTextField(
                          height: 50,
                          controller: _descriptionController,
                          labelText: "Enter update description",
                          prefix: const Icon(
                            Icons.description,
                            color: Pallete.subHeading,
                          ),
                          backgroundColor: Pallete.backgroundColor,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  _sectionTitle('Task Status'),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: _cardDecoration(),
                    child: Row(
                      children: [
                        Expanded(
                          child: _buildStatusButton(
                            text: 'In Progress',
                            isSelected: _selectedOption == 0,
                            onTap: () {},
                            icon: Icons.hourglass_top,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _buildStatusButton(
                            text: 'Completed',
                            isSelected: _selectedOption == 1,
                            onTap: () {},
                            icon: Icons.check_circle,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  _sectionTitle('Upload File'),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: _cardDecoration(),
                    child: Column(
                      children: [
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton.icon(
                            onPressed: _pickFile,
                            icon: const Icon(
                              Icons.attach_file,
                              color: Pallete.accentColor,
                            ),
                            label: const Text(
                              'Attach File',
                              style: TextStyle(color: Pallete.accentColor),
                            ),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              side: const BorderSide(
                                color: Pallete.accentColor,
                                width: 1.2,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                          ),
                        ),
                        if (_selectedFile != null) ...[
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Pallete.backgroundColor,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: Pallete.outLineColor),
                            ),
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.insert_drive_file,
                                  size: 22,
                                  color: Pallete.accentColor,
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    _selectedFile!.path.split('/').last,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      color: Pallete.whiteColor,
                                      fontSize: 13,
                                    ),
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(
                                    Icons.close,
                                    size: 20,
                                    color: Pallete.subHeading,
                                  ),
                                  onPressed: () =>
                                      setState(() => _selectedFile = null),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : _submitTaskUpdate,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        backgroundColor: Pallete.primaryColor,
                        foregroundColor: Pallete.whiteColor,
                        disabledBackgroundColor: Pallete.disableButtonColor,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                      ),
                      child: _isSubmitting
                          ? const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(
                                strokeWidth: 2.5,
                                color: Pallete.whiteColor,
                              ),
                            )
                          : const Text(
                              'Submit Update',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
