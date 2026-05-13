import 'package:flutter/material.dart';

class BrandedTextField extends StatefulWidget {
  final TextEditingController controller;
  final String labelText;
  final double height;
  final TextInputType? keyboardType;
  final Widget? prefix;
  final Widget? sufix;
  final bool isFilled;
  final void Function(String)? onChanged;
  final int maxLines;
  final int minLines;
  final bool isEnabled;
  final bool isPassword;
  final void Function()? onTap;
  final String? Function(String?)? validator;
  final Color? backgroundColor;

  const BrandedTextField({
    super.key,
    this.validator,
    this.isEnabled = true,
    this.isFilled = true,
    required this.controller,
    this.prefix,
    required this.labelText,
    this.height = 55,
    this.sufix,
    this.maxLines = 1,
    this.minLines = 1,
    this.keyboardType,
    this.onChanged,
    this.onTap,
    this.isPassword = false,
    this.backgroundColor,
  });

  @override
  _BrandedTextFieldState createState() => _BrandedTextFieldState();
}

class _BrandedTextFieldState extends State<BrandedTextField> {
  bool _isObscured = true;
  bool _isFocused = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final textTheme = theme.textTheme;

    final Color primaryColor = colorScheme.primary;
    final Color borderColor = colorScheme.outline.withOpacity(0.4);
    final Color focusedBorderColor = colorScheme.primary;
    final Color errorColor = colorScheme.error;
    final Color labelColor = _isFocused
        ? primaryColor
        : colorScheme.onSurfaceVariant;
    final Color hintColor = colorScheme.onSurfaceVariant.withOpacity(0.7);
    final Color textColor = colorScheme.onSurface;

    return Focus(
      onFocusChange: (hasFocus) => setState(() => _isFocused = hasFocus),
      child: TextFormField(
        validator: widget.validator,
        enabled: widget.isEnabled,
        onTap: widget.onTap,
        maxLines: widget.maxLines,
        minLines: widget.minLines,
        controller: widget.controller,
        keyboardType: widget.keyboardType,
        onChanged: widget.onChanged,
        obscureText: widget.isPassword ? _isObscured : false,
        style: textTheme.bodyMedium?.copyWith(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: textColor,
        ),
        decoration: InputDecoration(
          fillColor:
              widget.backgroundColor ?? theme.inputDecorationTheme.fillColor,
          filled: widget.isFilled,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(30),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(30),
            borderSide: BorderSide(color: focusedBorderColor, width: 2),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(30),
            borderSide: BorderSide(color: borderColor, width: 1.5),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(30),
            borderSide: BorderSide(color: errorColor, width: 1.5),
          ),
          focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(30),
            borderSide: BorderSide(color: errorColor, width: 2),
          ),
          hintText: widget.labelText,
          hintStyle: textTheme.bodySmall?.copyWith(
            color: hintColor,
            fontSize: 14,
          ),
          suffixIcon: widget.isPassword
              ? IconButton(
                  icon: Icon(
                    _isObscured
                        ? Icons.visibility_outlined
                        : Icons.visibility_off_outlined,
                    color: _isFocused ? primaryColor : hintColor,
                  ),
                  onPressed: () => setState(() => _isObscured = !_isObscured),
                )
              : widget.sufix != null
              ? Padding(
                  padding: const EdgeInsets.all(12),
                  child: IconTheme(
                    data: IconThemeData(color: primaryColor),
                    child: widget.sufix!,
                  ),
                )
              : null,
          prefixIcon: widget.prefix != null
              ? Padding(
                  padding: const EdgeInsets.only(left: 16, right: 12),
                  child: IconTheme(
                    data: IconThemeData(color: primaryColor),
                    child: widget.prefix!,
                  ),
                )
              : null,
          contentPadding: const EdgeInsets.symmetric(
            vertical: 18,
            horizontal: 20,
          ),
          errorStyle: textTheme.bodySmall?.copyWith(
            color: errorColor,
            fontSize: 12,
          ),
          floatingLabelBehavior: FloatingLabelBehavior.auto,
          label: Text(
            widget.labelText,
            style: textTheme.bodySmall?.copyWith(
              color: labelColor,
              fontSize: 14,
            ),
          ),
        ),
      ),
    );
  }
}
