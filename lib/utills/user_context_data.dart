import 'package:flutter/material.dart';
import 'package:invoice_app/network/api_base.dart';
import 'package:invoice_app/network/provider/auth_provider.dart';
import 'package:invoice_app/utills/constant.dart';
import 'package:invoice_app/utills/shared_pref.dart';

import 'package:provider/provider.dart';

class UserContextData extends ApiBase {
  /// Fetch all necessary user-related data
  static Future<void> setCurrentUserAndFetchUserData(
      BuildContext context) async {
    try {
      final userProvider = Provider.of<AuthProvider>(context, listen: false);
      // final mapProvider = Provider.of<MapProvider>(context, listen: false);
      // final tripProvider = Provider.of<TripViewModel>(context, listen: false);

      List<Future> lstFutures = <Future>[
        userProvider.getProfile(),
      ];

      await Future.wait(lstFutures);
    } catch (e) {
      debugPrint('User data fetch failed: $e');

      // Optional: Handle logout if needed
      if (e.toString().contains('Token expired') ||
          e.toString().contains('Unauthorized')) {
        // Navigator.pushAndRemoveUntil(
        //   context,
        //   MaterialPageRoute(builder: (context) => const LoginScreen()),
        //   (route) => false,
        // );
      }
    }
  }
}
