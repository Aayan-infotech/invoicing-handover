import 'package:flutter/cupertino.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import 'dart:convert';
import 'package:http/http.dart' as http;

import '../../utills/constant.dart';
import '../../utills/shared_pref.dart';
import '../call_helpar.dart';

class ProjectAPIs {
  ProjectAPIs() : super();

  Future<ApiResponseWithData<Map<String, dynamic>>> clockIn(
    String latitude,
    String longitude,
  ) async {
    Map<String, String> data = {"latitude": latitude, "longitude": longitude};

    return await CallHelper().postWithData('projects/clock-in', data, {});
  }

  Future<ApiResponseWithData<Map<String, dynamic>>> clockOut(
    String latitude,
    String longitude,
  ) async {
    Map<String, String> data = {"latitude": latitude, "longitude": longitude};

    return await CallHelper().postWithData('projects/clock-out', data, {});
  }

  Future<ApiResponseWithData> getClockInDetails() async {
    return await CallHelper().getWithData("projects/get-clocking-details", {});
  }

  Future<ApiResponseWithData<Map<String, dynamic>>> getProjectDetails(
    String id,
  ) async {
    return await CallHelper().getWithData('projects/project-details/${id}', {});
  }

  Future<ApiResponseWithData<Map<String, dynamic>>>
  getProjectMyProject() async {
    return await CallHelper().getWithData('projects/my-projects', {});
  }

  Future<ApiResponseWithData<Map<String, dynamic>>> getNotification() async {
    return await CallHelper().getWithData("users/get-notifications", {});
  }

  Future<ApiResponseWithData<Map<String, dynamic>>> getDocType(
    String id,
  ) async {
    Map<String, String> data = {"projectId": id};

    print(data);

    return await CallHelper().getWithData('projects/get-documents/${id}', {});
  }

  Future<ApiResponseWithData<Map<String, dynamic>>> getDocDetails(
    String id,
  ) async {
    return await CallHelper().getWithData('projects/doc-details/${id}', {});
  }

  //
  Future<ApiResponseWithData> taskDetails(String id) async {
    return await CallHelper().getWithData('projects/task-details/${id}', {});
  }

  Future<ApiResponseWithData> getInvoices({
    required int page,
    required int limit,
    String status = 'all',
  }) async {
    final queryParams = {
      'status': status,
      'page': page.toString(),
      'limit': limit.toString(),
    };

    return await CallHelper().getWithData(
      'projects/get-invoice',
      {},
      queryParams: queryParams,
    );
  }

  Future<ApiResponseWithData> getInvoiceUrl(String projectId) async {
    Map<String, String> data = {"projectId": projectId};
    return await CallHelper().postWithData(
      'projects/generate-project-invoice',
      data,
      {},
    );
  }
}
