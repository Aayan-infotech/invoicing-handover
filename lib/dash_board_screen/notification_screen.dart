import 'package:flutter/material.dart';
import 'package:invoice_app/network/models/notification_model.dart';
import 'package:invoice_app/network/provider/project_provider.dart';
import 'package:invoice_app/utills/app_colors.dart';
import 'package:provider/provider.dart';

class NotificationsScreen extends StatefulWidget {
  bool isBackButton;
  NotificationsScreen({this.isBackButton = false, super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  String selectedTab = 'All';

  final List<String> notifications = [
    'Forem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
    'Forem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Torem ipsum dolor sit amet, consectetur adipiscing elit con sectetur adipiscing elit.',
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      asyncInit();
    });
  }

  asyncInit() async {
    await Provider.of<ProjectProvider>(
      context,
      listen: false,
    ).getNotification();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Pallete.backgroundColor,
      appBar: AppBar(
        automaticallyImplyLeading: widget.isBackButton,
        forceMaterialTransparency: true,
        title: const Center(
          child: Text(
            'Notifications',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Pallete.whiteColor,
            ),
          ),
        ),
      ),
      body: Consumer<ProjectProvider>(
        builder: (context, provider, _) {
          return provider.isLoading
              ? Center(child: CircularProgressIndicator())
              : SafeArea(
                  child: provider.notifications.isEmpty
                      ? _buildEmptyState()
                      : Column(
                          children: [
                            // App bar
                            const SizedBox(height: 20),

                            // // Filter tabs
                            // Padding(
                            //   padding: const EdgeInsets.symmetric(horizontal: 16.0),
                            //   child: Container(
                            //     decoration: BoxDecoration(
                            //       border: Border.all(color: Colors.grey.shade300),
                            //       borderRadius: BorderRadius.circular(30),
                            //     ),
                            //     child: Row(
                            //       children: [
                            //         _buildTab('All'),
                            //         _buildTab('Week'),
                            //         _buildTab('Month'),
                            //       ],
                            //     ),
                            //   ),
                            // ),

                            // const SizedBox(height: 20),

                            // Notifications list
                            Expanded(
                              child: ListView.builder(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                ),
                                itemCount: provider.notifications.length,
                                itemBuilder: (context, index) {
                                  return _buildNotificationItem(
                                    provider.notifications[index],
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

  Widget _buildTab(String title) {
    final isSelected = selectedTab == title;

    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            selectedTab = title;
          });
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? Colors.blue : Colors.transparent,
            borderRadius: BorderRadius.circular(30),
          ),
          child: Center(
            child: Text(
              title,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.black,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Icon container
            Container(
              height: 90,
              width: 90,
              decoration: BoxDecoration(
                color: Pallete.accentColor.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.notifications_off_rounded,
                size: 42,
                color: Pallete.accentColor,
              ),
            ),

            const SizedBox(height: 20),

            const Text(
              'No Notifications',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: Pallete.whiteColor,
              ),
            ),

            const SizedBox(height: 8),

            const Text(
              'You’re all caught up!\nWe’ll notify you when something arrives.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: Pallete.subHeading,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationItem(NotificationModel notification) {
    final bool isUnread = !notification.isRead;

    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () {
        // handle notification click
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isUnread
              ? Pallete.primaryColor.withOpacity(0.15)
              : Pallete.secondaryBackgroundColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Pallete.outLineColor),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon
            Container(
              height: 40,
              width: 40,
              decoration: BoxDecoration(
                color: isUnread ? Pallete.primaryColor : Pallete.outLineColor,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.notifications,
                size: 20,
                color: isUnread ? Pallete.whiteColor : Pallete.subHeading,
              ),
            ),

            const SizedBox(width: 12),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title
                  Text(
                    notification.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: isUnread ? FontWeight.w600 : FontWeight.w500,
                      color: Pallete.whiteColor,
                    ),
                  ),

                  const SizedBox(height: 6),

                  // Body
                  Text(
                    notification.body,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      color: Pallete.subHeading,
                    ),
                  ),

                  const SizedBox(height: 8),

                  // Time
                  Text(
                    "Just now",
                    style: TextStyle(
                      fontSize: 11,
                      color: Pallete.subHeading.withOpacity(0.7),
                    ),
                  ),
                ],
              ),
            ),

            if (isUnread)
              Container(
                margin: const EdgeInsets.only(left: 8, top: 4),
                height: 8,
                width: 8,
                decoration: const BoxDecoration(
                  color: Colors.blue,
                  shape: BoxShape.circle,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
