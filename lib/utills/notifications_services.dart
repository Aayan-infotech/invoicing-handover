import 'dart:developer';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  NotificationService._();
  static final NotificationService instance = NotificationService._();

  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  /// 🔹 Call this once from main()
  Future<void> initialize() async {
    await _requestPermission();
    await _initLocalNotification();
    await _setupFCMListeners();
  }

  // --------------------------------------------------
  // 🔔 Permission
  // --------------------------------------------------
  Future<void> _requestPermission() async {
    final settings = await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    log('Notification permission: ${settings.authorizationStatus}');
  }

  // --------------------------------------------------
  // 📱 Local Notification Init
  // --------------------------------------------------
  Future<void> _initLocalNotification() async {
    const androidSettings = AndroidInitializationSettings(
      '@mipmap/ic_launcher',
    );

    const iosSettings = DarwinInitializationSettings();

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (response) {
        log('Notification tapped: ${response.payload}');
      },
    );
  }

  // --------------------------------------------------
  // 🔥 FCM Listeners
  // --------------------------------------------------
  Future<void> _setupFCMListeners() async {
    // Foreground notification
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      _showLocalNotification(message);
    });

    // App opened from background
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      log('Opened from background: ${message.data}');
    });

    // App opened from terminated state
    final initialMessage = await FirebaseMessaging.instance.getInitialMessage();
    if (initialMessage != null) {
      log('Opened from terminated: ${initialMessage.data}');
    }
  }

  // --------------------------------------------------
  // 📢 Show Local Notification
  // --------------------------------------------------
  Future<void> _showLocalNotification(RemoteMessage message) async {
    const androidDetails = AndroidNotificationDetails(
      'high_importance_channel',
      'High Importance Notifications',
      importance: Importance.max,
      priority: Priority.high,
    );

    const notificationDetails = NotificationDetails(android: androidDetails);

    await _localNotifications.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      message.notification?.title ?? 'Notification',
      message.notification?.body ?? '',
      notificationDetails,
      payload: message.data.toString(),
    );
  }

  // --------------------------------------------------
  // 🔑 Get FCM Token
  // --------------------------------------------------
  Future<String?> getFCMToken() async {
    try {
      // 1️⃣ Request permission (iOS mandatory)
      await _firebaseMessaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      // 2️⃣ Get FCM token (Firebase handles APNs internally)
      final token = await _firebaseMessaging.getToken();

      if (token != null) {
        log('FCM Token: $token');
        return token;
      }

      log('FCM Token is null, retrying...');
      return null;
    } catch (e) {
      log('Error getting FCM token: $e');
      return null;
    }
  }

  // --------------------------------------------------
  // 🔄 Token Refresh Listener
  // --------------------------------------------------
  void onTokenRefresh(Function(String token) callback) {
    FirebaseMessaging.instance.onTokenRefresh.listen(callback);
  }
}
