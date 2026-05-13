import 'package:flutter/material.dart';

class BrandedPrimaryButton extends StatelessWidget {
  final String name;
  final VoidCallback onPressed;
  final bool isEnabled;
  final bool isUnfocus;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final double height;
  final bool alignLeftWithSuffixRight; // 🔹 New

  const BrandedPrimaryButton({
    super.key,
    this.isUnfocus = false,
    required this.name,
    required this.onPressed,
    this.isEnabled = false,
    this.prefixIcon,
    this.suffixIcon,
    this.height = 50.0,
    this.alignLeftWithSuffixRight = false, // 🔹 Default to false
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Center(
      child: SizedBox(
        height: height,
        width: double.infinity,
        child: ElevatedButton(
          onPressed: isEnabled ? onPressed : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: isEnabled
                ? (isUnfocus ? colorScheme.surfaceVariant : Colors.blueAccent)
                : theme.disabledColor,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(isEnabled ? 10.0 : 6.0),
              side: isEnabled
                  ? BorderSide(
                      color:
                          isUnfocus ? colorScheme.primary : colorScheme.primary,
                    )
                  : BorderSide.none,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16),
          ),
          child: getButtonContent(context),
        ),
      ),
    );
  }

  Widget getButtonContent(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    if (alignLeftWithSuffixRight) {
      // 🔹 Left content (prefix + text), right-aligned suffix icon
      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              if (prefixIcon != null) ...[
                prefixIcon!,
                const SizedBox(width: 8),
              ],
              Text(
                name,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: isUnfocus
                      ? colorScheme.onSecondary
                      : colorScheme.onPrimary,
                  fontWeight: FontWeight.w600,
                  fontSize: (MediaQuery.of(context).size.width < 380) ? 14 : 16,
                ),
              ),
            ],
          ),
          if (suffixIcon != null) suffixIcon!,
        ],
      );
    } else {
      // 🔹 All content centered
      return Row(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (prefixIcon != null) ...[
            prefixIcon!,
            const SizedBox(width: 8),
          ],
          Text(
            name,
            style: theme.textTheme.bodyMedium?.copyWith(
              color:
                  isUnfocus ? colorScheme.onSecondary : colorScheme.onPrimary,
              fontWeight: FontWeight.w600,
              fontSize: (MediaQuery.of(context).size.width < 380) ? 14 : 16,
            ),
          ),
          if (suffixIcon != null) ...[
            const SizedBox(width: 8),
            suffixIcon!,
          ],
        ],
      );
    }
  }
}
