import 'dart:async';
import 'dart:convert';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:invoice_app/auth/login_screen.dart';
import 'package:invoice_app/main.dart';
import 'package:invoice_app/utills/shared_pref.dart';

import '../utills/constant.dart';

class ApiResponse {
  final String message;
  final bool success;

  ApiResponse(this.message, this.success);
}

class ApiResponseWithData<T> {
  final T data;
  final bool success;
  final String message;

  ApiResponseWithData(this.data, this.success, {this.message = "none"});
}

class CallHelper {
  static const String baseUrl =
      "http://3.82.253.20:3333/api/"; //"http://18.209.91.97:3333/api/";
  static const int timeoutInSeconds = 20;
  static const String internalServerErrorMessage = "Internal server error.";
  static bool _isRefreshing = false;
  static Completer<void>? _refreshCompleter;

  Future<Map<String, String>> getHeaders() async {
    String accessToken = SharedPrefUtil.getValue(accessTokenPref, "") as String;
    return {
      'Authorization': 'Bearer $accessToken',
      'Content-Type': 'application/json',
    };
  }

  Future<ApiResponse> get(
    String urlSuffix, {
    Map<String, dynamic>? queryParams,
  }) async {
    return _performRequest(() async {
      Uri uri = Uri.parse(
        '$baseUrl$urlSuffix',
      ).replace(queryParameters: queryParams);
      final response = await http
          .get(uri, headers: await getHeaders())
          .timeout(const Duration(seconds: timeoutInSeconds));
      return await _processResponse(
        response,
        () => get(urlSuffix, queryParams: queryParams),
      );
    });
  }

  Future<ApiResponseWithData<T>> getWithData<T>(
    String urlSuffix,
    T defaultData, {
    Map<String, dynamic>? queryParams,
  }) async {
    return _performRequest(() async {
      Uri uri = Uri.parse(
        '$baseUrl$urlSuffix',
      ).replace(queryParameters: queryParams);
      var headder = await getHeaders();
      debugPrint("URL => $uri and HEADER => ${headder}");
      final response = await http
          .get(uri, headers: await getHeaders())
          .timeout(const Duration(seconds: timeoutInSeconds));
      return await _processResponseWithData(
        response,
        defaultData,
        () => getWithData(urlSuffix, defaultData, queryParams: queryParams),
      );
    });
  }

  Future<ApiResponse> delete(
    String urlSuffix, {
    Map<String, dynamic>? queryParams,
  }) async {
    return _performRequest(() async {
      Uri uri = Uri.parse(
        '$baseUrl$urlSuffix',
      ).replace(queryParameters: queryParams);
      final response = await http
          .delete(uri, headers: await getHeaders())
          .timeout(const Duration(seconds: timeoutInSeconds));
      return await _processResponse(
        response,
        () => delete(urlSuffix, queryParams: queryParams),
      );
    });
  }

  Future<ApiResponse> post(String urlSuffix, Map<String, dynamic> body) async {
    return _performRequest(() async {
      final response = await http
          .post(
            Uri.parse('$baseUrl$urlSuffix'),
            headers: await getHeaders(),
            body: jsonEncode(body),
          )
          .timeout(const Duration(seconds: timeoutInSeconds));
      return await _processResponse(response, () => post(urlSuffix, body));
    });
  }

  Future<ApiResponseWithData<T>> postWithData<T>(
    String urlSuffix,
    Map<String, dynamic> body,
    T defaultData,
  ) async {
    return _performRequest(() async {
      final response = await http
          .post(
            Uri.parse('$baseUrl$urlSuffix'),
            headers: await getHeaders(),
            body: jsonEncode(body),
          )
          .timeout(const Duration(seconds: timeoutInSeconds));
      return await _processResponseWithData(
        response,
        defaultData,
        () => postWithData(urlSuffix, body, defaultData),
      );
    });
  }

  Future<ApiResponseWithData<T>> putWithData<T>(
    String urlSuffix,
    Map<String, dynamic> body,
    T defaultData,
  ) async {
    return _performRequest(() async {
      Uri uri = Uri.parse('$baseUrl$urlSuffix');
      var headder = await getHeaders();
      debugPrint("URL => $uri and HEADER => ${headder}");
      final response = await http
          .put(
            Uri.parse('$baseUrl$urlSuffix'),
            headers: await getHeaders(),
            body: jsonEncode(body),
          )
          .timeout(const Duration(seconds: timeoutInSeconds));
      return await _processResponseWithData(
        response,
        defaultData,
        () => putWithData(urlSuffix, body, defaultData),
      );
    });
  }

  Future<ApiResponse> deleteWithBody(
    String urlSuffix,
    Map<String, dynamic> body,
  ) async {
    return _performRequest(() async {
      Uri uri = Uri.parse('$baseUrl$urlSuffix');
      final response = await http
          .delete(uri, headers: await getHeaders(), body: jsonEncode(body))
          .timeout(const Duration(seconds: timeoutInSeconds));
      return await _processResponse(
        response,
        () => deleteWithBody(urlSuffix, body),
      );
    });
  }

  Future<ApiResponse> patch<T>(
    String urlSuffix,
    Map<String, dynamic> body,
  ) async {
    return _performRequest(() async {
      final response = await http
          .patch(
            Uri.parse('$baseUrl$urlSuffix'),
            headers: await getHeaders(),
            body: jsonEncode(body),
          )
          .timeout(const Duration(seconds: timeoutInSeconds));
      return await _processResponse(response, () => patch(urlSuffix, body));
    });
  }

  /// Handles API responses and retries if unauthorized (401)
  Future<ApiResponse> _processResponse(
    http.Response response,
    Future<ApiResponse> Function() retryRequest,
  ) async {
    if (response.statusCode == 401) {
      return await _handleUnauthorizedRequest(retryRequest);
    }

    final Map<String, dynamic> data = jsonDecode(response.body);
    String message = data["message"] ?? internalServerErrorMessage;

    return response.statusCode == 200 || response.statusCode == 201
        ? ApiResponse(data['message'] ?? internalServerErrorMessage, true)
        : ApiResponse(message, false);
  }

  Future<ApiResponseWithData<T>> _processResponseWithData<T>(
    http.Response response,
    T defaultData,
    Future<ApiResponseWithData<T>> Function() retryRequest,
  ) async {
    if (response.statusCode == 401) {
      return await _handleUnauthorizedRequestWithData(
        defaultData,
        retryRequest,
      );
    }

    final Map<String, dynamic> data = jsonDecode(response.body);
    String message = data["message"] ?? internalServerErrorMessage;

    return response.statusCode == 200 || response.statusCode == 201
        ? ApiResponseWithData(data as T, true)
        : ApiResponseWithData(defaultData, false, message: message);
  }

  /// Handles token refresh and retries the failed request
  Future<ApiResponse> _handleUnauthorizedRequest(
    Future<ApiResponse> Function() retryRequest,
  ) async {
    try {
      bool success = await _refreshToken();
      if (success) {
        return await retryRequest();
      }
      return ApiResponse("Session expired. Please log in again.", false);
    } catch (e) {
      return ApiResponse("Token refresh failed: ${e.toString()}", false);
    }
  }

  Future<ApiResponseWithData<T>> _handleUnauthorizedRequestWithData<T>(
    T defaultData,
    Future<ApiResponseWithData<T>> Function() retryRequest,
  ) async {
    try {
      bool success = await _refreshToken();
      if (success) {
        return await retryRequest();
      }
      return ApiResponseWithData(
        defaultData,
        false,
        message: "Session expired. Please log in again.",
      );
    } catch (e) {
      return ApiResponseWithData(
        defaultData,
        false,
        message: "Token refresh failed: ${e.toString()}",
      );
    }
  }

  Future<bool> _refreshToken() async {
    if (_isRefreshing) {
      await _refreshCompleter?.future;
      return (SharedPrefUtil.getValue(accessTokenPref, "") as String)
          .isNotEmpty;
    }

    _isRefreshing = true;
    _refreshCompleter = Completer<void>();
    bool refreshSuccess = false;

    try {
      String refreshToken =
          SharedPrefUtil.getValue(refreshTokenPref, "") as String;
      final response = await http
          .post(
            Uri.parse("${baseUrl}auth/refresh-token"),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({"refreshToken": refreshToken}),
          )
          .timeout(const Duration(seconds: timeoutInSeconds));

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        final mapData = data["data"];
        String newAccessToken = mapData["accessToken"];
        await SharedPrefUtil.setValue(accessTokenPref, newAccessToken);
        refreshSuccess = true;
      } else {
        _redirectToLogin();
      }
    } catch (e) {
      debugPrint("Token refresh error: $e");
    } finally {
      _refreshCompleter?.complete();
      _refreshCompleter = null;
      _isRefreshing = false;
    }

    return refreshSuccess;
  }

  void _redirectToLogin() {
    // Clear stored tokens
    SharedPrefUtil.logOut();

    navigatorKey.currentState?.pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (Route<dynamic> route) => false,
    );
  }

  Future<T> _performRequest<T>(Future<T> Function() requestFunction) async {
    try {
      return await requestFunction();
    } catch (e) {
      debugPrint("API request error: $e");
      if (T == ApiResponseWithData) {
        return ApiResponseWithData<dynamic>(
              null,
              false,
              message: "Request failed",
            )
            as T;
      } else if (T == ApiResponse) {
        return ApiResponse("Request failed: ${e.toString()}", false) as T;
      } else {
        throw Exception("Unhandled return type in _performRequest");
      }
    }
  }
}
