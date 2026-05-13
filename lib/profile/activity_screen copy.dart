// import 'package:flutter/material.dart';
// import 'package:flutter/cupertino.dart';
// import 'package:invoice_app/network/provider/auth_provider.dart';
// import 'package:provider/provider.dart';
// import 'dart:io' show Directory, Platform;
// import 'package:invoice_app/network/models/activity_model.dart';
// import 'package:permission_handler/permission_handler.dart';
// import 'package:dio/dio.dart';
// import 'package:path_provider/path_provider.dart';
// import 'package:open_filex/open_filex.dart';

// class ActivityScreen extends StatefulWidget {
//   const ActivityScreen({Key? key}) : super(key: key);

//   @override
//   State<ActivityScreen> createState() => _ActivityScreenState();
// }

// class _ActivityScreenState extends State<ActivityScreen> {
//   final Map<String, bool> _downloadingMap = {};
//   final Map<String, double> _downloadProgress = {};

//   @override
//   void initState() {
//     super.initState();

//     WidgetsBinding.instance.addPostFrameCallback((_) {
//       _fetchActivities();
//     });
//   }

//   void _fetchActivities() async {
//     final authProvider = Provider.of<AuthProvider>(context, listen: false);
//     if (authProvider.lstActivity.isEmpty) {
//       await authProvider.getActitvity();
//     }
//   }

//   Future<void> _downloadInvoice(ActivityModel activity) async {
//     if (_downloadingMap[activity.id] == true) return;

//     setState(() {
//       _downloadingMap[activity.id] = true;
//       _downloadProgress[activity.id] = 0.0;
//     });

//     try {
//       if (Platform.isAndroid) {
//         final permissionStatus = await _requestStoragePermission();
//         if (!permissionStatus.isGranted) {
//           if (permissionStatus.isPermanentlyDenied) {
//             _showPermissionSettingsDialog();
//           }
//           throw Exception('Storage permission denied');
//         }
//       }

//       Directory targetDir = await getApplicationDocumentsDirectory();

//       final fileName = 'Invoice_${activity.invoiceNumber}.pdf';
//       final filePath = '${targetDir.path}/$fileName';

//       await Dio().download(
//         activity.invoiceUrl,
//         filePath,
//         onReceiveProgress: (received, total) {
//           if (total != -1) {
//             setState(() {
//               _downloadProgress[activity.id] = received / total;
//             });
//           }
//         },
//       );

//       // ✅ OPEN PDF AFTER DOWNLOAD
//       await OpenFilex.open(filePath);
//     } catch (e) {
//       if (mounted) {
//         ScaffoldMessenger.of(context).showSnackBar(
//           SnackBar(
//             content: Text(
//               'Download failed: ${e.toString().replaceAll('Exception: ', '')}',
//             ),
//             backgroundColor: Colors.red,
//           ),
//         );
//       }
//     } finally {
//       if (mounted) {
//         setState(() {
//           _downloadingMap[activity.id] = false;
//         });
//       }
//     }
//   }

//   Future<PermissionStatus> _requestStoragePermission() async {
//     final status = await Permission.storage.status;
//     if (status.isGranted) return status;

//     if (!status.isPermanentlyDenied) {
//       return await Permission.storage.request();
//     }
//     return status;
//   }

//   void _showPermissionSettingsDialog() {
//     showDialog(
//       context: context,
//       builder: (context) => AlertDialog(
//         title: const Text('Permission Required'),
//         content: const Text(
//           'Storage permission is required to download invoices. '
//           'Please enable it in app settings.',
//         ),
//         actions: [
//           TextButton(
//             onPressed: () => Navigator.pop(context),
//             child: const Text('Cancel'),
//           ),
//           TextButton(
//             onPressed: () {
//               openAppSettings();
//               Navigator.pop(context);
//             },
//             child: const Text('Open Settings'),
//           ),
//         ],
//       ),
//     );
//   }

//   @override
//   Widget build(BuildContext context) {
//     final authProvider = Provider.of<AuthProvider>(context);

//     return Scaffold(
//       appBar: AppBar(
//         forceMaterialTransparency: true,
//         elevation: 0,
//         centerTitle: true,
//         title: const Text(
//           'Activity',
//           style: TextStyle(
//             color: Colors.black,
//             fontSize: 22,
//             fontWeight: FontWeight.bold,
//           ),
//         ),
//         leading: _getPlatformBackButton(context),
//       ),
//       body: Column(
//         children: [
//           Padding(
//             padding: const EdgeInsets.all(20.0),
//             child: Container(
//               height: 50,
//               decoration: BoxDecoration(
//                 color: Colors.white,
//                 borderRadius: BorderRadius.circular(25),
//                 boxShadow: [
//                   BoxShadow(
//                     color: Colors.grey.withOpacity(0.2),
//                     blurRadius: 10,
//                     offset: const Offset(0, 4),
//                   ),
//                 ],
//               ),
//               child: Row(
//                 children: [
//                   const SizedBox(width: 15),
//                   const Icon(Icons.search, color: Colors.grey),
//                   const SizedBox(width: 10),
//                   const Expanded(
//                     child: Text(
//                       'Find things to do',
//                       style: TextStyle(color: Colors.grey, fontSize: 16),
//                     ),
//                   ),
//                   Container(
//                     margin: const EdgeInsets.all(5),
//                     height: 40,
//                     width: 40,
//                     decoration: BoxDecoration(
//                       gradient: const LinearGradient(
//                         colors: [Color(0xFF6A11CB), Color(0xFF2575FC)],
//                       ),
//                       shape: BoxShape.circle,
//                       border: Border.all(color: Colors.white, width: 2),
//                     ),
//                     child: const Center(
//                       child: Text(
//                         'F',
//                         style: TextStyle(
//                           color: Colors.white,
//                           fontWeight: FontWeight.bold,
//                           fontSize: 20,
//                         ),
//                       ),
//                     ),
//                   ),
//                   const SizedBox(width: 5),
//                 ],
//               ),
//             ),
//           ),
//           if (authProvider.isLoading)
//             const Expanded(
//               child: Center(child: CircularProgressIndicator()),
//             )
//           else if (authProvider.lstActivity.isEmpty)
//             const Expanded(
//               child: Center(
//                 child: Column(
//                   mainAxisAlignment: MainAxisAlignment.center,
//                   children: [
//                     Icon(Icons.list_alt, size: 60, color: Colors.grey),
//                     SizedBox(height: 20),
//                     Text(
//                       'No activities yet',
//                       style: TextStyle(fontSize: 18, color: Colors.grey),
//                     ),
//                   ],
//                 ),
//               ),
//             )
//           else
//             Expanded(
//               child: ListView.builder(
//                 padding: const EdgeInsets.only(bottom: 20),
//                 itemCount: authProvider.lstActivity.length,
//                 itemBuilder: (context, index) {
//                   final activity = authProvider.lstActivity[index];
//                   return _buildProjectItem(activity);
//                 },
//               ),
//             ),
//         ],
//       ),
//     );
//   }

//   Widget _getPlatformBackButton(BuildContext context) {
//     return Platform.isIOS
//         ? CupertinoButton(
//             padding: EdgeInsets.zero,
//             child: const Icon(CupertinoIcons.back, color: Colors.black),
//             onPressed: () => Navigator.pop(context),
//           )
//         : IconButton(
//             icon: const Icon(Icons.arrow_back, color: Colors.black),
//             onPressed: () => Navigator.pop(context),
//           );
//   }

//   Widget _buildProjectItem(ActivityModel activity) {
//     final isDownloading = _downloadingMap[activity.id] ?? false;
//     final progress = _downloadProgress[activity.id] ?? 0.0;

//     return Container(
//       margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
//       padding: const EdgeInsets.all(20),
//       decoration: BoxDecoration(
//         color: Colors.white,
//         borderRadius: BorderRadius.circular(15),
//         boxShadow: [
//           BoxShadow(
//             color: Colors.grey.withOpacity(0.1),
//             blurRadius: 10,
//             offset: const Offset(0, 4),
//           ),
//         ],
//       ),
//       child: Row(
//         children: [
//           Container(
//             width: 60,
//             height: 60,
//             decoration: BoxDecoration(
//               gradient: const LinearGradient(
//                 colors: [Color(0xFF6A11CB), Color(0xFF2575FC)],
//               ),
//               borderRadius: BorderRadius.circular(12),
//             ),
//             child: const Icon(Icons.credit_card, color: Colors.white, size: 30),
//           ),
//           const SizedBox(width: 20),
//           Expanded(
//             child: Text(
//               'Project ${activity.invoiceNumber}',
//               style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
//             ),
//           ),
//           Column(
//             crossAxisAlignment: CrossAxisAlignment.end,
//             children: [
//               Text(
//                 '\$${activity.amount.toStringAsFixed(2)}',
//                 style:
//                     const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
//               ),
//               const SizedBox(height: 10),
//               if (isDownloading)
//                 SizedBox(
//                   width: 30,
//                   height: 30,
//                   child: CircularProgressIndicator(
//                     value: progress,
//                     strokeWidth: 3,
//                   ),
//                 )
//               else
//                 GestureDetector(
//                   onTap: () => _downloadInvoice(activity),
//                   child: const Icon(Icons.download),
//                 ),
//               const SizedBox(height: 5),
//               Text(
//                 _formatDate(activity.createdAt),
//                 style: const TextStyle(fontSize: 11, color: Colors.grey),
//               ),
//             ],
//           ),
//         ],
//       ),
//     );
//   }

//   String _formatDate(DateTime date) {
//     const months = [
//       'Jan',
//       'Feb',
//       'Mar',
//       'Apr',
//       'May',
//       'Jun',
//       'Jul',
//       'Aug',
//       'Sep',
//       'Oct',
//       'Nov',
//       'Dec'
//     ];
//     final hour = date.hour > 12 ? date.hour - 12 : date.hour;
//     final period = date.hour >= 12 ? 'PM' : 'AM';
//     final minute = date.minute.toString().padLeft(2, '0');

//     return '${date.day} ${months[date.month - 1]} ${date.year} '
//         '$hour:$minute $period';
//   }
// }
