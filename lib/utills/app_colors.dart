import 'package:flutter/material.dart';

class Pallete {
  static const Color backgroundColor = Color(0xFF0E1433); // Deep navy (scaffold)
  static const Color secondaryBackgroundColor =
      Color(0xFF1B2655); // Lighter navy (cards / surfaces)
  static const Color primaryColor =
      Color(0xFF3B5BFE); // Electric blue (primary buttons)
  static const Color whiteColor = Colors.white;
  static const Color blackColor = Colors.black;
  static const Color greenColor = Color(0xFF28C76F);
  static const Color redColor = Color(0xFFFF5B5B);
  static const Color blueColor = Color(0xFF3B5BFE);
  static const Color greyColor = Color(0xFF8A90B8); // Muted navy-grey
  static const Color coldLeadIconColor = Color(0xFFB3E5FC);
  static const Color warmLeadIconColor = Color(0xFFFFF176);
  static const Color hotLeadIconColor = Color(0xFFFF5252);
  static const Color black87 = Colors.black87;
  static const Color textColor = Colors.white; // Primary text on dark bg
  static const Color accentColor =
      Color(0xFF2AC5EA); // Cyan accent (highlighted words)
  static const Color highLightColor = Color(0xFFE6E8F5);
  static const Color appBarTitle = Colors.white;
  static const Color subHeading = Color(0xFFB8BCD3); // Light grey subtext
  static const Color blanckWidget =
      Color(0xFF1B2655); // Cards / light containers on dark bg
  static const Color disableButtonColor = Color(0xFF2A356A);
  static const Color disableButtonTextColor = Color(0xFF8A90B8);
  static const Color labelTextColor = Color(0xFFB8BCD3);
  static const Color successColor = Color(0xFF28C76F);
  static const Color errorColor = Color(0xFFFF5B5B);
  static const Color outLineColor = Color(0xFF2A356A); // Outline on dark bg
  static const Color importantNote = Color(0xFFFFF7E6);
  static const Color alertBackGroundColor = Color(0xFFFFEAEA);

  // Gradient used in hero surfaces (matches the screenshot)
  static const Gradient backgroundGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xFF0B1030), Color(0xFF1A2359)],
  );
}
