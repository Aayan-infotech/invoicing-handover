import 'package:flutter/material.dart';
import 'package:invoice_app/utills/app_colors.dart';

class CustomDialog extends StatelessWidget {
  final DialogType type;
  final String title;
  final String message;
  final String buttonText;
  final VoidCallback onPressed;

  const CustomDialog({
    super.key,
    required this.type,
    required this.title,
    required this.message,
    this.buttonText = 'OK',
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
      elevation: 0,
      backgroundColor: Colors.transparent,
      child: _buildDialogContent(context),
    );
  }

  Widget _buildDialogContent(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: Pallete.secondaryBackgroundColor,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Icon with background
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: type.backgroundColor.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(type.icon, size: 42, color: type.backgroundColor),
          ),

          const SizedBox(height: 24),

          // Title
          Text(
            title,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: Pallete.whiteColor,
            ),
          ),

          const SizedBox(height: 16),

          // Message
          Text(
            message,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 16,
              color: Pallete.subHeading,
              height: 1.4,
            ),
          ),

          const SizedBox(height: 28),

          // Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: type.backgroundColor,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 0,
                shadowColor: Colors.transparent,
              ),
              onPressed: onPressed,
              child: Text(
                buttonText,
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w600,
                  color: Pallete.whiteColor,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

enum DialogType { success, error }

extension DialogTypeExtension on DialogType {
  Color get backgroundColor {
    switch (this) {
      case DialogType.success:
        return Pallete.successColor;
      case DialogType.error:
        return Pallete.errorColor;
    }
  }

  IconData get icon {
    switch (this) {
      case DialogType.success:
        return Icons.check_circle;
      case DialogType.error:
        return Icons.error;
    }
  }
}

// Usage in your app:
void showCustomDialog({
  required BuildContext context,
  required DialogType type,
  required String title,
  required String message,
  String buttonText = 'OK',
  VoidCallback? onPressed,
}) {
  showDialog(
    context: context,
    barrierDismissible: false,
    builder: (context) => CustomDialog(
      type: type,
      title: title,
      message: message,
      buttonText: buttonText,
      onPressed: onPressed ?? () => Navigator.pop(context),
    ),
  );
}
