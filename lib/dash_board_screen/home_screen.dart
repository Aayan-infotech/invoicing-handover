import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:invoice_app/dash_board_screen/notification_screen.dart';
import 'package:invoice_app/utills/app_colors.dart';
import 'package:provider/provider.dart';

import 'package:invoice_app/dash_board_screen/home_invoice.dart';
import 'package:invoice_app/dash_board_screen/project_screen.dart';
import 'package:invoice_app/network/provider/auth_provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Pallete.backgroundColor,
      body: Container(
        decoration: const BoxDecoration(gradient: Pallete.backgroundGradient),
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
            children: const [
              _Header(),
              SizedBox(height: 24),
              RepaintBoundary(child: _HeroCard()),
              SizedBox(height: 28),
              _SectionHeader(title: 'Quick Actions'),
              SizedBox(height: 14),
              RepaintBoundary(child: _QuickActionsGrid()),
              SizedBox(height: 28),
              _SectionHeader(title: 'Explore'),
              SizedBox(height: 14),
              RepaintBoundary(child: _TipCard()),
            ],
          ),
        ),
      ),
    );
  }
}

/* --------------------------- HEADER --------------------------- */

class _Header extends StatelessWidget {
  const _Header();

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (_, auth, __) {
        final imageUrl = auth.userModel.profileImage;
        final displayName = auth.userModel.name.isNotEmpty
            ? auth.userModel.name
            : 'there';
        return Row(
          children: [
            _ProfileAvatar(imageUrl: imageUrl, name: displayName),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _getGreeting(),
                    style: const TextStyle(
                      fontSize: 13,
                      color: Pallete.subHeading,
                      letterSpacing: 0.3,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    displayName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: Pallete.whiteColor,
                      height: 1.1,
                    ),
                  ),
                ],
              ),
            ),
            const _NotificationButton(),
          ],
        );
      },
    );
  }
}

class _ProfileAvatar extends StatelessWidget {
  final String imageUrl;
  final String name;
  const _ProfileAvatar({required this.imageUrl, required this.name});

  @override
  Widget build(BuildContext context) {
    final initials = name
        .trim()
        .split(RegExp(r'\s+'))
        .where((s) => s.isNotEmpty)
        .take(2)
        .map((s) => s[0].toUpperCase())
        .join();

    return Container(
      padding: const EdgeInsets.all(2),
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          colors: [Pallete.accentColor, Pallete.primaryColor],
        ),
      ),
      child: CircleAvatar(
        radius: 24,
        backgroundColor: Pallete.secondaryBackgroundColor,
        child: ClipOval(
          child: imageUrl.isNotEmpty
              ? CachedNetworkImage(
                  imageUrl: imageUrl,
                  width: 48,
                  height: 48,
                  fit: BoxFit.cover,
                  placeholder: (_, __) => const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Pallete.accentColor,
                    ),
                  ),
                  errorWidget: (_, __, ___) => _InitialsAvatar(
                    initials: initials.isNotEmpty ? initials : '?',
                  ),
                )
              : _InitialsAvatar(initials: initials.isNotEmpty ? initials : '?'),
        ),
      ),
    );
  }
}

class _InitialsAvatar extends StatelessWidget {
  final String initials;
  const _InitialsAvatar({required this.initials});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 48,
      height: 48,
      alignment: Alignment.center,
      color: Pallete.secondaryBackgroundColor,
      child: Text(
        initials,
        style: const TextStyle(
          color: Pallete.whiteColor,
          fontWeight: FontWeight.w700,
          fontSize: 16,
        ),
      ),
    );
  }
}

class _NotificationButton extends StatelessWidget {
  const _NotificationButton();

  @override
  Widget build(BuildContext context) {
    return InkResponse(
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => NotificationsScreen(isBackButton: true),
        ),
      ),
      radius: 28,
      child: Container(
        width: 46,
        height: 46,
        decoration: BoxDecoration(
          color: Pallete.secondaryBackgroundColor,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Pallete.outLineColor),
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            const Icon(
              Icons.notifications_none_rounded,
              color: Pallete.accentColor,
              size: 22,
            ),
            Positioned(
              top: 10,
              right: 12,
              child: Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: Pallete.accentColor,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: Pallete.secondaryBackgroundColor,
                    width: 1.5,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/* --------------------------- HERO CARD --------------------------- */

class _HeroCard extends StatelessWidget {
  const _HeroCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Pallete.primaryColor.withOpacity(0.55),
            Pallete.accentColor.withOpacity(0.25),
          ],
        ),
        border: Border.all(color: Pallete.accentColor.withOpacity(0.35)),
      ),
      child: Stack(
        children: [
          Positioned(
            right: -20,
            top: -20,
            child: Container(
              width: 130,
              height: 130,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Pallete.accentColor.withOpacity(0.12),
              ),
            ),
          ),
          Positioned(
            right: 20,
            bottom: -30,
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Pallete.whiteColor.withOpacity(0.05),
              ),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 5,
                    ),
                    decoration: BoxDecoration(
                      color: Pallete.whiteColor.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(
                        color: Pallete.whiteColor.withOpacity(0.2),
                      ),
                    ),
                    child: const Text(
                      'WELCOME',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.4,
                        color: Pallete.whiteColor,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Text(
                'Manage your projects\nand invoices efficiently',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: Pallete.whiteColor,
                  height: 1.3,
                ),
              ),
              const SizedBox(height: 14),
              const Text(
                'Track tasks, keep paperwork tidy, and stay on top of every deadline.',
                style: TextStyle(
                  fontSize: 13,
                  color: Pallete.whiteColor,
                  height: 1.45,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/* -------------------------- SECTION HEADER ----------------------- */

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: Pallete.whiteColor,
            letterSpacing: 0.2,
          ),
        ),
      ],
    );
  }
}

/* ------------------------- QUICK ACTIONS GRID -------------------- */

class _QuickActionsGrid extends StatelessWidget {
  const _QuickActionsGrid();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _ActionCard(
            title: 'Projects',
            subtitle: 'Browse active\nwork sites',
            icon: Icons.folder_copy_rounded,
            accent: Pallete.accentColor,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const ProjectScreen()),
            ),
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: _ActionCard(
            title: 'Invoices',
            subtitle: 'Review billing\n& payments',
            icon: Icons.receipt_long_rounded,
            accent: Pallete.primaryColor,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const HomeInvoiceScreen()),
            ),
          ),
        ),
      ],
    );
  }
}

class _ActionCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color accent;
  final VoidCallback onTap;

  const _ActionCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.accent,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      splashColor: accent.withOpacity(0.15),
      child: Container(
        padding: const EdgeInsets.all(18),
        height: 170,
        decoration: BoxDecoration(
          color: Pallete.secondaryBackgroundColor,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Pallete.outLineColor),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                color: accent.withOpacity(0.16),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: accent.withOpacity(0.35)),
              ),
              child: Icon(icon, color: accent, size: 24),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: Pallete.whiteColor,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Pallete.subHeading,
                    height: 1.3,
                  ),
                ),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: accent.withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.arrow_forward_rounded,
                    size: 16,
                    color: accent,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/* ---------------------------- TIP CARD --------------------------- */

class _TipCard extends StatelessWidget {
  const _TipCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Pallete.secondaryBackgroundColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Pallete.outLineColor),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: Pallete.accentColor.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.lightbulb_outline_rounded,
              color: Pallete.accentColor,
            ),
          ),
          const SizedBox(width: 14),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Pro Tip',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Pallete.accentColor,
                    letterSpacing: 0.4,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Update task status daily to keep invoices flowing on time.',
                  style: TextStyle(
                    fontSize: 13,
                    color: Pallete.whiteColor,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
