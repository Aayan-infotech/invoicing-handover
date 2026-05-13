import 'dart:io';

import 'package:flutter/material.dart';
import 'package:invoice_app/dash_board_screen/project_details_screen.dart';
import 'package:invoice_app/network/api_services/project_api.dart';
import 'package:invoice_app/network/call_helpar.dart';
import 'package:invoice_app/network/models/doc_model.dart';
import 'package:invoice_app/network/models/doc_type_model.dart';
import 'package:invoice_app/network/models/invoice_model.dart';
import 'package:invoice_app/network/models/notification_model.dart';
import 'package:invoice_app/network/models/project_details_model.dart';
import 'package:invoice_app/network/models/project_model.dart';
import 'package:invoice_app/network/models/task_details_model.dart';
import 'package:http/http.dart' as http;
import 'package:invoice_app/utills/clock_model.dart';

class ProjectProvider extends ChangeNotifier {
  final ProjectAPIs _projectAPIs = ProjectAPIs();

  bool _isLoading = false;
  bool get isLoading => _isLoading;
  List<DocumentType> _documentTypes = [];
  List<InvoiceModel> lstInvoiceModel = [];
  List<DocumentType> get documentTypes => _documentTypes;
  late DocumentModel documentModel;
  bool _isTaskLoading = false;
  bool get isTaskLoading => _isTaskLoading;
  int _currentPage = 1;
  final int _limit = 10;
  bool _hasMoreInvoices = true;
  bool _isFetchingMore = false;
  bool get hasMoreInvoices => _hasMoreInvoices;
  bool get isFetchingMore => _isFetchingMore;
  List<NotificationModel> _notification = [];
  List<NotificationModel> get notifications => _notification;

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _setTaskLoading(bool value) {
    _isTaskLoading = value;
    notifyListeners();
  }

  List<ProjectModel> lstMyProject = [];
  ProjectDetails projectDetails = ProjectDetails(
    id: '',
    projectName: '',
    description: '',
    startDate: DateTime.now(),
    endDate: DateTime.now(),
    status: '',
    tasks: [],
    assignedMembersDetails: [],
  );

  TaskModel? _taskDetails;
  TaskModel? get taskDetails => _taskDetails;
  AttendanceModel attendanceModel = AttendanceModel(
    isClockedIn: false,
    userId: '',
    clockInTime: DateTime.now(),
    latitude: '',
    longitude: '',
    id: '',
    createdAt: DateTime.now(),
    updatedAt: DateTime.now(),
  );

  Future<void> getNotification() async {
    _setLoading(true);
    try {
      final response = await _projectAPIs.getNotification();
      if (response.success) {
        _notification = (response.data['data']['notifications'] as List)
            .map((item) => NotificationModel.fromJson(item))
            .toList();
      } else {
        _notification = [];
      }
    } catch (e) {
      _notification = [];
    } finally {
      _setLoading(false);
    }
  }

  Future<void> clockIn(String latitude, String longitude) async {
    _setLoading(true);
    try {
      final response = await _projectAPIs.clockIn(latitude, longitude);
      if (response.success) {
        attendanceModel = AttendanceModel.fromJson(response.data['data']);
        debugPrint("Clock In Successful: ${response.data}");
      } else {
        debugPrint("Clock In Failed: ${response.message}");
      }
    } catch (e) {
      debugPrint("Clock In Exception: $e");
    }
    _setLoading(false);
  }

  Future<void> loadMoreInvoices() async {
    if (_isFetchingMore || !_hasMoreInvoices) return;

    _isFetchingMore = true;
    notifyListeners();

    try {
      final response = await _projectAPIs.getInvoices(
        page: _currentPage,
        limit: _limit,
      );

      if (response.success) {
        final List list = response.data['data']['projects'] ?? [];

        final invoices = list.map((e) => InvoiceModel.fromJson(e)).toList();

        lstInvoiceModel.addAll(invoices);

        // Check if more data exists
        if (invoices.length < _limit) {
          _hasMoreInvoices = false;
        } else {
          _currentPage++;
        }
      } else {
        debugPrint("Load More Invoice Error: ${response.message}");
      }
    } catch (e) {
      debugPrint("Load More Invoice Exception: $e");
    }

    _isFetchingMore = false;
    notifyListeners();
  }

  Future<void> clockOut(String latitude, String longitude) async {
    _setLoading(true);
    try {
      final response = await _projectAPIs.clockOut(latitude, longitude);
      if (response.success) {
        attendanceModel = AttendanceModel.fromJson(response.data['data']);
        debugPrint("Clock In Successful: ${response.data}");
      } else {
        debugPrint("Clock In Failed: ${response.message}");
      }
    } catch (e) {
      debugPrint("Clock In Exception: $e");
    }
    _setLoading(false);
  }

  Future<ApiResponseWithData> getClockInDetails() async {
    _setLoading(true);
    final response = await _projectAPIs.getClockInDetails();
    if (response.success) {
      attendanceModel = AttendanceModel.fromJson(response.data["data"]);
    }
    _setLoading(false);
    return await response;
  }

  /// Project Details
  Future<void> fetchProjectDetails(String id) async {
    _setLoading(true);
    try {
      final response = await _projectAPIs.getProjectDetails(id);
      if (response.success) {
        projectDetails = ProjectDetails.fromJson(response.data["data"]);
        print(projectDetails);
        //  _projectDetails = response.data;
      } else {
        debugPrint("Project Details Error: ${response.message}");
      }
    } catch (e) {
      debugPrint("Project Details Exception: $e");
    }
    _setLoading(false);
  }

  /// My Projects
  Future<void> fetchMyProjects(String id) async {
    _setLoading(true);
    try {
      final response = await _projectAPIs.getProjectMyProject();
      if (response.success) {
        lstMyProject = (response.data['data']["projects"] as List)
            .map((e) => ProjectModel.fromJson(e))
            .toList();
      } else {
        debugPrint("My Projects Error: ${response.message}");
      }
    } catch (e) {
      debugPrint("My Projects Exception: $e");
    }
    _setLoading(false);
  }

  /// Document Type
  Future<void> fetchDocType(String projectId) async {
    _setLoading(true);
    try {
      final response = await _projectAPIs.getDocType(projectId);
      if (response.success) {
        _documentTypes = response.data['data'] != null
            ? (response.data['data'] as List)
                  .map((item) => DocumentType.fromJson(item))
                  .toList()
            : [];
      } else {
        _documentTypes = [];
        debugPrint("Document Type Error: ${response.message}");
      }
    } catch (e) {
      debugPrint("Document Type Exception: $e");
    }
    _setLoading(false);
  }

  /// Document Details
  Future<void> fetchDocDetails(String docId) async {
    _setLoading(true);
    try {
      final response = await _projectAPIs.getDocDetails(docId);
      if (response.success) {
        documentModel = DocumentModel.fromJson(response.data['data']);
      } else {
        debugPrint("Document Details Error: ${response.message}");
      }
    } catch (e) {
      debugPrint("Document Details Exception: $e");
    }
    _setLoading(false);
  }

  /// Task Details
  Future<void> fetchTaskDetails(String taskId) async {
    _setTaskLoading(true);
    try {
      final response = await _projectAPIs.taskDetails(taskId);
      if (response.success) {
        _taskDetails = TaskModel.fromJson(response.data['data']);
      } else {
        _taskDetails = null;
        debugPrint("Task Details Error: ${response.message}");
      }
    } catch (e) {
      _taskDetails = null;
      debugPrint("Task Details Exception: $e");
    }
    _setTaskLoading(false);
  }

  Future<ApiResponseWithData> getInvoiceUrl(String taskId) async {
    _setLoading(true);
    try {
      final response = await _projectAPIs.getInvoiceUrl(taskId);
      _setLoading(false);
      return response;
    } catch (e) {
      _setLoading(false);
      return ApiResponseWithData('', true);
    }
  }

  Future<void> getAllInvoices({bool refresh = false}) async {
    if (_isFetchingMore) return;

    if (refresh) {
      _currentPage = 1;
      _hasMoreInvoices = true;
      lstInvoiceModel.clear();
    }

    _setLoading(true);

    try {
      final response = await _projectAPIs.getInvoices(
        page: _currentPage,
        limit: _limit,
      );

      if (response.success) {
        final List list = response.data['data']['invoices'] ?? [];

        final invoices = list.map((e) => InvoiceModel.fromJson(e)).toList();

        if (_currentPage == 1) {
          lstInvoiceModel = invoices;
        } else {
          lstInvoiceModel.addAll(invoices);
        }

        // Pagination check
        if (invoices.length < _limit) {
          _hasMoreInvoices = false;
        } else {
          _currentPage++;
        }
      } else {
        debugPrint("Invoice Error: ${response.message}");
      }
    } catch (e) {
      debugPrint("Invoice Exception: $e");
    }

    _setLoading(false);
    notifyListeners();
  }
}
