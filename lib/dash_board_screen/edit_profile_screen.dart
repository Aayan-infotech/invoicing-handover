import 'package:flutter/material.dart';
import 'dart:io';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:invoice_app/network/call_helpar.dart';
import 'dart:convert';
import 'package:invoice_app/network/models/user_model.dart';
import 'package:invoice_app/network/provider/auth_provider.dart';
import 'package:invoice_app/utills/app_colors.dart';
import 'package:invoice_app/utills/app_dialogue.dart';
import 'package:invoice_app/utills/branded_text_filed.dart';
import 'package:invoice_app/utills/constant.dart';
import 'package:invoice_app/utills/shared_pref.dart';
import 'package:path_provider/path_provider.dart';
import 'package:provider/provider.dart';
// Assuming you have an auth service

class EditProfileScreen extends StatefulWidget {
  final UserModel userModel;
  // final Function(UserModel) onProfileUpdated;

  const EditProfileScreen({
    required this.userModel,
    // required this.onProfileUpdated,
    super.key,
  });

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();

  File? _pickedImage;
  bool _isLoading = false;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    _nameController.text = widget.userModel.name;
    _emailController.text = widget.userModel.email;
    _phoneController.text = widget.userModel.mobile;
    _addressController.text = widget.userModel.address;
    super.initState();
  }

  static const int _maxImageBytes = 1024 * 1024; // 1 MB

  Future<void> _pickImage() async {
    try {
      final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
      if (image == null) return;

      final compressed = await _compressUnderLimit(File(image.path));
      if (compressed == null) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not compress image.')),
        );
        return;
      }

      setState(() => _pickedImage = compressed);
    } catch (e) {
      debugPrint('Error picking image: $e');
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Failed to pick image.')));
    }
  }

  Future<File?> _compressUnderLimit(File source) async {
    final sourceBytes = await source.length();
    if (sourceBytes <= _maxImageBytes) return source;

    final tempDir = await getTemporaryDirectory();
    final lowerPath = source.path.toLowerCase();
    final isPng = lowerPath.endsWith('.png');
    final format = isPng ? CompressFormat.png : CompressFormat.jpeg;
    final outExt = isPng ? 'png' : 'jpg';

    int quality = 85;
    int minWidth = 1080;
    int minHeight = 1080;

    for (int attempt = 0; attempt < 6; attempt++) {
      final targetPath =
          '${tempDir.path}/compressed_${DateTime.now().millisecondsSinceEpoch}_$attempt.$outExt';

      final result = await FlutterImageCompress.compressAndGetFile(
        source.absolute.path,
        targetPath,
        quality: quality,
        minWidth: minWidth,
        minHeight: minHeight,
        format: format,
      );

      if (result == null) return null;

      final outFile = File(result.path);
      final size = await outFile.length();
      if (size <= _maxImageBytes) return outFile;

      // Still too big — shrink quality and dimensions for the next pass.
      quality = (quality - 15).clamp(25, 100);
      minWidth = (minWidth * 0.8).round();
      minHeight = (minHeight * 0.8).round();
    }
    return null;
  }

  Future<void> _updateProfile() async {
    setState(() => _isLoading = true);

    try {
      // Get auth token
      final accessToken =
          SharedPrefUtil.getValue(accessTokenPref, "") as String;

      // Create multipart request
      final url = Uri.parse('${CallHelper.baseUrl}users/update-profile');
      final request = http.MultipartRequest('PUT', url)
        ..headers['Authorization'] = accessToken
        ..fields['name'] = _nameController.text
        ..fields['email'] = _emailController.text
        ..fields['mobile'] = _phoneController.text
        ..fields['address'] = _addressController.text;

      // Add image if selected
      if (_pickedImage != null) {
        request.files.add(
          await http.MultipartFile.fromPath(
            'profile_image',
            _pickedImage!.path,
          ),
        );
      }

      // Send request
      final response = await request.send();
      final responseData = await response.stream.bytesToString();

      if (response.statusCode == 200) {
        final jsonResponse = json.decode(responseData);
        final provider = Provider.of<AuthProvider>(context, listen: false);
        await provider.getProfile();
        showCustomDialog(
          context: context,
          type: DialogType.success,
          title: 'Profile Updated!',
          message: 'Your profile has been successfully updated.',
          onPressed: () async {
            Navigator.pop(context); // Close dialog
            Navigator.pop(context); // Close profile edit screen
          },
        );
      } else {
        showCustomDialog(
          context: context,
          type: DialogType.error,
          title: 'Error',
          message: json.decode(responseData)['message'],
          onPressed: () async {
            Navigator.pop(context); // Close dialog
          },
        );
      }
    } catch (e) {
      showCustomDialog(
        context: context,
        type: DialogType.error,
        title: 'Error',
        message: e.toString(),
        onPressed: () async {
          Navigator.pop(context); // Close dialog
        },
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Pallete.backgroundColor,
      appBar: AppBar(
        centerTitle: true,
        forceMaterialTransparency: true,
        title: const Text(
          'Edit Profile',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: Pallete.whiteColor,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            children: [
              const SizedBox(height: 20),
              _buildProfileImageSection(),
              const SizedBox(height: 30),
              _buildFormFields(),
              const SizedBox(height: 30),
              _buildUpdateButton(),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileImageSection() {
    return Center(
      child: Stack(
        alignment: Alignment.bottomRight,
        children: [
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: Pallete.primaryColor.withValues(alpha: 0.5), width: 2),
            ),
            child: Container(
              width: 130,
              height: 130,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Pallete.secondaryBackgroundColor,
                image: _pickedImage != null
                    ? DecorationImage(
                        image: FileImage(_pickedImage!),
                        fit: BoxFit.cover,
                      )
                    : widget.userModel.profileImage.isNotEmpty
                        ? DecorationImage(
                            image: NetworkImage(widget.userModel.profileImage),
                            fit: BoxFit.cover,
                          )
                        : null,
              ),
              child: widget.userModel.profileImage.isEmpty && _pickedImage == null
                  ? const Icon(Icons.person, size: 60, color: Pallete.subHeading)
                  : null,
            ),
          ),
          Positioned(
            bottom: 4,
            right: 4,
            child: GestureDetector(
              onTap: _pickImage,
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Pallete.primaryColor,
                  shape: BoxShape.circle,
                  border: Border.all(color: Pallete.backgroundColor, width: 3),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Icon(Icons.camera_alt, color: Colors.white, size: 18),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFormFields() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Pallete.secondaryBackgroundColor,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Personal Information',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Pallete.whiteColor,
            ),
          ),
          const SizedBox(height: 24),
          BrandedTextField(
            controller: _nameController,
            labelText: 'Full Name',
            isFilled: true,
            backgroundColor: Pallete.backgroundColor,
          ),
          const SizedBox(height: 16),
          BrandedTextField(
            isEnabled: false,
            controller: _emailController,
            labelText: 'Email Address',
            isFilled: true,
            backgroundColor: Pallete.backgroundColor,
          ),
          const SizedBox(height: 16),
          BrandedTextField(
            controller: _phoneController,
            labelText: 'Phone Number',
            isFilled: true,
            keyboardType: TextInputType.phone,
            backgroundColor: Pallete.backgroundColor,
          ),
          const SizedBox(height: 16),
          BrandedTextField(
            height: 55,
            controller: _addressController,
            labelText: 'Location Address',
            isFilled: true,
            backgroundColor: Pallete.backgroundColor,
          ),
        ],
      ),
    );
  }

  Widget _buildUpdateButton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: Container(
        width: double.infinity,
        height: 56,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: const LinearGradient(
            colors: [Pallete.primaryColor, Pallete.accentColor],
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
          ),
          boxShadow: [
            BoxShadow(
              color: Pallete.primaryColor.withValues(alpha: 0.3),
              blurRadius: 15,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: _isLoading ? null : _updateProfile,
            child: Center(
              child: _isLoading
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2.5,
                      ),
                    )
                  : const Text(
                      'Save Changes',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }
}

// API Constants
