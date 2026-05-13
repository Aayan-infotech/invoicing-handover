import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:invoice_app/utills/app_colors.dart';
import 'dart:io' show Platform;

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({Key? key}) : super(key: key);

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  Map<String, bool> toggleStates = {
    'General Notification': true,
    'Sound': false,
    'Vibrate': true,
    'App updates': false,
    'Bill Reminder': true,
    'Promotion': true,
    'Discount Available': false,
    'Payment Request': false,
    'New Service Available': false,
    'New Tips Available': true,
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Pallete.backgroundColor,
      appBar: AppBar(
        backgroundColor: Pallete.backgroundColor,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          'Notifications',
          style: TextStyle(
            color: Pallete.whiteColor,
            fontSize: 22,
            fontWeight: FontWeight.bold,
          ),
        ),
        leading: _getPlatformBackButton(),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionHeader('Common'),
            _buildToggleItem('General Notification'),
            _buildToggleItem('Sound'),
            _buildToggleItem('Vibrate'),
            Divider(height: 1, thickness: 1, color: Pallete.outLineColor),
            _buildSectionHeader('System & services update'),
            _buildToggleItem('App updates'),
            _buildToggleItem('Bill Reminder'),
            _buildToggleItem('Promotion'),
            _buildToggleItem('Discount Available'),
            _buildToggleItem('Payment Request'),
            Divider(height: 1, thickness: 1, color: Pallete.outLineColor),
            _buildSectionHeader('Others'),
            _buildToggleItem('New Service Available'),
            _buildToggleItem('New Tips Available'),
          ],
        ),
      ),
    );
  }

  Widget _getPlatformBackButton() {
    if (Platform.isIOS) {
      return CupertinoButton(
        padding: EdgeInsets.zero,
        child: const Icon(
          CupertinoIcons.back,
          color: Pallete.whiteColor,
        ),
        onPressed: () {},
      );
    } else {
      return IconButton(
        icon: const Icon(
          Icons.arrow_back,
          color: Pallete.whiteColor,
        ),
        onPressed: () {},
      );
    }
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: Pallete.whiteColor,
        ),
      ),
    );
  }

  Widget _buildToggleItem(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              color: Pallete.whiteColor,
            ),
          ),
          Switch(
            value: toggleStates[title]!,
            onChanged: (value) {
              setState(() {
                toggleStates[title] = value;
              });
            },
            activeTrackColor: Pallete.primaryColor,
            activeColor: Pallete.whiteColor,
            inactiveTrackColor: Pallete.outLineColor,
            inactiveThumbColor: Pallete.subHeading,
          ),
        ],
      ),
    );
  }
}
