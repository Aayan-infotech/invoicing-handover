import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:invoice_app/auth/login_screen.dart';
import 'package:invoice_app/dash_board_screen/edit_profile_screen.dart';
import 'package:invoice_app/dash_board_screen/notification_screen.dart';
import 'package:invoice_app/network/models/user_model.dart';
import 'package:invoice_app/network/provider/auth_provider.dart';
import 'package:invoice_app/profile/activity_screen.dart';
import 'package:invoice_app/profile/security_screen.dart';
import 'package:invoice_app/utills/app_colors.dart';
import 'package:invoice_app/utills/shared_pref.dart';
import 'package:provider/provider.dart';

class AccountScreen extends StatefulWidget {
  const AccountScreen({super.key});

  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  Future<void> _refreshProfile() async {
    final provider = Provider.of<AuthProvider>(context, listen: false);
    await provider.getProfile();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Pallete.backgroundColor,
      appBar: AppBar(
        centerTitle: true,
        forceMaterialTransparency: true,
        automaticallyImplyLeading: false,
        title: const Text(
          'Account',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: Pallete.whiteColor,
          ),
        ),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          color: Pallete.accentColor,
          backgroundColor: Pallete.secondaryBackgroundColor,
          onRefresh: _refreshProfile,
          child: Consumer<AuthProvider>(
            builder: (_, authProvider, __) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                children: [
                  _buildProfileHero(authProvider.userModel),
                  const SizedBox(height: 24),
                  _sectionLabel('ACCOUNT'),
                  const SizedBox(height: 10),
                  _buildMenuCard([
                    _MenuItem(
                      icon: Icons.person_outline_rounded,
                      label: 'Update Profile',
                      subtitle: 'Edit your personal details',
                      color: Pallete.accentColor,
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => EditProfileScreen(
                            userModel: authProvider.userModel,
                          ),
                        ),
                      ),
                    ),
                    _MenuItem(
                      icon: Icons.shield_outlined,
                      label: 'Security Setting',
                      subtitle: '2FA, devices & sessions',
                      color: Pallete.successColor,
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const SecuritySettingsScreen(),
                        ),
                      ),
                    ),
                    _MenuItem(
                      icon: Icons.history_rounded,
                      label: 'Activity',
                      subtitle: 'Recent invoices & downloads',
                      color: Pallete.primaryColor,
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const ActivityScreen(),
                        ),
                      ),
                    ),
                  ]),
                  const SizedBox(height: 20),
                  _sectionLabel('PREFERENCES'),
                  const SizedBox(height: 10),
                  _buildMenuCard([
                    _MenuItem(
                      icon: Icons.notifications_none_rounded,
                      label: 'Notifications',
                      subtitle: 'Alert preferences & sounds',
                      color: Pallete.warmLeadIconColor,
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => NotificationsScreen(
                            isBackButton: true,
                          ),
                        ),
                      ),
                    ),
                  ]),
                  const SizedBox(height: 28),
                  _buildLogoutButton(context),
                  const SizedBox(height: 18),
                  const Center(
                    child: Text(
                      'v1.0.0',
                      style: TextStyle(
                        color: Pallete.subHeading,
                        fontSize: 11,
                        letterSpacing: 0.4,
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  /* ----------------------------- HERO ------------------------------ */

  Widget _buildProfileHero(UserModel user) {
    final name = user.name.isNotEmpty ? user.name : 'Your Name';
    final email = user.email.isNotEmpty ? user.email : '—';
    final initials = name
        .trim()
        .split(RegExp(r'\s+'))
        .where((s) => s.isNotEmpty)
        .take(2)
        .map((s) => s[0].toUpperCase())
        .join();

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Pallete.primaryColor.withOpacity(0.45),
            Pallete.accentColor.withOpacity(0.18),
          ],
        ),
        border: Border.all(color: Pallete.accentColor.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              _buildAvatar(user.profileImage, initials),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: Pallete.whiteColor,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      email,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 12,
                        color: Pallete.whiteColor,
                      ),
                    ),
                    if (user.mobile.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(
                            Icons.phone_rounded,
                            size: 12,
                            color: Pallete.whiteColor,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            user.mobile,
                            style: const TextStyle(
                              fontSize: 11,
                              color: Pallete.whiteColor,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => EditProfileScreen(userModel: user),
                ),
              ),
              icon: const Icon(Icons.edit_rounded, size: 16),
              label: const Text(
                'Edit Profile',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Pallete.whiteColor.withOpacity(0.18),
                foregroundColor: Pallete.whiteColor,
                elevation: 0,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(
                    color: Pallete.whiteColor.withOpacity(0.25),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvatar(String imageUrl, String initials) {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          colors: [Pallete.accentColor, Pallete.primaryColor],
        ),
      ),
      child: CircleAvatar(
        radius: 32,
        backgroundColor: Pallete.secondaryBackgroundColor,
        child: ClipOval(
          child: imageUrl.isNotEmpty
              ? CachedNetworkImage(
                  imageUrl: imageUrl,
                  width: 64,
                  height: 64,
                  fit: BoxFit.cover,
                  placeholder: (_, __) => _initialsTile(initials),
                  errorWidget: (_, __, ___) => _initialsTile(initials),
                )
              : _initialsTile(initials),
        ),
      ),
    );
  }

  Widget _initialsTile(String initials) {
    return Container(
      width: 64,
      height: 64,
      alignment: Alignment.center,
      color: Pallete.secondaryBackgroundColor,
      child: Text(
        initials.isEmpty ? '?' : initials,
        style: const TextStyle(
          color: Pallete.whiteColor,
          fontWeight: FontWeight.w700,
          fontSize: 20,
        ),
      ),
    );
  }

  /* ------------------------- SECTION LABEL ------------------------- */

  Widget _sectionLabel(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: Text(
        text,
        style: const TextStyle(
          color: Pallete.subHeading,
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  /* ---------------------------- MENU CARD -------------------------- */

  Widget _buildMenuCard(List<_MenuItem> items) {
    return Container(
      decoration: BoxDecoration(
        color: Pallete.secondaryBackgroundColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Pallete.outLineColor),
      ),
      child: Column(
        children: [
          for (int i = 0; i < items.length; i++) ...[
            _buildMenuTile(items[i]),
            if (i < items.length - 1)
              Padding(
                padding: const EdgeInsets.only(left: 68),
                child: Container(
                  height: 1,
                  color: Pallete.outLineColor.withOpacity(0.6),
                ),
              ),
          ],
        ],
      ),
    );
  }

  Widget _buildMenuTile(_MenuItem item) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: item.onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: item.color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(11),
                  border: Border.all(color: item.color.withOpacity(0.35)),
                ),
                child: Icon(item.icon, color: item.color, size: 20),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.label,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: Pallete.whiteColor,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      item.subtitle,
                      style: const TextStyle(
                        fontSize: 11,
                        color: Pallete.subHeading,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.chevron_right_rounded,
                color: Pallete.subHeading,
                size: 20,
              ),
            ],
          ),
        ),
      ),
    );
  }

  /* ---------------------------- LOGOUT ----------------------------- */

  Widget _buildLogoutButton(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: () => _confirmLogout(context),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: Pallete.errorColor.withOpacity(0.12),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Pallete.errorColor.withOpacity(0.4)),
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.logout_rounded,
              color: Pallete.errorColor,
              size: 18,
            ),
            SizedBox(width: 8),
            Text(
              'Logout',
              style: TextStyle(
                color: Pallete.errorColor,
                fontSize: 15,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _confirmLogout(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor: Pallete.secondaryBackgroundColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: Pallete.outLineColor),
        ),
        title: const Text(
          'Logout?',
          style: TextStyle(color: Pallete.whiteColor),
        ),
        content: const Text(
          'You will need to sign in again to access your account.',
          style: TextStyle(color: Pallete.subHeading, fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            style: TextButton.styleFrom(foregroundColor: Pallete.subHeading),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            style: TextButton.styleFrom(foregroundColor: Pallete.errorColor),
            child: const Text('Logout'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    Provider.of<AuthProvider>(context, listen: false).logout();
    SharedPrefUtil.logOut();
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => LoginScreen()),
      (Route<dynamic> route) => false,
    );
  }
}

class _MenuItem {
  final IconData icon;
  final String label;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  _MenuItem({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });
}
