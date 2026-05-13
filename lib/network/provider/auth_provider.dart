import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:invoice_app/network/api_services/auth_api.dart';
import 'package:invoice_app/network/call_helpar.dart';
import 'package:invoice_app/network/models/activity_model.dart';
import 'package:invoice_app/network/models/user_model.dart';
import 'package:invoice_app/utills/clock_model.dart';
import 'package:invoice_app/utills/constant.dart';
import 'package:invoice_app/utills/device_info.dart';
import 'package:http/http.dart' as http;
import 'package:invoice_app/utills/shared_pref.dart';

class AuthProvider extends ChangeNotifier {
  final AuthAPIs _authAPIs = AuthAPIs();

  bool _isLoading = false;
  bool get isLoading => _isLoading;
  List<ActivityModel> lstActivity = [];
  UserModel userModel = UserModel(
    userId: '',
    username: 'Jhon',
    name: "Jhon",
    email: 'jhon',
    mobile: '',
    address: '',
    profileImage: '',
    is2FAEnabled: false,
  );
  SecuritySettings deviceResponse = SecuritySettings(
    is2FAEnabled: false,
    deviceDetails: [],
  );

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  // Login
  Future<ApiResponseWithData<Map<String, dynamic>>> login(
    String email,
    String password,
  ) async {
    // _setLoading(true);
    final result = await _authAPIs.login(email, password);
    // _setLoading(false);
    return result;
  }

  // Signup
  Future<ApiResponseWithData<Map<String, dynamic>>> signUp(String email) async {
    _setLoading(true);
    final result = await _authAPIs.signUp(email);
    _setLoading(false);
    return result;
  }

  // Verify OTP
  Future<ApiResponseWithData<Map<String, dynamic>>> verifyOTP(
    String email,
    String otp,
  ) async {
    _setLoading(true);
    final result = await _authAPIs.verifyOTP(email, otp);
    _setLoading(false);
    return result;
  }

  // Resend OTP
  Future<ApiResponseWithData<Map<String, dynamic>>> resendOtp(
    String email,
  ) async {
    _setLoading(true);
    final result = await _authAPIs.resendOtp(email);
    _setLoading(false);
    return result;
  }

  // Set Password
  Future<ApiResponse> resetPassword(
    String email,
    String password,
    String confirmPassword,
  ) async {
    _setLoading(true);
    final response = await _authAPIs.resetPassword(
      email,
      password,
      confirmPassword,
    );
    _setLoading(false);
    return response;
  }

  // Set Password
  Future<ApiResponseWithData> getProfile() async {
    _setLoading(true);
    final response = await _authAPIs.getProfile();
    if (response.success) {
      userModel = UserModel.fromJson(response.data['data']);
    }
    _setLoading(false);
    return await response;
  }

  Future<ApiResponseWithData> getActitvity() async {
    _setLoading(true);
    final response = await _authAPIs.getActivity();
    if (response.success) {
      lstActivity = response.data['data'] != null
          ? (response.data['data']['activities'] as List)
                .map((item) => ActivityModel.fromJson(item))
                .toList()
          : [];
    }
    _setLoading(false);
    return await response;
  }

  Future<void> update2FAStatus(bool enable) async {
    try {
      String accessToken =
          SharedPrefUtil.getValue(accessTokenPref, "") as String;

      final response = await http.post(
        Uri.parse('${CallHelper.baseUrl}/users/enable-disable-2fa'),
        headers: {
          'Authorization': 'Bearer $accessToken',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'status': enable ? 'enable' : 'disable'}),
      );

      if (response.statusCode == 200) {
        // Update local state after successful API call
        // deviceResponse. = enable;
        notifyListeners();
      } else {
        throw Exception('Failed to update 2FA status: ${response.body}');
      }
    } catch (e) {
      throw Exception('2FA update error: $e');
    }
  }

  Future<ApiResponseWithData> getSecuritySettings() async {
    _setLoading(true);
    final response = await _authAPIs.getSecuritySettings();
    if (response.success) {
      deviceResponse = SecuritySettings.fromJson(response.data['data']);
    }
    _setLoading(false);
    return await response;
  }

  // Forgot Password
  Future<ApiResponse> forgetPassword(String email) async {
    return await _authAPIs.forgetPassword(email);
  }

  // Forgot Password
  Future<ApiResponse> saveDeviceInfo(
    String deviceName,
    String modelName,
    String deviceType,
    String deviceToken,
  ) async {
    return await _authAPIs.saveDeviceInfo(
      deviceName,
      modelName,
      deviceType,
      deviceToken,
    );
  }

  // Change Password
  Future<ApiResponse> changePassword(
    String email,
    String password,
    String confirmPassword,
  ) async {
    _setLoading(true);
    final response = await _authAPIs.changePassword(
      email,
      password,
      confirmPassword,
    );
    _setLoading(false);
    return response;
  }

  // Refresh Token
  Future<ApiResponse> refresh() async {
    return await _authAPIs.refresh();
  }

  // Logout
  Future<ApiResponse> logout() async {
    return await _authAPIs.logout();
  }
}
