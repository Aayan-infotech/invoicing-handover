import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:invoice_app/auth/login_screen.dart';
import 'package:invoice_app/dash_board_screen/dashboard_screen.dart';
import 'package:invoice_app/dash_board_screen/home_screen.dart';
import 'package:invoice_app/utills/branded_primary_button.dart';
import 'package:invoice_app/utills/constant.dart';
import 'package:invoice_app/utills/shared_pref.dart';
import 'package:invoice_app/utills/user_context_data.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Background Image
          Image.asset(
            'assets/images/background_image.png', // Replace with your background image if you want
            fit: BoxFit.cover,
          ),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Top Logo

                // Middle Texts
                SizedBox(height: MediaQuery.of(context).size.height * 0.6),
                Padding(
                  padding: EdgeInsets.only(
                    right: MediaQuery.of(context).size.height * 0.2,
                  ),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Plan your',
                        style: TextStyle(color: Colors.white, fontSize: 20),
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Projects\nProgress',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          height: 1.2,
                        ),
                      ),
                    ],
                  ),
                ),

                BrandedPrimaryButton(
                  isEnabled: true,
                  name: "Explore",
                  onPressed: () {
                    bool isLogin =
                        SharedPrefUtil.getValue(isLoginPref, false) as bool;
                    if (isLogin) {
                      UserContextData.setCurrentUserAndFetchUserData(context);
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (context) {
                            return BottomNavScreen();
                          },
                        ),
                      );
                    } else {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (context) {
                            return LoginScreen();
                          },
                        ),
                      );
                    }
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
