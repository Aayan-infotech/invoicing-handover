import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:invoice_app/dash_board_screen/quality_assurance.dart';
import 'package:invoice_app/dash_board_screen/task_details_screen.dart';
import 'package:invoice_app/network/models/project_details_model.dart';
import 'package:invoice_app/network/provider/project_provider.dart';
import 'package:invoice_app/utills/app_colors.dart';
import 'package:provider/provider.dart';

class ProjectDetailScreen extends StatefulWidget {
  final String projectId;

  const ProjectDetailScreen({super.key, required this.projectId});

  @override
  State<ProjectDetailScreen> createState() => _ProjectDetailScreenState();
}

class _ProjectDetailScreenState extends State<ProjectDetailScreen> {
  late ProjectProvider _projectProvider;

  @override
  void initState() {
    super.initState();
    _projectProvider = Provider.of<ProjectProvider>(context, listen: false);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadProjectDetails();
    });
  }

  Future<void> _loadProjectDetails() async {
    await _projectProvider.fetchProjectDetails(widget.projectId);
  }

  BoxDecoration _cardDecoration() => BoxDecoration(
        color: Pallete.secondaryBackgroundColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Pallete.outLineColor),
      );

  @override
  Widget build(BuildContext context) {
    return Consumer<ProjectProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading) {
          return const Scaffold(
            backgroundColor: Pallete.backgroundColor,
            body: Center(
              child: CircularProgressIndicator(color: Pallete.accentColor),
            ),
          );
        }

        final project = provider.projectDetails;
        return Scaffold(
          backgroundColor: Pallete.backgroundColor,
          appBar: AppBar(
            forceMaterialTransparency: true,
            centerTitle: true,
            title: const Text(
              "Project Details",
              style: TextStyle(
                color: Pallete.whiteColor,
                fontWeight: FontWeight.w600,
              ),
            ),
            iconTheme: const IconThemeData(color: Pallete.whiteColor),
          ),
          body: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildProjectHero(project),
                  const SizedBox(height: 20),
                  _buildTimelineCard(project),
                  const SizedBox(height: 16),
                  _buildDescriptionCard(project),
                  const SizedBox(height: 16),
                  _buildQualityAssuranceButton(context, project),
                  const SizedBox(height: 24),
                  _sectionTitle('Inventory'),
                  const SizedBox(height: 12),
                  _buildInventoryRow(),
                  const SizedBox(height: 24),
                  _sectionTitle(
                    'Tasks',
                    trailing: '${project.tasks.length} total',
                  ),
                  const SizedBox(height: 12),
                  _buildTasksGrid(project, context),
                  const SizedBox(height: 24),
                  _sectionTitle(
                    'Team Members',
                    trailing: '${project.assignedMembersDetails.length}',
                  ),
                  const SizedBox(height: 12),
                  _buildTeamRow(project),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  /* ------------------------------ HERO ----------------------------- */

  Widget _buildProjectHero(ProjectDetails project) {
    final statusColor = _getStatusColor(project.status);
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Pallete.primaryColor.withOpacity(0.45),
            Pallete.accentColor.withOpacity(0.18),
          ],
        ),
        border: Border.all(color: Pallete.accentColor.withOpacity(0.35)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: Pallete.whiteColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(
                  Icons.engineering_rounded,
                  color: Pallete.whiteColor,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(30),
                  border: Border.all(color: statusColor.withOpacity(0.5)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: statusColor,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      project.status.isEmpty
                          ? 'Active'
                          : project.status.toUpperCase(),
                      style: TextStyle(
                        color: statusColor,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            project.projectName,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: Pallete.whiteColor,
              height: 1.25,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(
                Icons.calendar_today_rounded,
                size: 14,
                color: Pallete.whiteColor,
              ),
              const SizedBox(width: 6),
              Text(
                '${DateFormat('dd MMM').format(project.startDate)}  →  ${DateFormat('dd MMM yyyy').format(project.endDate)}',
                style: const TextStyle(
                  color: Pallete.whiteColor,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  /* ---------------------------- TIMELINE --------------------------- */

  Widget _buildTimelineCard(ProjectDetails project) {
    final totalDays = project.endDate.difference(project.startDate).inDays;
    final elapsed = DateTime.now().difference(project.startDate).inDays;
    final progress = totalDays <= 0
        ? 0.0
        : (elapsed / totalDays).clamp(0.0, 1.0).toDouble();
    final daysLeft = project.endDate.difference(DateTime.now()).inDays;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: _miniStat(
                  icon: Icons.hourglass_top_rounded,
                  label: 'DURATION',
                  value: '$totalDays days',
                  color: Pallete.accentColor,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _miniStat(
                  icon: Icons.event_available_rounded,
                  label: daysLeft >= 0 ? 'DAYS LEFT' : 'OVERDUE',
                  value: daysLeft >= 0 ? '$daysLeft days' : '${-daysLeft} days',
                  color: daysLeft >= 0
                      ? Pallete.successColor
                      : Pallete.errorColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Progress',
                style: TextStyle(
                  color: Pallete.subHeading,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.3,
                ),
              ),
              Text(
                '${(progress * 100).toStringAsFixed(0)}%',
                style: const TextStyle(
                  color: Pallete.accentColor,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 8,
              backgroundColor: Pallete.outLineColor,
              valueColor: const AlwaysStoppedAnimation(Pallete.accentColor),
            ),
          ),
        ],
      ),
    );
  }

  Widget _miniStat({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Pallete.backgroundColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Pallete.outLineColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: color),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  label,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Pallete.subHeading,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.3,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              color: Pallete.whiteColor,
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  /* --------------------------- DESCRIPTION ------------------------- */

  Widget _buildDescriptionCard(ProjectDetails project) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'ABOUT THIS PROJECT',
            style: TextStyle(
              color: Pallete.subHeading,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            project.description.isEmpty
                ? 'No description provided.'
                : project.description,
            style: const TextStyle(
              color: Pallete.whiteColor,
              fontSize: 14,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  /* ---------------------- QUALITY ASSURANCE CTA -------------------- */

  Widget _buildQualityAssuranceButton(
    BuildContext context,
    ProjectDetails project,
  ) {
    return InkWell(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => DocumentsScreen(
              projectId: project.id,
              projectName: project.projectName,
            ),
          ),
        );
      },
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          gradient: LinearGradient(
            colors: [Pallete.primaryColor, Pallete.accentColor],
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Pallete.whiteColor.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Icons.verified_rounded,
                color: Pallete.whiteColor,
              ),
            ),
            const SizedBox(width: 14),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Quality Assurance',
                    style: TextStyle(
                      color: Pallete.whiteColor,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Review project documents & checks',
                    style: TextStyle(
                      color: Pallete.whiteColor,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.arrow_forward_rounded,
              color: Pallete.whiteColor,
            ),
          ],
        ),
      ),
    );
  }

  /* ---------------------------- SECTION ---------------------------- */

  Widget _sectionTitle(String title, {String? trailing}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: Pallete.whiteColor,
          ),
        ),
        if (trailing != null)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: Pallete.accentColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              trailing,
              style: const TextStyle(
                color: Pallete.accentColor,
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.2,
              ),
            ),
          ),
      ],
    );
  }

  /* --------------------------- INVENTORY --------------------------- */

  Widget _buildInventoryRow() {
    final items = [
      (icon: Icons.roofing_rounded, label: 'Shingles'),
      (icon: Icons.grid_4x4_rounded, label: 'Roof tiles'),
      (icon: Icons.architecture_rounded, label: 'Joists'),
      (icon: Icons.construction_rounded, label: 'Tools'),
    ];

    return SizedBox(
      height: 92,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (_, i) => _buildInventoryItem(
          icon: items[i].icon,
          label: items[i].label,
        ),
      ),
    );
  }

  Widget _buildInventoryItem({required IconData icon, required String label}) {
    return Container(
      width: 104,
      padding: const EdgeInsets.all(12),
      decoration: _cardDecoration(),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: Pallete.accentColor.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: Pallete.accentColor, size: 18),
          ),
          const Spacer(),
          Text(
            label,
            style: const TextStyle(
              color: Pallete.whiteColor,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  /* ----------------------------- TASKS ----------------------------- */

  Widget _buildTasksGrid(ProjectDetails project, BuildContext context) {
    if (project.tasks.isEmpty) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 28),
        decoration: _cardDecoration(),
        child: const Center(
          child: Text(
            'No tasks assigned yet',
            style: TextStyle(color: Pallete.subHeading),
          ),
        ),
      );
    }

    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: project.tasks
          .map((task) => _buildTaskItem(task: task, context: context))
          .toList(),
    );
  }

  Widget _buildTaskItem({required Task task, required BuildContext context}) {
    final statusColor = _getStatusColor(task.status);
    final isCompleted = task.status.toLowerCase() == 'completed';
    final width = (MediaQuery.of(context).size.width - 16 * 2 - 10) / 2;

    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(builder: (context) => TaskScreen(taskId: task.id)),
        );
      },
      child: Container(
        width: width,
        padding: const EdgeInsets.all(14),
        decoration: _cardDecoration(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.2),
                    shape: BoxShape.circle,
                    border: Border.all(color: statusColor.withOpacity(0.5)),
                  ),
                  child: Icon(
                    isCompleted
                        ? Icons.check_rounded
                        : Icons.schedule_rounded,
                    color: statusColor,
                    size: 16,
                  ),
                ),
                const Spacer(),
                const Icon(
                  Icons.arrow_outward_rounded,
                  color: Pallete.subHeading,
                  size: 16,
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              task.taskName,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                color: Pallete.whiteColor,
                fontWeight: FontWeight.w700,
                fontSize: 14,
                height: 1.3,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              task.status.isEmpty ? 'pending' : task.status,
              style: TextStyle(
                color: statusColor,
                fontSize: 11,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.2,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /* ----------------------------- TEAM ------------------------------ */

  Widget _buildTeamRow(ProjectDetails project) {
    if (project.assignedMembersDetails.isEmpty) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: _cardDecoration(),
        child: const Center(
          child: Text(
            'No members assigned',
            style: TextStyle(color: Pallete.subHeading),
          ),
        ),
      );
    }

    return SizedBox(
      height: 92,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: project.assignedMembersDetails.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (_, i) =>
            _buildTeamMember(project.assignedMembersDetails[i]),
      ),
    );
  }

  Widget _buildTeamMember(AssignedMember member) {
    final displayName = member.name ?? member.username;
    final initials = displayName
        .trim()
        .split(RegExp(r'\s+'))
        .where((s) => s.isNotEmpty)
        .take(2)
        .map((s) => s[0].toUpperCase())
        .join();

    return SizedBox(
      width: 64,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(2),
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: [Pallete.accentColor, Pallete.primaryColor],
              ),
            ),
            child: CircleAvatar(
              radius: 22,
              backgroundColor: Pallete.secondaryBackgroundColor,
              child: ClipOval(
                child: (member.profileImage != null &&
                        member.profileImage!.isNotEmpty)
                    ? CachedNetworkImage(
                        imageUrl: member.profileImage!,
                        width: 44,
                        height: 44,
                        fit: BoxFit.cover,
                        placeholder: (_, __) => _memberInitials(initials),
                        errorWidget: (_, __, ___) => _memberInitials(initials),
                      )
                    : _memberInitials(initials),
              ),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            displayName,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: Pallete.whiteColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _memberInitials(String initials) {
    return Container(
      width: 44,
      height: 44,
      alignment: Alignment.center,
      color: Pallete.secondaryBackgroundColor,
      child: Text(
        initials.isEmpty ? '?' : initials,
        style: const TextStyle(
          color: Pallete.whiteColor,
          fontWeight: FontWeight.w700,
          fontSize: 13,
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return Pallete.successColor;
      case 'in progress':
      case 'inprogress':
        return Pallete.warmLeadIconColor;
      case 'pending':
        return Pallete.subHeading;
      case 'approved':
        return Pallete.accentColor;
      case 'rejected':
        return Pallete.errorColor;
      default:
        return Pallete.accentColor;
    }
  }
}
