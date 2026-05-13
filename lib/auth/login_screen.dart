import 'dart:io';

import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/material.dart';
import 'package:invoice_app/auth/forgot_password_screen.dart';
import 'package:invoice_app/auth/otp_screen.dart';
import 'package:invoice_app/auth/register_screen.dart';
import 'package:invoice_app/dash_board_screen/dashboard_screen.dart';
import 'package:invoice_app/network/provider/auth_provider.dart';
import 'package:invoice_app/utills/app_colors.dart';
import 'package:invoice_app/utills/branded_text_filed.dart';
import 'package:invoice_app/utills/constant.dart';
import 'package:invoice_app/utills/notifications_services.dart';
import 'package:invoice_app/utills/shared_pref.dart';
import 'package:provider/provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController userIdController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  bool _isLoading = false;
  Future<void> _saveDeviceInfo(AuthProvider authProvider) async {
    try {
      final DeviceInfoPlugin deviceInfo = DeviceInfoPlugin();
      // final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

      String deviceName = 'Unknown';
      String modelName = 'Unknown';
      String deviceType = Platform.isAndroid
          ? 'android'
          : Platform.isIOS
          ? 'ios'
          : 'other';
      String? deviceToken;

      try {
        deviceToken = await NotificationService.instance.getFCMToken();
      } catch (e) {
        print("Error getting FCM token: $e");
      }

      if (Platform.isAndroid) {
        AndroidDeviceInfo androidInfo = await deviceInfo.androidInfo;
        deviceName = androidInfo.model;
        modelName = androidInfo.model;
      } else if (Platform.isIOS) {
        IosDeviceInfo iosInfo = await deviceInfo.iosInfo;
        deviceName = iosInfo.name;
        modelName = iosInfo.model;
      }

      var responce = await authProvider.saveDeviceInfo(
        deviceName,
        modelName,
        deviceType,
        deviceToken ?? 'no-token',
      );
      if (responce.success) {
        print(responce);
      }
    } catch (e) {
      print("Error saving device info: $e");
    }
  }

  void _login(BuildContext context) async {
    final email = userIdController.text.trim();
    final password = passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter email and password')),
      );
      return;
    }

    setState(() => _isLoading = true);

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final response = await authProvider.login(email, password);

    if (response.success) {
      var data = response.data['data'];
      SharedPrefUtil.setValue(accessTokenPref, data['accessToken']);
      SharedPrefUtil.setValue(isLoginPref, true);
      SharedPrefUtil.setValue(refreshTokenPref, data['refreshToken']);
      if (data['user']['is2FAEnabled']) {
        String email = data['user']['email'];
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) {
              return OtpVerificationScreen(email: email, is2FA: true);
            },
          ),
        );
      } else {
        Navigator.of(
          context,
        ).pushReplacement(MaterialPageRoute(builder: (_) => BottomNavScreen()));
      }
      // Navigate immediately after login success

      // Save device info AFTER navigation (non-blocking)
      _saveDeviceInfo(authProvider);
    } else {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(response.message)));
    }

    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Pallete.backgroundColor,
      appBar: AppBar(forceMaterialTransparency: true),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Image.asset(
                      "assets/images/logoIPA.png",
                      height: MediaQuery.of(context).size.height * 0.2,
                      width: MediaQuery.of(context).size.width * 0.6,
                    ), // Replace with actual logo
                    const SizedBox(height: 40),
                    const Text(
                      'Welcome Back',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w500,
                        color: Pallete.whiteColor,
                      ),

                      ///
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'View assigned tasks, update their status, and keep invoices moving smoothly.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 12, color: Pallete.subHeading),
                    ),

                    const SizedBox(height: 40),
                    BrandedTextField(
                      controller: userIdController,
                      labelText: 'Enter user Id',
                      isFilled: true,
                      backgroundColor: Pallete.secondaryBackgroundColor,
                    ),
                    const SizedBox(height: 20),
                    BrandedTextField(
                      controller: passwordController,
                      keyboardType: TextInputType.visiblePassword,
                      labelText: 'Enter Password',
                      isFilled: true,
                      backgroundColor: Pallete.secondaryBackgroundColor,
                    ),
                    const SizedBox(height: 8),
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) {
                                return ForgotPasswordScreen();
                              },
                            ),
                          );
                        },
                        child: const Text(
                          'Forgot Password',
                          style: TextStyle(color: Pallete.subHeading),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 24.0,
                vertical: 12,
              ),
              child: Column(
                children: [
                  ElevatedButton(
                    onPressed: _isLoading ? null : () => _login(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Pallete.primaryColor,
                      foregroundColor: Pallete.whiteColor,
                      minimumSize: const Size.fromHeight(56),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: _isLoading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text(
                            'Login',
                            style: TextStyle(fontSize: 16, color: Colors.white),
                          ),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const SignUpScreem()),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Pallete.accentColor),
                      minimumSize: const Size.fromHeight(56),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'Register',
                      style: TextStyle(
                        fontSize: 16,
                        color: Pallete.accentColor,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
