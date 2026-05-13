import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:invoice_app/dash_board_screen/project_details_screen.dart';
import 'package:invoice_app/network/models/project_model.dart';
import 'package:invoice_app/network/provider/project_provider.dart';
import 'package:invoice_app/utills/app_colors.dart';
import 'package:provider/provider.dart';

class ProjectScreen extends StatefulWidget {
  const ProjectScreen({super.key});

  @override
  State<ProjectScreen> createState() => _ProjectScreenState();
}

class _ProjectScreenState extends State<ProjectScreen> {
  String _selectedFilter = 'All';
  static const List<String> _filters = ['All', 'Active', 'Completed'];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadProjects();
    });
  }

  Future<void> _loadProjects() async {
    final projectProvider = context.read<ProjectProvider>();
    await projectProvider.fetchMyProjects('default_user_id');
  }

  List<ProjectModel> _applyFilter(List<ProjectModel> projects) {
    if (_selectedFilter == 'All') return projects;
    return projects.where((p) {
      final status = p.status.toLowerCase();
      if (_selectedFilter == 'Completed') return status == 'completed';
      // Active = anything not completed
      return status != 'completed';
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final projectProvider = context.watch<ProjectProvider>();
    final allProjects = projectProvider.lstMyProject;
    final filtered = _applyFilter(allProjects);

    return Scaffold(
      backgroundColor: Pallete.backgroundColor,
      appBar: AppBar(
        forceMaterialTransparency: true,
        title: const Text(
          "Projects",
          style: TextStyle(
            color: Pallete.whiteColor,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
        iconTheme: const IconThemeData(color: Pallete.whiteColor),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          color: Pallete.accentColor,
          backgroundColor: Pallete.secondaryBackgroundColor,
          onRefresh: _loadProjects,
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                  child: _buildHeaderCard(allProjects.length),
                ),
              ),
              SliverPersistentHeader(
                pinned: true,
                delegate: _FilterBarDelegate(
                  filters: _filters,
                  selected: _selectedFilter,
                  onChanged: (f) => setState(() => _selectedFilter = f),
                ),
              ),
              if (projectProvider.isLoading && allProjects.isEmpty)
                const SliverFillRemaining(
                  hasScrollBody: false,
                  child: Center(
                    child: CircularProgressIndicator(
                      color: Pallete.accentColor,
                    ),
                  ),
                )
              else if (filtered.isEmpty)
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: _buildEmptyState(),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                  sliver: SliverList.separated(
                    itemCount: filtered.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (_, i) => _buildProjectItem(filtered[i]),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  /* ---------------------------- HEADER ----------------------------- */

  Widget _buildHeaderCard(int total) {
    return Container(
      padding: const EdgeInsets.all(18),
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
        border: Border.all(color: Pallete.accentColor.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: Pallete.whiteColor.withOpacity(0.15),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(
              Icons.folder_copy_rounded,
              color: Pallete.whiteColor,
            ),
          ),
          const SizedBox(width: 14),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'My Projects',
                  style: TextStyle(
                    color: Pallete.whiteColor,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Track progress across your assigned work',
                  style: TextStyle(color: Pallete.whiteColor, fontSize: 12),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Pallete.whiteColor.withOpacity(0.18),
              borderRadius: BorderRadius.circular(30),
              border: Border.all(color: Pallete.whiteColor.withOpacity(0.25)),
            ),
            child: Text(
              '$total',
              style: const TextStyle(
                color: Pallete.whiteColor,
                fontWeight: FontWeight.w700,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }

  /* --------------------------- PROJECT CARD ------------------------ */

  Widget _buildProjectItem(ProjectModel project) {
    final startDate = project.startDate;
    final endDate = project.endDate;
    final totalDays = endDate.difference(startDate).inDays;
    final elapsed = DateTime.now().difference(startDate).inDays;
    final progress = totalDays <= 0
        ? 0.0
        : (elapsed / totalDays).clamp(0.0, 1.0).toDouble();
    final daysLeft = endDate.difference(DateTime.now()).inDays;
    final statusColor = _getStatusColor(project.status);

    return InkWell(
      borderRadius: BorderRadius.circular(18),
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => ProjectDetailScreen(projectId: project.id),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Pallete.secondaryBackgroundColor,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: Pallete.outLineColor),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: Pallete.accentColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Pallete.accentColor.withOpacity(0.35),
                    ),
                  ),
                  child: const Icon(
                    Icons.engineering_rounded,
                    color: Pallete.accentColor,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        project.projectName,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Pallete.whiteColor,
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          height: 1.25,
                        ),
                      ),
                      const SizedBox(height: 4),
                      _buildStatusPill(project.status, statusColor),
                    ],
                  ),
                ),
                const Icon(
                  Icons.arrow_forward_ios_rounded,
                  color: Pallete.subHeading,
                  size: 14,
                ),
              ],
            ),
            if (project.description.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                project.description,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Pallete.subHeading,
                  fontSize: 13,
                  height: 1.4,
                ),
              ),
            ],
            const SizedBox(height: 14),
            Container(height: 1, color: Pallete.outLineColor.withOpacity(0.6)),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _metaItem(
                    icon: Icons.calendar_today_rounded,
                    label: DateFormat('dd MMM').format(startDate),
                    sub: DateFormat('dd MMM').format(endDate),
                  ),
                ),
                Container(width: 1, height: 28, color: Pallete.outLineColor),
                Expanded(
                  child: _metaItem(
                    icon: Icons.hourglass_top_rounded,
                    label: '$totalDays',
                    sub: 'days',
                  ),
                ),
                Container(width: 1, height: 28, color: Pallete.outLineColor),
                Expanded(
                  child: _metaItem(
                    icon: daysLeft >= 0
                        ? Icons.timer_rounded
                        : Icons.warning_amber_rounded,
                    label: daysLeft >= 0 ? '$daysLeft' : '${-daysLeft}',
                    sub: daysLeft >= 0 ? 'left' : 'late',
                    accent: daysLeft >= 0
                        ? Pallete.accentColor
                        : Pallete.errorColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 6,
                backgroundColor: Pallete.backgroundColor,
                valueColor: AlwaysStoppedAnimation(statusColor),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _metaItem({
    required IconData icon,
    required String label,
    required String sub,
    Color? accent,
  }) {
    final color = accent ?? Pallete.subHeading;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: color),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(
            color: Pallete.whiteColor,
            fontSize: 13,
            fontWeight: FontWeight.w700,
          ),
        ),
        Text(
          sub,
          style: TextStyle(
            color: color,
            fontSize: 10,
            fontWeight: FontWeight.w500,
            letterSpacing: 0.2,
          ),
        ),
      ],
    );
  }

  Widget _buildStatusPill(String status, Color color) {
    final label = status.isEmpty ? 'Active' : status;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.45)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 5,
            height: 5,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 5),
          Text(
            label.toUpperCase(),
            style: TextStyle(
              color: color,
              fontSize: 10,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.4,
            ),
          ),
        ],
      ),
    );
  }

  /* --------------------------- EMPTY STATE ------------------------- */

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                color: Pallete.accentColor.withOpacity(0.12),
                shape: BoxShape.circle,
                border: Border.all(color: Pallete.accentColor.withOpacity(0.3)),
              ),
              child: const Icon(
                Icons.folder_open_rounded,
                size: 44,
                color: Pallete.accentColor,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'No Projects Found',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 18,
                color: Pallete.whiteColor,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _selectedFilter == 'All'
                  ? 'Projects you’re assigned to will appear here.'
                  : 'No projects match the "$_selectedFilter" filter.',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 13,
                color: Pallete.subHeading,
                height: 1.4,
              ),
            ),
          ],
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

/* ----------------------- STICKY FILTER BAR ------------------------- */

class _FilterBarDelegate extends SliverPersistentHeaderDelegate {
  final List<String> filters;
  final String selected;
  final ValueChanged<String> onChanged;

  const _FilterBarDelegate({
    required this.filters,
    required this.selected,
    required this.onChanged,
  });

  @override
  double get minExtent => 56;

  @override
  double get maxExtent => 56;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return Container(
      color: Pallete.backgroundColor,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        children: filters.map((filter) {
          final isSelected = filter == selected;
          return Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: GestureDetector(
                onTap: () => onChanged(filter),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 220),
                  curve: Curves.easeOutCubic,
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? Pallete.accentColor.withOpacity(0.18)
                        : Pallete.secondaryBackgroundColor,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected
                          ? Pallete.accentColor
                          : Pallete.outLineColor,
                      width: 1.2,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      filter,
                      style: TextStyle(
                        color: isSelected
                            ? Pallete.accentColor
                            : Pallete.subHeading,
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  @override
  bool shouldRebuild(covariant _FilterBarDelegate oldDelegate) {
    return selected != oldDelegate.selected || filters != oldDelegate.filters;
  }
}
