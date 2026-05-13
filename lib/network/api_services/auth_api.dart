import 'package:flutter/cupertino.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import 'dart:convert';
import 'package:http/http.dart' as http;

import '../../utills/constant.dart';
import '../../utills/shared_pref.dart';
import '../call_helpar.dart';

class AuthAPIs {
  AuthAPIs() : super();

  Future<ApiResponseWithData<Map<String, dynamic>>> login(
      String email, String password) async {
    Map<String, String> data = {
      'username': email,
      'password': password,
    };

    return await CallHelper().postWithData('auth/login', data, {});
  }

  Future<ApiResponseWithData<Map<String, dynamic>>> signUp(String email) async {
    Map<String, String> data = {
      "email": email,
    };
    return await CallHelper().postWithData('auth/register', data, {});
  }

  //
  Future<ApiResponse> refresh() async {
    return await CallHelper().post('auth/refresh-token', {});
  }

  Future<ApiResponseWithData<Map<String, dynamic>>> verifyOTP(
      String email, String otp) async {
    Map<String, String> data = {
      'email': email,
      'otp': otp,
    };
    return await CallHelper().postWithData('auth/verify-otp', data, {});
  }
   Future<ApiResponseWithData<Map<String, dynamic>>> enable2FA(
      String email, String otp) async {
    Map<String, String> data = {
      'email': email,
      'otp': otp,
    };
    return await CallHelper().postWithData('users/enable-disable-2fa', data, {});
  }


  Future<ApiResponseWithData<Map<String, dynamic>>> resendOtp(
    String email,
  ) async {
    Map<String, String> data = {
      'email': email,
    };
    return await CallHelper().postWithData('auth/resend-otp', data, {});
  }

  Future<ApiResponse> resetPassword(
      String email, String password, String confirmPassword) async {
    Map<String, String> data = {
      "email": email,
      "password": password,
      "confirm_password": confirmPassword
    };
    return await CallHelper().post(
      'auth/reset-password',
      data,
    );
  }

  Future<ApiResponse> saveDeviceInfo(String deviceName, String modelName,
      String deviceType, String deviceToken) async {
    Map<String, String> data = {
      "deviceName": deviceName,
      "modelName": modelName,
      "deviceType": deviceType, // android or iOS
      "deviceToken": deviceToken
    };
    return await CallHelper().post(
      'auth/save-device-details',
      data,
    );
  }

  Future<ApiResponse> logout() async {
    String refToken = SharedPrefUtil.getValue(refreshTokenPref, "") as String;

    Map<String, String> data = {
      'deviceToken': refToken,
    };

    var res = await CallHelper().post(
      'auth/logout',
      data,
    );
    return res;
  }

  Future<ApiResponse> forgetPassword(String email) async {
    Map<String, String> data = {
      'email': email,
    };

    return await CallHelper().post('auth/forgot-password', data);
  }

  Future<ApiResponse> changePassword(
      String oldPassword, String newPassword, String confirmNewPassword) async {
    Map<String, String> data = {
      "currentPassword": oldPassword,
      "newPassword": newPassword,
      "confirmPassword": confirmNewPassword,
    };
    return await CallHelper().post(
      'auth/change-password',
      data,
    );
  }

  Future<ApiResponseWithData> deleteAccount() async {
    var userId = SharedPrefUtil.getValue(userIdPref, "") as String;
    Map<String, dynamic> data = {"status": 0};
    return await CallHelper().putWithData(
      "update-user-status-admin/$userId/status",
      data,
      {},
    );
  }

  Future<ApiResponseWithData> getActivity() async {
    var userId = SharedPrefUtil.getValue(userIdPref, "") as String;
    Map<String, dynamic> data = {"invoiceDate": null, 'invoiceEndDate': null};
    return await CallHelper()
        .getWithData("projects/get-activity", data, queryParams: data);
  }


  Future<ApiResponseWithData<Map<String, dynamic>>>
      getSecuritySettings() async {
    Map<String, String> data = {};

    return await CallHelper().getWithData(
      'users/security-setting',
      data,
    );
  }

  Future<ApiResponseWithData<Map<String, dynamic>>> getProfile() async {
    Map<String, String> data = {};

    return await CallHelper().getWithData(
      'users/get-profile',
      data,
    );
  }

  Future<ApiResponseWithData> getUserById(String token, String id) async {
    // replace with your actual base URL
    final String url = '${CallHelper.baseUrl}api/users/getProfile/$id';

    try {
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token', // Optional: use if auth is required
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return ApiResponseWithData(data, true, message: "");
      } else {
        throw Exception('Failed to fetch user. Status: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<ApiResponseWithData<Map<String, dynamic>>>
      getSubscriptionDetails() async {
    Map<String, String> data = {};

    return await CallHelper().getWithData('users/user-subscription', data);
  }
}
