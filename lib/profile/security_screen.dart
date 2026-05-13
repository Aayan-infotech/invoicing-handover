import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:invoice_app/network/call_helpar.dart';
import 'package:invoice_app/network/provider/auth_provider.dart';
import 'package:invoice_app/utills/app_colors.dart';
import 'package:invoice_app/utills/constant.dart';
import 'package:invoice_app/utills/device_info.dart';
import 'package:invoice_app/utills/shared_pref.dart';
import 'package:provider/provider.dart';
import 'dart:io' show Platform;
import 'package:invoice_app/network/models/user_model.dart';
import 'package:http/http.dart' as http;

class SecuritySettingsScreen extends StatefulWidget {
  const SecuritySettingsScreen({Key? key}) : super(key: key);

  @override
  _SecuritySettingsScreenState createState() => _SecuritySettingsScreenState();
}

class _SecuritySettingsScreenState extends State<SecuritySettingsScreen> {
  bool _emailEnabled = false; // Local state for email toggle
  late List<DeviceInfo> _devices; // Stores device list from API
  late bool _otpEnabled;

  // Stores 2FA state from API
  bool _isUpdating = false; // Track API call state

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadSecuritySettings();
    });

    _devices = []; // Initialize empty device list
    _otpEnabled = false; // Default OTP state
  }

  Future<void> _loadSecuritySettings() async {
    final provider = Provider.of<AuthProvider>(context, listen: false);
    await provider.getSecuritySettings();

    if (mounted) {
      setState(() {
        _otpEnabled = provider.deviceResponse.is2FAEnabled;
        _devices = provider.deviceResponse.deviceDetails;
      });
    }
  }

  Future<void> _update2FA(bool value) async {
    if (_isUpdating) return; // Prevent multiple simultaneous requests

    setState(() {
      _isUpdating = true;
      _otpEnabled = value; // Optimistic UI update
    });

    String accessToken = SharedPrefUtil.getValue(accessTokenPref, "") as String;

    try {
      final response = await http.post(
        Uri.parse('${CallHelper.baseUrl}users/enable-disable-2fa'),
        headers: {
          'Authorization': 'Bearer $accessToken',
          'Content-Type': 'application/json',
        },
        body: json.encode({'status': value ? 'enable' : 'disable'}),
      );

      final responseData = json.decode(response.body);

      if (response.statusCode == 200 && responseData['success'] == true) {
        // Success - refresh settings from server
        await _loadSecuritySettings();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(responseData['message']),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        // API returned error - revert UI state
        setState(() => _otpEnabled = !value);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(responseData['message'] ?? 'Failed to update 2FA'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      // Network error - revert UI state
      setState(() => _otpEnabled = !value);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Network error: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() => _isUpdating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Pallete.backgroundColor,
      appBar: AppBar(
        forceMaterialTransparency: true,
        elevation: 0,
        title: const Text(
          'Security Setting',
          style: TextStyle(
            color: Pallete.whiteColor,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        leading: _buildPlatformBackButton(context),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 30),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Enable authentication',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Pallete.whiteColor,
                    ),
                  ),
                  const SizedBox(height: 20),
                  _buildToggleItem('Authenticate via otp', _otpEnabled,
                      (value) {
                    _update2FA(value);
                  }),
                  const SizedBox(height: 5),
                  // _buildToggleItem('Authenticate via email', _emailEnabled,
                  //     (value) {
                  //   setState(() => _emailEnabled = value);
                  // }),
                ],
              ),
            ),
            const SizedBox(height: 30),
            const Divider(
              height: 1,
              thickness: 1,
              color: Pallete.outLineColor,
            ),
            const SizedBox(height: 30),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Active Sessions',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Pallete.whiteColor,
                    ),
                  ),
                  const SizedBox(height: 20),
                  ..._buildDeviceList(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildDeviceList() {
    if (_devices.isEmpty) {
      return [
        const Center(child: CircularProgressIndicator()),
      ];
    }

    return _devices.map((device) {
      final loginTime = device.updatedAt;
      final timeString =
          '${loginTime.hour}:${loginTime.minute.toString().padLeft(2, '0')}';

      return _buildDeviceItem(
        device.deviceName,
        timeString,
        isActive: device.isLoggedIn,
      );
    }).toList();
  }

  Widget _buildPlatformBackButton(BuildContext context) {
    if (Platform.isIOS) {
      return CupertinoButton(
        padding: EdgeInsets.zero,
        child: const Icon(
          CupertinoIcons.back,
          color: Pallete.whiteColor,
        ),
        onPressed: () => Navigator.of(context).pop(),
      );
    } else {
      return IconButton(
        icon: const Icon(
          Icons.arrow_back,
          color: Pallete.whiteColor,
        ),
        onPressed: () => Navigator.of(context).pop(),
      );
    }
  }

  Widget _buildToggleItem(String title, bool value, Function(bool) onChanged) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
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
          Switch.adaptive(
            value: value,
            onChanged: onChanged,
            activeColor: Pallete.whiteColor,
            activeTrackColor: Pallete.primaryColor,
          ),
        ],
      ),
    );
  }

  Widget _buildDeviceItem(String deviceName, String time,
      {bool isActive = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: RichText(
              text: TextSpan(
                style: const TextStyle(fontSize: 16, color: Pallete.whiteColor),
                children: [
                  TextSpan(
                    text: '$deviceName ',
                    style: const TextStyle(
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  TextSpan(
                    text: '( log in at $time )',
                    style: const TextStyle(
                      color: Pallete.subHeading,
                      fontWeight: FontWeight.normal,
                    ),
                  ),
                ],
              ),
            ),
          ),
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: isActive ? Pallete.successColor : Pallete.outLineColor,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.check,
              color: Pallete.whiteColor,
              size: 18,
            ),
          ),
        ],
      ),
    );
  }
}
