import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:invoice_app/auth/otp_screen.dart';
import 'package:invoice_app/network/provider/auth_provider.dart';
import 'package:invoice_app/utills/app_colors.dart';
import 'package:invoice_app/utills/branded_text_filed.dart';
import 'package:provider/provider.dart'; // Add Provider package

class SignUpScreem extends StatefulWidget {
  const SignUpScreem({Key? key}) : super(key: key);

  @override
  State<SignUpScreem> createState() => _SignUpScreemState();
}

class _SignUpScreemState extends State<SignUpScreem> {
  final TextEditingController emailIdController = TextEditingController();
  bool _isLoading = false; // Local loading state

  Future<void> _signUp() async {
    final email = emailIdController.text.trim();
    if (email.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please enter your email')));
      return;
    }

    setState(() => _isLoading = true);

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final response = await authProvider.signUp(email);

      if (response.success) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => OtpVerificationScreen(email: email),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(response.message ?? 'Signup failed')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: ${e.toString()}')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Pallete.backgroundColor,
      appBar: AppBar(forceMaterialTransparency: true),
      body: SafeArea(
        child: Column(
          children: [
            Image.asset(
              "assets/images/logoIPA.png",
              height: MediaQuery.of(context).size.height * 0.2,
              width: MediaQuery.of(context).size.width * 0.6,
            ), // Replace with actual logo
            const SizedBox(height: 40),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const Text(
                      'Welcome Back',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w500,
                        color: Pallete.whiteColor,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Create your account to start tracking your invoices easily and stay updated with your projects.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 14,
                        color: Pallete.subHeading,
                        fontWeight: FontWeight.w400,
                      ),
                    ),

                    const SizedBox(height: 40),
                    BrandedTextField(
                      controller: emailIdController,
                      labelText: 'Enter user Id',
                      isFilled: true,
                      backgroundColor: Pallete.secondaryBackgroundColor,
                    ),
                    const SizedBox(height: 8),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 24.0,
                vertical: 12,
              ),
              child: Column(
                children: [
                  ElevatedButton(
                    onPressed: _isLoading
                        ? null
                        : _signUp, // Disable when loading
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Pallete.primaryColor,
                      foregroundColor: Pallete.whiteColor,
                      minimumSize: const Size.fromHeight(56),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 3,
                            ),
                          )
                        : const Text(
                            'Register',
                            style: TextStyle(fontSize: 16, color: Colors.white),
                          ),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton(
                    onPressed: _isLoading ? null : () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Pallete.accentColor),
                      minimumSize: const Size.fromHeight(56),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'Login',
                      style: TextStyle(fontSize: 16, color: Pallete.accentColor),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
