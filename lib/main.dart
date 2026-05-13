import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'firebase_options.dart';
import 'utills/notifications_services.dart';
import 'utills/shared_pref.dart';
import 'utills/app_colors.dart';

import 'network/provider/auth_provider.dart';
import 'network/provider/project_provider.dart';
import 'auth/splash_screen.dart';

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

/// 🔔 Background notification handler (TOP LEVEL)
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  debugPrint("🔔 Background message: ${message.messageId}");
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);

  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

  await NotificationService.instance.initialize();

  await SharedPrefUtil.init();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ProjectProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final baseText = GoogleFonts.montserratTextTheme(
      ThemeData(brightness: Brightness.dark).textTheme,
    ).apply(
      bodyColor: Pallete.textColor,
      displayColor: Pallete.textColor,
    );

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Invoice App',
      builder: (context, child) {
        final mediaQuery = MediaQuery.of(context);
        return MediaQuery(
          data: mediaQuery.copyWith(
            textScaler: TextScaler.linear(mediaQuery.textScaler.scale(1.0) * 1.1),
          ),
          child: child!,
        );
      },
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        fontFamily: GoogleFonts.montserrat().fontFamily,

        textTheme: baseText,

        scaffoldBackgroundColor: Pallete.backgroundColor,
        primaryColor: Pallete.primaryColor,
        canvasColor: Pallete.backgroundColor,
        dividerColor: Pallete.outLineColor,

        colorScheme: const ColorScheme(
          brightness: Brightness.dark,
          primary: Pallete.primaryColor,
          onPrimary: Pallete.whiteColor,
          secondary: Pallete.accentColor,
          onSecondary: Pallete.whiteColor,
          error: Pallete.errorColor,
          onError: Pallete.whiteColor,
          surface: Pallete.secondaryBackgroundColor,
          onSurface: Pallete.textColor,
        ),

        appBarTheme: AppBarTheme(
          backgroundColor: Pallete.backgroundColor,
          foregroundColor: Pallete.whiteColor,
          surfaceTintColor: Colors.transparent,
          elevation: 0,
          iconTheme: const IconThemeData(color: Pallete.whiteColor),
          titleTextStyle: GoogleFonts.montserrat(
            color: Pallete.whiteColor,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),

        cardTheme: CardThemeData(
          color: Pallete.secondaryBackgroundColor,
          surfaceTintColor: Colors.transparent,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),

        dialogTheme: DialogThemeData(
          backgroundColor: Pallete.secondaryBackgroundColor,
          surfaceTintColor: Colors.transparent,
          titleTextStyle: GoogleFonts.montserrat(
            color: Pallete.whiteColor,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
          contentTextStyle: GoogleFonts.montserrat(
            color: Pallete.subHeading,
            fontSize: 14,
          ),
        ),

        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Pallete.secondaryBackgroundColor,
          selectedItemColor: Pallete.accentColor,
          unselectedItemColor: Pallete.subHeading,
          type: BottomNavigationBarType.fixed,
        ),

        iconTheme: const IconThemeData(color: Pallete.whiteColor),

        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: Pallete.primaryColor,
            foregroundColor: Pallete.whiteColor,
            textStyle: GoogleFonts.montserrat(fontWeight: FontWeight.w600),
            disabledBackgroundColor: Pallete.disableButtonColor,
            disabledForegroundColor: Pallete.disableButtonTextColor,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
          ),
        ),

        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: Pallete.accentColor,
            textStyle: GoogleFonts.montserrat(fontWeight: FontWeight.w600),
          ),
        ),

        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: Pallete.whiteColor,
            side: BorderSide(color: Pallete.outLineColor),
            textStyle: GoogleFonts.montserrat(fontWeight: FontWeight.w600),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
          ),
        ),

        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Pallete.secondaryBackgroundColor,
          hintStyle: GoogleFonts.montserrat(
            color: Pallete.subHeading,
            fontWeight: FontWeight.w400,
          ),
          labelStyle: GoogleFonts.montserrat(
            color: Pallete.labelTextColor,
            fontWeight: FontWeight.w500,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Pallete.outLineColor),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Pallete.outLineColor),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Pallete.accentColor),
          ),
        ),
      ),
      home: const SplashScreen(),
    );
  }
}
