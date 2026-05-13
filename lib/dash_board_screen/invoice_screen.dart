 // import 'package:flutter/material.dart';
// import 'package:invoice_app/utills/branded_text_filed.dart';

// class InvoiceScreen extends StatefulWidget {
//   const InvoiceScreen({super.key});

//   @override
//   State<InvoiceScreen> createState() => _InvoiceScreenState();
// }

// class _InvoiceScreenState extends State<InvoiceScreen> {
//   String selectedTab = 'All';

//   final List<Map<String, dynamic>> projects = [
//     {'name': 'Project Name 1'},
//     {'name': 'Project Name 2'},
//     {'name': 'Project Name 3'},
//     {'name': 'Project Name n'},
//   ];
//   TextEditingController _searchController = TextEditingController();

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
      
//       body: SafeArea(
//         child: Column(
//           children: [
//             // App bar
//             const Padding(
//               padding:
//                   EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
//               child: Row(
//                 children: [
//                   Expanded(
//                     child: Center(
//                       child: Text(
//                         'Invoice',
//                         style: TextStyle(
//                           fontSize: 22,
//                           fontWeight: FontWeight.bold,
//                         ),
//                       ),
//                     ),
//                   ),
//                   SizedBox(width: 40), // Balance the layout
//                 ],
//               ),
//             ),

//             // Search bar
//             // Padding(
//             //   padding: const EdgeInsets.all(16.0),
//             //   child: Container(
//             //     decoration: BoxDecoration(
//             //       color: Colors.white,
//             //       borderRadius: BorderRadius.circular(30),
//             //     ),
//             //     child: TextField(
//             //       decoration: InputDecoration(
//             //         hintText: 'Find things to do',
//             //         hintStyle: TextStyle(color: Colors.grey[400]),
//             //         prefixIcon: Icon(Icons.search, color: Colors.grey[400]),
//             //         border: InputBorder.none,
//             //         contentPadding: const EdgeInsets.symmetric(vertical: 15),
//             //       ),
//             //     ),
//             //   ),
//             // ),
//             Padding(
//               padding: const EdgeInsets.symmetric(horizontal: 16),
//               child: BrandedTextField(
//                 controller: _searchController,
//                 labelText: 'Search',
//                 prefix: Icon(Icons.search),
//               ),
//             ),

//             // Filter tabs
//             Padding(
//               padding:
//                   const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
//               child: Container(
//                 decoration: BoxDecoration(
//                   border: Border.all(color: Colors.grey.shade300),
//                   borderRadius: BorderRadius.circular(30),
//                 ),
//                 child: Row(
//                   children: [
//                     _buildTab('All'),
//                     _buildTab('Paid'),
//                     _buildTab('Draft'),
//                     _buildTab('Unpaid'),
//                   ],
//                 ),
//               ),
//             ),

//             // Project list
//             Expanded(
//               child: ListView.builder(
//                 padding: const EdgeInsets.only(top: 10),
//                 itemCount: projects.length,
//                 itemBuilder: (context, index) {
//                   return _buildProjectItem(projects[index]['name']);
//                 },
//               ),
//             ),

//             // Bottom navigation
//           ],
//         ),
//       ),
//     );
//   }

//   Widget _buildTab(String title) {
//     final isSelected = selectedTab == title;

//     return Expanded(
//       child: GestureDetector(
//         onTap: () {
//           setState(() {
//             selectedTab = title;
//           });
//         },
//         child: Container(
//           padding: const EdgeInsets.symmetric(vertical: 12),
//           decoration: BoxDecoration(
//             color: isSelected ? Colors.blue : Colors.transparent,
//             borderRadius: BorderRadius.circular(30),
//           ),
//           child: Center(
//             child: Text(
//               title,
//               style: TextStyle(
//                 color: isSelected ? Colors.white : Colors.black,
//                 fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
//               ),
//             ),
//           ),
//         ),
//       ),
//     );
//   }

//   Widget _buildProjectItem(String projectName) {
//     return Container(
//       margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
//       padding: const EdgeInsets.all(16),
//       decoration: BoxDecoration(
//         color: Colors.white,
//         borderRadius: BorderRadius.circular(16),
//       ),
//       child: Row(
//         children: [
//           // Avatar circle with 'A'
//           Container(
//             width: 40,
//             height: 40,
//             decoration: const BoxDecoration(
//               color: Colors.blue,
//               shape: BoxShape.circle,
//             ),
//             child: const Center(
//               child: Text(
//                 'A',
//                 style: TextStyle(
//                   color: Colors.white,
//                   fontWeight: FontWeight.bold,
//                   fontSize: 18,
//                 ),
//               ),
//             ),
//           ),
//           const SizedBox(width: 16),
//           // Project name
//           Expanded(
//             child: Text(
//               projectName,
//               style: const TextStyle(
//                 fontSize: 18,
//                 fontWeight: FontWeight.bold,
//               ),
//             ),
//           ),
//           // Invoice button
//           ElevatedButton.icon(
//             onPressed: () {},
//             style: ElevatedButton.styleFrom(
//               backgroundColor: Colors.blue,
//               foregroundColor: Colors.white,
//               padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
//               shape: const RoundedRectangleBorder(
//                 borderRadius: BorderRadius.only(
//                   topLeft: Radius.circular(30),
//                   bottomLeft: Radius.circular(30),
//                   topRight: Radius.circular(0),
//                   bottomRight: Radius.circular(0),
//                 ),
//               ),
//             ),
//             icon: const Icon(Icons.download, size: 18),
//             label: const Text('Invoice'),
//           ),
//         ],
//       ),
//     );
//   }

//   Widget _buildNavItem(IconData icon, {required bool isActive}) {
//     return Icon(
//       icon,
//       color: isActive ? Colors.blue : Colors.grey,
//       size: 28,
//     );
//   }
// }
