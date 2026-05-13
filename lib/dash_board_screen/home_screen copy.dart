import 'package:flutter/material.dart';
import 'package:invoice_app/dash_board_screen/clock_out_screen.dart';
import 'package:invoice_app/dash_board_screen/home_invoice.dart';
import 'package:invoice_app/dash_board_screen/project_screen.dart';
import 'package:invoice_app/utills/branded_primary_button.dart';
import 'package:invoice_app/utills/branded_text_filed.dart';

class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    TextEditingController _searchController = TextEditingController();
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.white,
              Color(0xFFF5F9FF),
            ],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Section
                _buildHeader(_searchController),
                SizedBox(height: 32),

                // Time Tracking Card
                _buildTimeTrackerCard(context),
                SizedBox(height: 32),

                // Divider with decorative element
                _buildDivider(),
                SizedBox(height: 32),

                // Quick Actions Section
                _buildQuickActions(context),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(TextEditingController _searchController) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Good Morning',
                    style: TextStyle(fontSize: 18, color: Colors.grey[600])),
                SizedBox(height: 4),
                Text('John Doe',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    )),
              ],
            ),
            Spacer(),
            Container(
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(12),
              ),
              child: IconButton(
                icon: Icon(Icons.notifications_none, color: Colors.blue[700]),
                onPressed: () {},
              ),
            ),
          ],
        ),
        SizedBox(height: 24),
        BrandedTextField(
          controller: _searchController,
          labelText: "Search projects, invoices...",
          isFilled: true,
          prefix: Icon(Icons.search, color: Colors.grey),
        ),
      ],
    );
  }

  Widget _buildTimeTrackerCard(BuildContext context) {
    return Container(
        padding: EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.blue.withOpacity(0.05),
              blurRadius: 20,
              offset: Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('WORK TIME',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Colors.grey[600],
                  letterSpacing: 1.2,
                )),
            SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Start Work",
                      style: TextStyle(
                          fontWeight: FontWeight.w500, color: Colors.grey[700]),
                    ),
                    SizedBox(height: 4),
                    Text(
                      "21/03/2025",
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                          color: Colors.black87),
                    )
                  ],
                ),
                SizedBox(width: 16),
                Stack(
                  alignment: Alignment.center,
                  children: [
                    SizedBox(
                      width: 80,
                      height: 80,
                      child: CircularProgressIndicator(
                        value: 0,
                        strokeWidth: 8,
                        backgroundColor: Colors.grey[200],
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.blue),
                      ),
                    ),
                    Text(
                      "0H/8H",
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: Colors.blue),
                    ),
                  ],
                ),
              ],
            ),
            SizedBox(height: 24),
            BrandedPrimaryButton(
              name: "Clock in",
              onPressed: () {
                Navigator.push(context,
                    MaterialPageRoute(builder: (context) => CheckInScreen()));
              },
              isEnabled: true,
              suffixIcon: Icon(Icons.arrow_forward, color: Colors.white),
            ),
          ],
        ));
  }

  Widget _buildDivider() {
    return Row(
      children: [
        Expanded(
          child: Divider(
            color: Colors.grey[300],
            thickness: 1,
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            "Quick Actions",
            style: TextStyle(
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Expanded(
          child: Divider(
            color: Colors.grey[300],
            thickness: 1,
          ),
        ),
      ],
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Column(
      children: [
        _buildActionButton(
          context: context,
          title: "Projects",
          icon: Icons.folder_copy_outlined,
          color: Colors.blue[700],
          onPressed: () {
            Navigator.push(context,
                MaterialPageRoute(builder: (context) => ProjectScreen()));
          },
        ),
        SizedBox(height: 20),
        _buildActionButton(
          context: context,
          title: "Invoices",
          icon: Icons.receipt_long_outlined,
          color: Colors.green[700],
          onPressed: () {
            Navigator.push(context,
                MaterialPageRoute(builder: (context) => HomeInvoiceScreen()));
          },
        ),
        SizedBox(height: 20),
        // _buildActionButton(
        //   context: context,
        //   title: "Time Tracking",
        //   icon: Icons.access_time_outlined,
        //   color: Colors.orange[700],
        //   onPressed: () {},
        // ),
      ],
    );
  }

  Widget _buildActionButton({
    required BuildContext context,
    required String title,
    required IconData icon,
    required Color? color,
    required VoidCallback onPressed,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 20,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: ListTile(
        onTap: onPressed,
        leading: Container(
          padding: EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color!.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 28),
        ),
        title: Text(
          title,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: Colors.black87,
          ),
        ),
        trailing: Container(
          padding: EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: Colors.grey[100],
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.arrow_forward, color: Colors.grey[600]),
        ),
      ),
    );
  }
}
