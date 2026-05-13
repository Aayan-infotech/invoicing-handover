import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:invoice_app/network/models/invoice_model.dart';
import 'package:invoice_app/network/provider/project_provider.dart';
import 'package:invoice_app/utills/app_colors.dart';
import 'package:open_file/open_file.dart';
import 'package:path_provider/path_provider.dart';
import 'package:provider/provider.dart';
import 'package:path/path.dart' as path;

class HomeInvoiceScreen extends StatefulWidget {
  const HomeInvoiceScreen({super.key});

  @override
  State<HomeInvoiceScreen> createState() => _HomeInvoiceScreenState();
}

class _HomeInvoiceScreenState extends State<HomeInvoiceScreen> {
  static const List<String> _tabs = ['All', 'Paid', 'Unpaid', 'Draft'];

  String _selectedTab = 'All';
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _init());
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _init() async {
    final provider = context.read<ProjectProvider>();
    await provider.getAllInvoices(refresh: true);
  }

  void _onScroll() {
    final provider = context.read<ProjectProvider>();
    if (_scrollController.position.pixels ==
        _scrollController.position.maxScrollExtent) {
      provider.loadMoreInvoices();
    }
  }

  // ------------------------- DOWNLOAD -------------------------

  Future<void> _downloadInvoice(InvoiceModel invoice) async {
    try {
      if (invoice.invoiceUrl.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Invoice URL not available')),
        );
        return;
      }
      await _downloadAndOpenFile(invoice);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  Future<void> _downloadAndOpenFile(InvoiceModel invoice) async {
    try {
      final dir = await getApplicationDocumentsDirectory();
      final fileName =
          'Invoice_${invoice.invoiceNumber.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_')}.pdf';
      final filePath = path.join(dir.path, fileName);

      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => const Center(
          child: CircularProgressIndicator(color: Pallete.accentColor),
        ),
      );

      await Dio().download(
        invoice.invoiceUrl,
        filePath,
        options: Options(receiveTimeout: const Duration(seconds: 30)),
      );

      if (!mounted) return;
      Navigator.pop(context);
      await _openDownloadedFile(filePath);
    } catch (e) {
      if (!mounted) return;
      Navigator.pop(context);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Download failed: $e')));
    }
  }

  Future<void> _openDownloadedFile(String filePath) async {
    final result = await OpenFile.open(filePath);
    if (result.type != ResultType.done && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Could not open file: ${result.message}'),
          action: SnackBarAction(
            label: 'RETRY',
            onPressed: () => _openDownloadedFile(filePath),
          ),
        ),
      );
    }
  }

  // --------------------------- UI ---------------------------

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Pallete.backgroundColor,
      appBar: AppBar(
        forceMaterialTransparency: true,
        centerTitle: true,
        title: const Text(
          'Invoices',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: Pallete.whiteColor,
          ),
        ),
        iconTheme: const IconThemeData(color: Pallete.whiteColor),
      ),
      body: SafeArea(
        child: Consumer<ProjectProvider>(
          builder: (_, provider, __) {
            final filtered = _filter(provider.lstInvoiceModel);
            return RefreshIndicator(
              color: Pallete.accentColor,
              backgroundColor: Pallete.secondaryBackgroundColor,
              onRefresh: _init,
              child: CustomScrollView(
                controller: _scrollController,
                physics: const AlwaysScrollableScrollPhysics(),
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
                      child: _buildHeroCard(provider.lstInvoiceModel),
                    ),
                  ),
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                      child: _buildSearchBar(),
                    ),
                  ),
                  SliverToBoxAdapter(child: _buildTabs()),
                  if (provider.isLoading && provider.lstInvoiceModel.isEmpty)
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
                        itemCount:
                            filtered.length +
                            (provider.hasMoreInvoices ? 1 : 0),
                        separatorBuilder: (_, __) =>
                            const SizedBox(height: 12),
                        itemBuilder: (_, index) {
                          if (index == filtered.length) {
                            return const Padding(
                              padding: EdgeInsets.all(16),
                              child: Center(
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Pallete.accentColor,
                                ),
                              ),
                            );
                          }
                          return _buildInvoiceItem(filtered[index]);
                        },
                      ),
                    ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  // --------------------------- HERO -------------------------

  Widget _buildHeroCard(List<InvoiceModel> all) {
    final total = all.fold<int>(0, (sum, i) => sum + i.amount);
    final paid = all
        .where((i) => i.status.toLowerCase() == 'paid')
        .fold<int>(0, (sum, i) => sum + i.amount);
    final unpaid = all
        .where((i) => i.status.toLowerCase() == 'unpaid')
        .fold<int>(0, (sum, i) => sum + i.amount);

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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: Pallete.whiteColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.receipt_long_rounded,
                  color: Pallete.whiteColor,
                ),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Total Billed',
                      style: TextStyle(
                        color: Pallete.whiteColor,
                        fontSize: 12,
                        letterSpacing: 0.3,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            _formatMoney(total),
            style: const TextStyle(
              color: Pallete.whiteColor,
              fontSize: 28,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.3,
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: _heroStat(
                  label: 'PAID',
                  value: _formatMoney(paid),
                  color: Pallete.successColor,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _heroStat(
                  label: 'UNPAID',
                  value: _formatMoney(unpaid),
                  color: Pallete.errorColor,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _heroStat({
    required String label,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Pallete.whiteColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: const TextStyle(
                  color: Pallete.whiteColor,
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.4,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: Pallete.whiteColor,
              fontSize: 15,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  // --------------------------- SEARCH -----------------------

  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: Pallete.secondaryBackgroundColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Pallete.outLineColor),
      ),
      child: TextField(
        controller: _searchController,
        onChanged: (_) => setState(() {}),
        style: const TextStyle(color: Pallete.whiteColor),
        cursorColor: Pallete.accentColor,
        decoration: InputDecoration(
          hintText: 'Search by project or task…',
          hintStyle: const TextStyle(color: Pallete.subHeading, fontSize: 13),
          prefixIcon: const Icon(
            Icons.search_rounded,
            color: Pallete.subHeading,
            size: 20,
          ),
          suffixIcon: _searchController.text.isEmpty
              ? null
              : IconButton(
                  icon: const Icon(
                    Icons.close_rounded,
                    color: Pallete.subHeading,
                    size: 18,
                  ),
                  onPressed: () {
                    _searchController.clear();
                    setState(() {});
                  },
                ),
          border: InputBorder.none,
          enabledBorder: InputBorder.none,
          focusedBorder: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 14),
        ),
      ),
    );
  }

  // ---------------------------- TABS -------------------------

  Widget _buildTabs() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: _tabs.map((t) => Expanded(child: _buildTab(t))).toList(),
      ),
    );
  }

  Widget _buildTab(String title) {
    final isSelected = _selectedTab == title;
    return GestureDetector(
      onTap: () => setState(() => _selectedTab = title),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 220),
        curve: Curves.easeOutCubic,
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected
              ? Pallete.accentColor.withOpacity(0.18)
              : Pallete.secondaryBackgroundColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? Pallete.accentColor : Pallete.outLineColor,
            width: 1.2,
          ),
        ),
        child: Center(
          child: Text(
            title,
            style: TextStyle(
              color: isSelected ? Pallete.accentColor : Pallete.subHeading,
              fontWeight: FontWeight.w600,
              fontSize: 13,
            ),
          ),
        ),
      ),
    );
  }

  // ---------------------- INVOICE ITEM CARD ------------------

  Widget _buildInvoiceItem(InvoiceModel invoice) {
    final statusColor = _getStatusColor(invoice.status);

    return Container(
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
                  Icons.receipt_rounded,
                  color: Pallete.accentColor,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      invoice.projectName.isEmpty
                          ? 'Untitled Project'
                          : invoice.projectName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: Pallete.whiteColor,
                      ),
                    ),
                    const SizedBox(height: 3),
                    if (invoice.taskName.isNotEmpty)
                      Text(
                        invoice.taskName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Pallete.subHeading,
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              _statusPill(invoice.status, statusColor),
            ],
          ),
          const SizedBox(height: 14),
          Container(height: 1, color: Pallete.outLineColor.withOpacity(0.6)),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      invoice.invoiceNumber.isEmpty
                          ? '—'
                          : '#${invoice.invoiceNumber}',
                      style: const TextStyle(
                        color: Pallete.subHeading,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.3,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _formatMoney(invoice.amount),
                      style: const TextStyle(
                        color: Pallete.whiteColor,
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(
                          Icons.calendar_today_rounded,
                          size: 11,
                          color: Pallete.subHeading,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          DateFormat(
                            'dd MMM yyyy',
                          ).format(invoice.invoiceDate),
                          style: const TextStyle(
                            color: Pallete.subHeading,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              ElevatedButton.icon(
                onPressed: () => _downloadInvoice(invoice),
                icon: const Icon(Icons.download_rounded, size: 16),
                label: const Text(
                  'Download',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Pallete.primaryColor,
                  foregroundColor: Pallete.whiteColor,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 10,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  elevation: 0,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _statusPill(String status, Color color) {
    final label = status.isEmpty ? 'draft' : status;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
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

  // ------------------------- EMPTY STATE --------------------

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 88,
              height: 88,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Pallete.accentColor.withOpacity(0.12),
                border: Border.all(
                  color: Pallete.accentColor.withOpacity(0.3),
                ),
              ),
              child: const Icon(
                Icons.receipt_long_rounded,
                size: 42,
                color: Pallete.accentColor,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'No Invoices Found',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: Pallete.whiteColor,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              _searchController.text.isNotEmpty
                  ? 'No invoices match your search.'
                  : _selectedTab == 'All'
                      ? 'Invoices you generate will appear here.'
                      : 'No ${_selectedTab.toLowerCase()} invoices yet.',
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

  // --------------------------- HELPERS ----------------------

  List<InvoiceModel> _filter(List<InvoiceModel> invoices) {
    final search = _searchController.text.toLowerCase().trim();
    return invoices.where((inv) {
      if (_selectedTab != 'All' &&
          inv.status.toLowerCase() != _selectedTab.toLowerCase()) {
        return false;
      }
      if (search.isEmpty) return true;
      return inv.projectName.toLowerCase().contains(search) ||
          inv.taskName.toLowerCase().contains(search) ||
          inv.invoiceNumber.toLowerCase().contains(search);
    }).toList();
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'paid':
        return Pallete.successColor;
      case 'unpaid':
        return Pallete.errorColor;
      case 'draft':
        return Pallete.warmLeadIconColor;
      default:
        return Pallete.accentColor;
    }
  }

  String _formatMoney(int amount) {
    final f = NumberFormat.currency(symbol: '\$', decimalDigits: 0);
    return f.format(amount);
  }
}
