import Project from "../models/project.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Task from "../models/task.model.js";
import AssignTask from "../models/assignTask.model.js";
import QualityAssurance from "../models/qualityAssurance.model.js";
import Attendance from "../models/attendance.model.js";
import { isValidObjectId } from "../utils/isValidObjectId.js";
import mongoose from "mongoose";
import { deleteObject, uploadImage } from "../utils/awsS3Utils.js";
import taskUpdateHistoryModel from "../models/taskUpdateHistory.model.js";
import {
  generateInvoice,
  downloadPDF,
  uploadInvoiceToS3,
} from "../services/generateInvoice.js";
import Invoice from "../models/Invoices.model.js";
import { DeviceDetails } from "../models/deviceDetails.model.js";
import sendPushNotification from "../utils/sendPushNotification.js";
import ProjectTask from "../models/Projecttask.model.js";
import {
  distance,
  generateUniqueInvoiceNumber,
} from "../utils/HelperFunctions.js";
import DocumentType from "../models/documentType.model.js";
import PDFMerger from "pdf-merger-js";
import ProjectInvoice from "../models/projectInvoice.model.js";
import { User } from "../models/user.model.js";

const getAllProjects = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const { search, sortBy, sortDirection } = req.query;

  const pipeline = [];

  // 1 ── optional text search
  if (search) {
    pipeline.push({
      $match: { $or: [{ projectName: { $regex: search, $options: "i" } }] },
    });
  }

  // 2 ── join project tasks
  pipeline.push({
    $lookup: {
      from: "projecttasks",
      localField: "_id",
      foreignField: "projectId",
      as: "projectTasks",
    },
  });

  // 3 ── unwind (preserve projects with zero tasks)
  pipeline.push({
    $unwind: { path: "$projectTasks", preserveNullAndEmptyArrays: true },
  });

  // 4 ── group back to one doc per project; accumulate task stats
  pipeline.push({
    $group: {
      _id: "$_id",
      projectName: { $first: "$projectName" },
      description: { $first: "$description" },
      startDate: { $first: "$startDate" },
      endDate: { $first: "$endDate" },
      status: { $first: "$status" },
      createdAt: { $first: "$createdAt" },

      // total units that have been completed across all tasks
      completedTasks: {
        $sum: { $ifNull: ["$projectTasks.taskCompletedQuantity", 0] },
      },
      // total units planned across all tasks
      totalTasks: {
        $sum: { $ifNull: ["$projectTasks.taskQuantity", 0] },
      },
      // contract value = Σ (unit_rate × planned_quantity) per task
      totalAmount: {
        $sum: {
          $multiply: [
            { $ifNull: ["$projectTasks.amount", 0] },
            { $ifNull: ["$projectTasks.taskQuantity", 0] },
          ],
        },
      },
    },
  });

  // 5 ── derive completedPercentage
  pipeline.push({
    $addFields: {
      completedPercentage: {
        $cond: [
          { $gt: ["$totalTasks", 0] },
          {
            $round: [
              {
                $multiply: [
                  { $divide: ["$completedTasks", "$totalTasks"] },
                  100,
                ],
              },
              0,
            ],
          },
          0,
        ],
      },
    },
  });

  // 6 ── sort
  pipeline.push({
    $sort: {
      [sortBy || "createdAt"]: sortDirection === "asc" ? 1 : -1,
    },
  });

  // 7 ── paginate + count in a single pass
  pipeline.push({
    $facet: {
      projects: [
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            projectName: 1,
            description: 1,
            startDate: 1,
            endDate: 1,
            status: 1,
            completedTasks: 1,
            totalTasks: 1,
            totalAmount: { $round: ["$totalAmount", 2] },
            completedPercentage: 1,
          },
        },
      ],
      totalCount: [{ $count: "count" }],
    },
  });

  const result = await Project.aggregate(pipeline);

  const projects = result[0].projects;
  const totalRecords = result[0].totalCount[0]?.count ?? 0;
  const totalPages = Math.ceil(totalRecords / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      projects.length > 0
        ? "Fetched all projects successfully"
        : "No projects found",
      projects.length > 0
        ? {
            projects,
            total_page: totalPages,
            current_page: page,
            total_records: totalRecords,
            per_page: limit,
          }
        : null
    )
  );
});

const addProject = asyncHandler(async (req, res) => {
  const { projectName, description, startDate, endDate } = req.body;

  // check the save name is already exists
  const existProjectName = await Project.findOne({ projectName });
  if (existProjectName) {
    throw new ApiError(400, "Project with same name is Already exists.");
  }

  const newProject = new Project({
    projectName,
    description,
    startDate,
    endDate,
  });

  await newProject.save();

  return res
    .status(201)
    .json(new ApiResponse(201, "Project created successfully", newProject));
});

const updateProject = asyncHandler(async (req, res) => {
  const projectId = req.params.projectId;
  const { projectName, description, startDate, endDate, status } = req.body;

  if (!isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.status === "completed") {
    throw new ApiError(400, "Cannot update a completed project");
  }

  if (projectName && projectName !== project.projectName) {
    const existingProject = await Project.findOne({
      projectName: projectName,
      _id: { $ne: projectId },
    });

    if (existingProject) {
      throw new ApiError(400, "Project name already exists");
    }
  }

  if (projectName) project.projectName = projectName;
  if (description) project.description = description;
  if (startDate) project.startDate = startDate;
  if (endDate) project.endDate = endDate;
  if (status) project.status = status;

  const updatedProject = await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Project updated successfully", updatedProject));
});

const deleteProject = asyncHandler(async (req, res) => {
  const projectId = req.params.projectId;
  await Project.findByIdAndDelete(projectId);
  return res
    .status(200)
    .json(new ApiResponse(200, "Project deleted successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const pipeline = [];

  // 1 ── match specific project by ID
  pipeline.push({
    $match: { _id: new mongoose.Types.ObjectId(id) },
  });

  // 2 ── join project tasks
  pipeline.push({
    $lookup: {
      from: "projecttasks",
      localField: "_id",
      foreignField: "projectId",
      as: "projectTasks",
    },
  });

  // 3 ── unwind (preserve projects with zero tasks)
  pipeline.push({
    $unwind: { path: "$projectTasks", preserveNullAndEmptyArrays: true },
  });

  // 4 ── group back to one doc per project; accumulate task stats
  pipeline.push({
    $group: {
      _id: "$_id",
      projectName: { $first: "$projectName" },
      description: { $first: "$description" },
      startDate: { $first: "$startDate" },
      endDate: { $first: "$endDate" },
      status: { $first: "$status" },
      createdAt: { $first: "$createdAt" },
      updatedAt: { $first: "$updatedAt" },

      completedTasks: {
        $sum: { $ifNull: ["$projectTasks.taskCompletedQuantity", 0] },
      },
      totalTasks: {
        $sum: { $ifNull: ["$projectTasks.taskQuantity", 0] },
      },
      totalAmount: {
        $sum: {
          $multiply: [
            { $ifNull: ["$projectTasks.amount", 0] },
            { $ifNull: ["$projectTasks.taskQuantity", 0] },
          ],
        },
      },
    },
  });

  // 5 ── derive completedPercentage
  pipeline.push({
    $addFields: {
      completedPercentage: {
        $cond: [
          { $gt: ["$totalTasks", 0] },
          {
            $round: [
              {
                $multiply: [
                  { $divide: ["$completedTasks", "$totalTasks"] },
                  100,
                ],
              },
              0,
            ],
          },
          0,
        ],
      },
    },
  });

  // 6 ── project the final output
  pipeline.push({
    $project: {
      _id: 1,
      projectName: 1,
      description: 1,
      startDate: 1,
      endDate: 1,
      status: 1,
      createdAt: 1,
      updatedAt: 1,
      completedTasks: 1,
      totalTasks: 1,
      totalAmount: { $round: ["$totalAmount", 2] },
      completedPercentage: 1,
    },
  });

  const result = await Project.aggregate(pipeline);

  if (!result || result.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, "Project not found", null));
  }

  const project = result[0];

  return res
    .status(200)
    .json(new ApiResponse(200, "Project fetched successfully", project));
});

const getProjectDropDown = asyncHandler(async (req, res) => {
  const projects = await Project.find({ status: "active" }).select(
    "projectName"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, "Get Project dropdown successfully", projects));
});

const getTaskDropDown = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ status: "active" }).select(
    "taskName amount _id"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, "Get Task dropdown successfully", tasks));
});

const getAllTasks = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const { sortBy, sortDirection, search } = req.query;

  const aggregation = [];

  if (search) {
    aggregation.push({
      $match: { taskName: { $regex: search, $options: "i" } },
    });
  }

  // aggregation.push({
  //     $lookup: {
  //         from: "projects",
  //         localField: "projectId",
  //         foreignField: "_id",
  //         as: "projectDetails"
  //     }
  // });

  // aggregation.push({
  //     $unwind: {
  //         path: "$projectDetails",
  //         preserveNullAndEmptyArrays: true
  //     }
  // });

  aggregation.push({
    $sort: {
      [sortBy ? sortBy : "createdAt"]: sortDirection === "asc" ? 1 : -1,
    },
  });

  aggregation.push({
    $facet: {
      tasks: [{ $skip: skip }, { $limit: limit }, { $project: { __v: 0 } }],
      totalCount: [{ $count: "count" }],
    },
  });

  const result = await Task.aggregate(aggregation);

  const tasks = result[0].tasks;

  const totalRecords =
    result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json(
    new ApiResponse(
      200,
      tasks.length > 0 ? "Fetched all tasks successfully" : "No tasks found",
      tasks.length > 0
        ? {
            tasks,
            total_page: totalPages,
            current_page: page,
            total_records: totalRecords,
            per_page: limit,
          }
        : null
    )
  );
});

const addTask = asyncHandler(async (req, res) => {
  const { taskName, amount, description } = req.body;

  if (!taskName) {
    throw new ApiError(400, "Task name is required");
  }

  // Check if the same task already exists in the project
  const existingTask = await Task.findOne({ taskName });
  if (existingTask) {
    throw new ApiError(409, "Task with the same name already exists");
  }

  const task = await Task.create({
    taskName,
    amount,
    description,
  });

  if (!task) {
    throw new ApiError(400, "Failed to save the task");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Task created successfully", task));
});

const updateTask = asyncHandler(async (req, res) => {
  const taskId = req.params.taskId;
  const { taskName, amount, status, description } = req.body;

  if (!isValidObjectId(taskId)) {
    throw new ApiError(400, "Invalid task ID");
  }

  const existingTask = await Task.findById(taskId);
  if (!existingTask) {
    throw new ApiError(404, "Task not found");
  }

  const duplicateTask = await Task.findOne({ _id: { $ne: taskId }, taskName });
  if (duplicateTask) {
    throw new ApiError(409, "Task with the same name already exists");
  }

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    {
      taskName,
      amount,
      status,
      description,
    },
    { new: true }
  );

  if (!updatedTask) {
    throw new ApiError(404, "Task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Task updated successfully", updatedTask));
});

const deleteTask = asyncHandler(async (req, res) => {
  const taskId = req.params.taskId;
  const deletedTask = await Task.findByIdAndDelete(taskId);
  if (!deletedTask) {
    throw new ApiError(404, "Task not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Task deleted successfully"));
});

const getAllProjectTasks = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const { search, sortBy, sortDirection } = req.query;

  const aggregation = [];

  aggregation.push({
    $lookup: {
      from: "projects",
      localField: "projectId",
      foreignField: "_id",
      as: "projectDetails",
    },
  });

  aggregation.push({
    $unwind: {
      path: "$projectDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $lookup: {
      from: "tasks",
      localField: "taskId",
      foreignField: "_id",
      as: "taskDetails",
    },
  });

  aggregation.push({
    $unwind: {
      path: "$taskDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  if (search) {
    aggregation.push({
      $match: {
        $or: [
          { "taskDetails.taskName": { $regex: search, $options: "i" } },
          { "projectDetails.projectName": { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
          { amount: { $regex: search, $options: "i" } },
          { taskQuantity: { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  if (sortBy) {
    const sortFields = {
      projectName: "projectDetails.projectName",
      taskName: "taskDetails.taskName",
      amount: "amount",
      taskQuantity: "taskQuantity",
      status: "status",
      createdAt: "createdAt",
    };

    const sortField = sortFields[sortBy] || "createdAt";

    aggregation.push({
      $sort: { [sortField]: sortDirection === "asc" ? 1 : -1 },
    });
  } else {
    aggregation.push({
      $sort: { createdAt: -1 },
    });
  }

  aggregation.push({
    $facet: {
      projectTasks: [
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            projectId: "$projectDetails._id",
            projectName: "$projectDetails.projectName",
            taskId: "$taskDetails._id",
            taskName: "$taskDetails.taskName",
            amount: 1,
            taskQuantity: 1,
            status: 1,
            description: 1,
            taskUpdateDescription: 1,
            taskUpdatePhotos: 1,
            taskUpdateDocuments: 1,
            updateBy: 1,
            invoiceUrl: 1,
          },
        },
      ],
      totalCount: [{ $count: "count" }],
    },
  });

  const result = await ProjectTask.aggregate(aggregation);

  const projectTasks = result[0].projectTasks;

  const totalRecords =
    result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json(
    new ApiResponse(
      200,
      projectTasks.length > 0
        ? "Fetched all project tasks successfully"
        : "No project tasks found",
      projectTasks.length > 0
        ? {
            projectTasks,
            total_page: totalPages,
            current_page: page,
            total_records: totalRecords,
            per_page: limit,
          }
        : null
    )
  );
});

const addProjectTask = asyncHandler(async (req, res) => {
  const { projectId, amount, taskId, taskQuantity, description } = req.body;

  if (!projectId || !taskId || !taskQuantity || !description) {
    throw new ApiError(400, "Missing required fields");
  }
  if (!isValidObjectId(projectId) || !isValidObjectId(taskId)) {
    throw new ApiError(400, "Invalid project ID or task ID");
  }

  // Check if the project exists
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Check if the task exists
  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Existing task
  const existingTask = await ProjectTask.findOne({ projectId, taskId });
  if (existingTask) {
    throw new ApiError(409, "Task already exists in the project");
  }

  const projectTask = await ProjectTask.create({
    projectId,
    taskId,
    amount,
    taskQuantity,
    description,
  });

  if (!projectTask) {
    throw new ApiError(400, "Failed to create project task");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Project task created successfully", projectTask)
    );
});

const getAllTaskofProject = asyncHandler(async (req, res) => {
  const projectId = req.params.projectId;
  // const tasks = await ProjectTask.find({ projectId }).select('taskName _id').sort({ createdAt: -1 });
  // if (!tasks || tasks.length === 0) {
  //     throw new ApiError(404, 'No tasks found');
  // }
  // return res.status(200).json(new ApiResponse(200, "Tasks fetched successfully", tasks));

  const aggregation = [];
  aggregation.push({
    $match: { projectId: new mongoose.Types.ObjectId(projectId) },
  });
  aggregation.push({
    $lookup: {
      from: "tasks",
      localField: "taskId",
      foreignField: "_id",
      as: "taskDetails",
    },
  });

  aggregation.push({
    $unwind: {
      path: "$taskDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $project: {
      _id: 1,
      taskName: "$taskDetails.taskName",
    },
  });

  const tasks = await ProjectTask.aggregate(aggregation);

  if (!tasks || tasks.length === 0) {
    throw new ApiError(404, "No tasks found for this project");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Tasks fetched successfully", tasks));
});

const getAssignTasks = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  let { search, sortBy, sortDirection } = req.query;
  if (sortBy === "taskName") {
    sortBy = "taskDetails.taskName";
  } else if (sortBy === "projectName") {
    sortBy = "projectDetails.projectName";
  } else if (sortBy === "name") {
    sortBy = "userDetails.name";
  } else if (sortBy === "username") {
    sortBy = "userDetails.username";
  }
  const aggregation = [];
  aggregation.push({
    $lookup: {
      from: "projects",
      localField: "projectId",
      foreignField: "_id",
      as: "projectDetails",
    },
  });
  aggregation.push({
    $unwind: {
      path: "$projectDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "userId",
      as: "userDetails",
    },
  });

  aggregation.push({
    $unwind: {
      path: "$userDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $lookup: {
      from: "tasks",
      localField: "taskId",
      foreignField: "_id",
      as: "taskDetails",
    },
  });

  aggregation.push({
    $unwind: {
      path: "$taskDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  if (search) {
    aggregation.push({
      $match: {
        $or: [
          { "taskDetails.taskName": { $regex: search, $options: "i" } },
          { "projectDetails.projectName": { $regex: search, $options: "i" } },
          { "userDetails.name": { $regex: search, $options: "i" } },
          { "userDetails.username": { $regex: search, $options: "i" } },
        ],
      },
    });
  }
  // if(sortBy) {
  //   if (sortBy === "taskName") {
  //     aggregation.push({
  //       $sort: { "taskDetails.taskName": sortDirection === "asc" ? 1 : -1 },
  //     });
  //   }
  // }

  aggregation.push({
    $sort: {
      [sortBy ? sortBy : "createdAt"]: sortDirection === "asc" ? 1 : -1,
    },
  });

  aggregation.push({
    $facet: {
      tasks: [
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            taskId: "$projectTaskId",
            taskName: "$taskDetails.taskName",
            projectId: "$projectDetails._id",
            projectName: "$projectDetails.projectName",
            userId: "$userDetails.userId",
            name: "$userDetails.name",
            username: "$userDetails.username",
          },
        },
      ],
      totalCount: [{ $count: "count" }],
    },
  });

  const result = await AssignTask.aggregate(aggregation);

  const tasks = result[0].tasks;

  const totalRecords =
    result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json(
    new ApiResponse(
      200,
      tasks.length > 0
        ? "Fetched all assigned tasks successfully"
        : "No assigned tasks found",
      tasks.length > 0
        ? {
            tasks,
            total_page: totalPages,
            current_page: page,
            total_records: totalRecords,
            per_page: limit,
          }
        : null
    )
  );
});

const assignTask = asyncHandler(async (req, res) => {
  const { taskId, projectId, userId } = req.body;
  if (!taskId || !projectId || !userId) {
    throw new ApiError(400, "Missing required fields");
  }

  if (!isValidObjectId(taskId)) {
    throw new ApiError(400, "Invalid task ID");
  }

  const projectTask = await ProjectTask.findById(taskId).populate(
    "taskId",
    "taskName amount"
  );
  if (!projectTask) {
    throw new ApiError(404, "Project Task not found");
  }

  const existingAssignment = await AssignTask.findOne({
    taskId: projectTask.taskId,
    projectTaskId: projectTask._id,
    projectId,
    userId,
  });
  if (existingAssignment) {
    throw new ApiError(
      409,
      "Task is already assigned to this user for this project"
    );
  }

  const user = await User.findOne({ userId }).select("name email");

  // Get the Device details
  const deviceDetails = await DeviceDetails.find({
    userId,
    deviceType: { $in: ["android", "ios"] },
    isLoggedIn: true,
  }).select("deviceToken");
  if (deviceDetails && deviceDetails.length > 0) {
    // Send Push Notification to the user
    const deviceTokens = deviceDetails.map((device) => device.deviceToken);
    await sendPushNotification(
      deviceTokens,
      `Hello! ${user.name}, A New Task Assigned`,
      `You have been assigned a new task: on ${projectTask.taskId.taskName} `,
      req.user.userId,
      userId,
      {
        type: "task_assigned",
        task: JSON.stringify(projectTask.taskId),
      }
    );
  }

  projectTask.assignedTo = userId;
  const status = await projectTask.save();
  if (!status) {
    throw new ApiError(500, "Failed to assign task");
  }
  const newAssignment = new AssignTask({
    taskId: projectTask.taskId,
    projectTaskId: projectTask._id,
    projectId,
    userId,
  });
  await newAssignment.save();
  if (!newAssignment) {
    throw new ApiError(500, "Failed to create task assignment");
  }

  res
    .status(201)
    .json(new ApiResponse(201, "Task assigned successfully", newAssignment));
});

const updateAssignTask = asyncHandler(async (req, res) => {
  const { taskId, projectId, userId } = req.body;
  const assignmentId = req.params.assignmentId;

  if (!taskId || !projectId || !userId) {
    throw new ApiError(400, "taskId, projectId and userId are required");
  }

  // get the projectTaskid
  const projectTask = await ProjectTask.findById(taskId);
  if (!projectTask) {
    throw new ApiError(404, "Project Task not found");
  }

  // check this task is already assigned to the user
  const existingAssignment = await AssignTask.findOne({
    taskId: projectTask.taskId,
    projectTaskId: projectTask._id,
    projectId,
    userId,
  });
  if (existingAssignment) {
    throw new ApiError(
      409,
      "Task is already assigned to this user for this project"
    );
  }

  const updatedAssignment = await AssignTask.findByIdAndUpdate(assignmentId, {
    taskId: projectTask.taskId,
    projectId,
    userId,
    projectTaskId: projectTask._id,
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Task assignment updated successfully",
        updatedAssignment
      )
    );
});

const deleteAssignedTask = asyncHandler(async (req, res) => {
  const assignmentId = req.params.assignmentId;
  const deletedAssignment = await AssignTask.findByIdAndDelete(assignmentId);
  if (!deletedAssignment) {
    throw new ApiError(404, "Assignment not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Task assignment deleted successfully"));
});

const getQualityAssurance = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  let { search, sortBy, sortDirection } = req.query;
  if (sortBy === "projectName") {
    sortBy = "projectDetails.projectName";
  } else if (sortBy === "documentName") {
    sortBy = "documentTypeDetails.name";
  }

  const aggregation = [];
  aggregation.push({
    $lookup: {
      from: "projects",
      localField: "projectId",
      foreignField: "_id",
      as: "projectDetails",
    },
  });
  aggregation.push({
    $unwind: {
      path: "$projectDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $lookup: {
      from: "documenttypes",
      localField: "documentTypeId",
      foreignField: "_id",
      as: "documentTypeDetails",
    },
  });

  aggregation.push({
    $unwind: {
      path: "$documentTypeDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  if (search || search === "") {
    aggregation.push({
      $match: {
        $or: [
          { "projectDetails.projectName": { $regex: search, $options: "i" } },
          { "documentTypeDetails.name": { $regex: search, $options: "i" } },
        ],
      },
    });
  }
  aggregation.push({
    $sort: {
      [sortBy ? sortBy : "createdAt"]: sortDirection === "asc" ? 1 : -1,
    },
  });

  aggregation.push({
    $facet: {
      qualityAssurances: [
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            projectName: "$projectDetails.projectName",
            projectId: "$projectDetails._id",
            documentName: "$documentTypeDetails.name",
            documentTypeId: "$documentTypeDetails._id",
            documentFile: 1,
            status: 1,
            _id: 1,
          },
        },
      ],
      totalCount: [{ $count: "count" }],
    },
  });

  const result = await QualityAssurance.aggregate(aggregation);
  const qualityAssurances = result[0].qualityAssurances;
  const totalRecords =
    result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
  const totalPages = Math.ceil(totalRecords / limit);
  res.status(200).json(
    new ApiResponse(
      200,
      qualityAssurances.length > 0
        ? "Fetched all quality assurances successfully"
        : "No quality assurances found",
      qualityAssurances.length > 0
        ? {
            qualityAssurances,
            total_page: totalPages,
            current_page: page,
            total_records: totalRecords,
            per_page: limit,
          }
        : null
    )
  );
});

const addQualityAssurance = asyncHandler(async (req, res) => {
  const { projectId, documentTypeId } = req.body;

  const existdocument = await QualityAssurance.findOne({
    projectId,
    documentTypeId,
  });
  if (existdocument) {
    throw new ApiError(400, "Document already exists");
  }

  let documentFile = null;

  if (req.files?.documentFile?.length > 0) {
    const file = req.files.documentFile[0];
    documentFile = file.location;
  } else {
    throw new ApiError(400, "Document file is required");
  }

  const newQualityAssurance = new QualityAssurance({
    projectId,
    documentTypeId,
    documentFile: documentFile,
    typeOfDocument: "file",
  });
  await newQualityAssurance.save();

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Quality assurance document added successfully",
        newQualityAssurance
      )
    );
});

const updateQualityAssurance = asyncHandler(async (req, res) => {
  const qualityAssuranceId = req.params.qaId;
  if (!isValidObjectId(qualityAssuranceId)) {
    throw new ApiError(400, "Invalid quality assurance ID");
  }
  const qualityAssurance = await QualityAssurance.findById(qualityAssuranceId);
  if (!qualityAssurance) {
    throw new ApiError(404, "Quality assurance document not found");
  }
  const { projectId, documentTypeId } = req.body;
  if (!projectId || !documentTypeId) {
    throw new ApiError(400, "Project ID and Document Type ID are required");
  }

  let documentFile = qualityAssurance.documentFile;
  if (req.files?.documentFile?.length > 0) {
    const file = req.files.documentFile[0];
    documentFile = file.location;
  }

  const updatedQualityAssurance = await QualityAssurance.findByIdAndUpdate(
    qualityAssuranceId,
    {
      projectId,
      documentTypeId,
      documentFile,
    },
    { new: true }
  );

  if (!updatedQualityAssurance) {
    throw new ApiError(404, "Quality assurance document not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Quality assurance document updated successfully",
        updatedQualityAssurance
      )
    );
});

const deleteQualityAssurance = asyncHandler(async (req, res) => {
  const qualityAssuranceId = req.params.qaId;
  const deletedQualityAssurance =
    await QualityAssurance.findByIdAndDelete(qualityAssuranceId);
  if (!deletedQualityAssurance) {
    throw new ApiError(404, "Quality assurance document not found");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, "Quality assurance document deleted successfully")
    );
});

const clockIn = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;
  if (!latitude || !longitude) {
    throw new ApiError(400, "Latitude and Longitude are required");
  }
  const user = req.user;
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if the user has already clocked in today
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );
  const existingAttendance = await Attendance.findOne({
    userId: user.userId,
    clockInTime: { $gte: startOfDay, $lt: endOfDay },
  });
  if (existingAttendance) {
    throw new ApiError(400, "You have already clocked in today");
  }

  const attendance = await Attendance.create({
    userId: user.userId,
    clockInTime: new Date(),
    latitude,
    longitude,
  });
  if (!attendance) {
    throw new ApiError(500, "Failed to clock in");
  }

  res.status(201).json(new ApiResponse(201, "Clock-in successful", attendance));
});

const clockOut = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;
  if (!latitude || !longitude) {
    throw new ApiError(400, "Latitude and Longitude are required");
  }

  const user = req.user;
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

  const attendance = await Attendance.findOne({
    userId: user.userId,
    clockInTime: { $gte: startOfDay, $lt: endOfDay },
  });

  if (!attendance) {
    throw new ApiError(404, "No clock-in record found for today");
  }

  const currentLocation = { lat: latitude, lon: longitude };
  const ClockedInLocation = {
    lat: attendance.latitude,
    lon: attendance.longitude,
  };

  const dist = distance(currentLocation, ClockedInLocation);

  if (dist > 100) {
    // Assuming 100 meters is the allowed distance
    throw new ApiError(
      400,
      `You are too far from your clock-in location to clock out. Distance: ${dist} meters`
    );
  }

  // update the clock-out time
  attendance.clockOutTime = new Date();
  attendance.isClockedIn = false;
  const updatedAttendance = await attendance.save();
  if (!updatedAttendance) {
    throw new ApiError(500, "Failed to clock out");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Clock-out successful", updatedAttendance));
});

const getTodayClockingDetails = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

  const attendance = await Attendance.findOne({
    userId: user.userId,
    clockInTime: { $gte: startOfDay, $lt: endOfDay },
  });

  if (!attendance) {
    throw new ApiError(404, "No clock-in record found for today");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Today clocking details fetched successfully",
        attendance
      )
    );
});
const getProjectDetails = asyncHandler(async (req, res) => {
  const projectId = req.params.projectId;
  const loggedInUserId = req.user.userId;
  if (!isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const aggregation = [];

  aggregation.push({
    $match: { _id: project._id },
  });

  aggregation.push({
    $lookup: {
      from: "assigntasks",
      localField: "_id",
      foreignField: "projectId",
      as: "assignedMembers",
    },
  });

  aggregation.push({
    $lookup: {
      from: "users",
      localField: "assignedMembers.userId",
      foreignField: "userId",
      as: "assignedMembersDetails",
    },
  });

  aggregation.push({
    $lookup: {
      from: "assigntasks",
      let: { projectId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$projectId", "$$projectId"] },
                { $eq: ["$userId", loggedInUserId] },
              ],
            },
          },
        },
      ],
      as: "assignedTaskToMe",
    },
  });

  aggregation.push({
    $lookup: {
      from: "projecttasks",
      localField: "assignedTaskToMe.projectTaskId",
      foreignField: "_id",
      as: "projectTasks",
    },
  });

  // task name from tasks collection
  aggregation.push({
    $lookup: {
      from: "tasks",
      localField: "projectTasks.taskId",
      foreignField: "_id",
      as: "taskDetails",
    },
  });

  aggregation.push({
    $addFields: {
      projectTasks: {
        $map: {
          input: "$projectTasks",
          as: "pt",
          in: {
            _id: "$$pt._id",
            status: "$$pt.status",
            amount: "$$pt.amount",
            taskQuantity: "$$pt.taskQuantity",
            description: "$$pt.description",
            taskCompletedQuantity: "$$pt.taskCompletedQuantity",
            taskName: {
              $arrayElemAt: [
                {
                  $map: {
                    input: {
                      $filter: {
                        input: "$taskDetails",
                        as: "td",
                        cond: { $eq: ["$$td._id", "$$pt.taskId"] },
                      },
                    },
                    as: "filteredTask",
                    in: "$$filteredTask.taskName",
                  },
                },
                0,
              ],
            },
          },
        },
      },
    },
  });

  aggregation.push({
    $project: {
      _id: 1,
      projectName: 1,
      description: 1,
      startDate: 1,
      endDate: 1,
      status: 1,
      assignedMembersDetails: {
        userId: 1,
        name: 1,
        username: 1,
        profile_image: 1,
      },
      projectTasks: 1,
    },
  });

  const result = await Project.aggregate(aggregation);
  const projectDetails = result[0];
  if (!projectDetails) {
    throw new ApiError(404, "Project details not found");
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Project details fetched successfully",
        projectDetails
      )
    );
});

const getMyProjects = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const userId = req.user.userId;
  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const aggregation = [
    {
      $match: { userId: userId },
    },
    {
      $group: {
        _id: "$projectId",
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "_id",
        foreignField: "_id",
        as: "projectDetails",
      },
    },
    {
      $unwind: "$projectDetails",
    },
    {
      $replaceRoot: { newRoot: "$projectDetails" },
    },
    {
      $match: { status: "active" },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    },
    {
      $addFields: {
        total: { $arrayElemAt: ["$metadata.total", 0] },
      },
    },
  ];

  const result = await AssignTask.aggregate(aggregation);

  const projects = result[0]?.data || [];
  const total = result[0]?.total || 0;
  const totalPages = Math.ceil(total / limit);

  res.status(200).json(
    new ApiResponse(200, "User projects fetched successfully", {
      projects,
      total_page: totalPages,
      current_page: page,
      total_records: total,
      per_page: limit,
    })
  );
});

const getDocumentType = asyncHandler(async (req, res) => {
  const { projectId } = req.query;
  if (!isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }
  const aggregation = [];
  aggregation.push({
    $match: { projectId: new mongoose.Types.ObjectId(projectId) },
  });

  aggregation.push({
    $project: {
      _id: 1,
      documentName: 1,
      typeOfDocument: 1,
    },
  });
  aggregation.push({
    $sort: { createdAt: -1 },
  });

  const documentTypes = await QualityAssurance.aggregate(aggregation);
  if (!documentTypes || documentTypes.length === 0) {
    throw new ApiError(404, "No documents found for this project");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, "Document types fetched successfully", documentTypes)
    );
});

const getDocDetails = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const docDetails = await QualityAssurance.find({ projectId })
    .populate("documentTypeId", "name")
    .select("documentFile documentTypeId typeOfDocument createdAt");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        docDetails.length > 0
          ? "Documents fetched successfully"
          : "No documents found",
        docDetails.length > 0 ? docDetails : null
      )
    );
});

const taskCompletionUpdate = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { taskId, taskUpdateDescription, status, taskCompletedQuantity } =
      req.body;
    if (!isValidObjectId(taskId)) {
      throw new ApiError(400, "Invalid task ID");
    }

    const task = await ProjectTask.findById(taskId)
      .populate("taskId", "taskName taskQuantity taskCompletedQuantity amount")
      .session(session);

    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    const completedQuantity =
      Number(task.taskCompletedQuantity || 0) +
      Number(taskCompletedQuantity || 0);
    const taskCompletedStatus =
      completedQuantity >= task.taskQuantity ? "completed" : "in progress";

    if (completedQuantity > Number(task.taskQuantity || 0)) {
      throw new ApiError(
        400,
        "Task completed quantity cannot exceed task quantity"
      );
    }

    const project = await Project.findById(task.projectId).session(session);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    const uploadImages = [];

    if (req.files?.taskUpdateFile?.length > 0) {
      req.files.taskUpdateFile.forEach((file) => {
        uploadImages.push(file.location);
      });
    }

    const invoiceItems = await taskUpdateHistoryModel
      .aggregate([
        {
          $match: {
            taskId: task._id,
            updatedBy: req.user.userId,
          },
        },
        {
          $lookup: {
            from: "projecttasks",
            localField: "taskId",
            foreignField: "_id",
            as: "taskDetails",
          },
        },
        {
          $unwind: {
            path: "$taskDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            name: task?.taskId?.taskName,
            quantity: "$taskCompletedQuantity",
            price: "$taskDetails.amount",
          },
        },
      ])
      .session(session);
    const itemsForInvoice = [...invoiceItems];
    itemsForInvoice.push({
      name: task?.taskId?.taskName,
      quantity: parseFloat(taskCompletedQuantity),
      price: task?.amount,
    });

    // Created a Task Update History

    const InvoiceNumber = await generateUniqueInvoiceNumber();

    const InvoiceData = {
      company: {
        name: "Tracking Invoices Inc.",
        address: "123 Tech Street\nLondon, UK SW1A 1AA",
        phone: "(415) 123-4567",
        email: "support@trackinginvoices.com",
      },
      user: {
        name: req.user.name || "Unknown User",
        email: req.user.email || "Unknown Email",
        username: req.user.username || "Unknown Username",
        address: req.user.address || "Unknown Address",
      },
      invoiceNumber: InvoiceNumber,
      projectName: project.projectName || "Unknown Project",
      date: new Date().toISOString(),
      items: itemsForInvoice,
    };

    const s3Url = await generateInvoice(
      InvoiceData,
      `invoices/${InvoiceNumber}.pdf`
    );

    const taskUpdateHistory = await taskUpdateHistoryModel({
      taskId: task._id,
      projectId: task.projectId,
      updateDescription: taskUpdateDescription,
      status: taskCompletedStatus,
      taskCompletedQuantity,
      updatePhotos: uploadImages,
      updatedBy: req.user.userId,
      invoiceUrl: s3Url,
    });
    await taskUpdateHistory.save({ session });

    // Save the Invoice For the Project
    const existInvoice = await Invoice.findOne({
      projectId: task.projectId,
      userId: req.user.userId,
    }).session(session);

    if (existInvoice) {
      const items = await taskUpdateHistoryModel
        .aggregate([
          {
            $match: {
              projectId: task.projectId,
              updatedBy: req.user.userId,
            },
          },
          {
            $lookup: {
              from: "projecttasks",
              localField: "taskId",
              foreignField: "_id",
              as: "taskDetails",
            },
          },
          { $unwind: "$taskDetails" },
          {
            $lookup: {
              from: "tasks",
              localField: "taskDetails.taskId",
              foreignField: "_id",
              as: "taskMaster",
            },
          },
          { $unwind: "$taskMaster" },
          {
            $project: {
              _id: 0,
              name: "$taskMaster.taskName",
              quantity: "$taskCompletedQuantity",
              price: "$taskDetails.amount",
            },
          },
        ])
        .session(session);
      const updatedInvoiceData = {
        company: {
          name: "Tracking Invoices Inc.",
          address: "123 Tech Street\nLondon, UK SW1A 1AA",
          phone: "(415) 123-4567",
          email: "support@trackinginvoices.com",
        },
        user: {
          name: req.user.name || "Unknown User",
          email: req.user.email || "Unknown Email",
          username: req.user.username || "Unknown Username",
          address: req.user.address || "Unknown Address",
        },
        invoiceNumber: existInvoice.invoiceNumber,
        projectName: project.projectName || "Unknown Project",
        date: new Date().toISOString(),
        items: items,
      };
      const updatedS3Url = await generateInvoice(
        updatedInvoiceData,
        `invoices/${existInvoice.invoiceNumber}.pdf`
      );
      existInvoice.invoiceUrl = updatedS3Url;
      existInvoice.amount = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      await existInvoice.save({ session });
    } else {
      const invoice = await Invoice.create(
        [
          {
            invoiceNumber: InvoiceNumber,
            userId: req.user.userId,
            projectId: task.projectId,
            taskCompletedQuantity,
            taskId: task._id,
            invoiceUrl: s3Url,
            amount: task.amount,
            status: "unpaid",
            InvoiceDate: new Date(),
            invoiceType: "task",
          },
        ],
        { session }
      );
    }

    // projectInvoice if the
    const existingProjectInvoice = await ProjectInvoice.findOne({
      projectId: task.projectId,
      userId: req.user.userId,
      projectTaskId: taskId,
    });

    if (existingProjectInvoice) {
      existingProjectInvoice.invoiceUrl = s3Url;
      await existingProjectInvoice.save({ session });
    } else {
      const newProjectInvoice = new ProjectInvoice({
        projectId: task.projectId,
        userId: req.user.userId,
        projectTaskId: taskId,
        invoiceUrl: s3Url,
      });
      await newProjectInvoice.save({ session });
    }

    // if (!invoice) {
    //   throw new ApiError(500, "Failed to create invoice");
    // }

    task.taskCompletedQuantity = completedQuantity;

    // task.invoiceUrl = s3UrlCombined;

    task.status = taskCompletedStatus;
    task.taskUpdateDescription = taskUpdateDescription;
    task.taskUpdatePhotos = uploadImages;
    task.updateBy = req.user.userId;

    const updatedTask = await task.save({ session });
    if (!updatedTask) {
      throw new ApiError(500, "Failed to update task");
    }

    await session.commitTransaction();

    return res
      .status(200)
      .json(new ApiResponse(200, "Task updated successfully", updatedTask));
  } catch (error) {
    await session.abortTransaction();
    throw new ApiError(500, error.message);
  } finally {
    session.endSession();
  }
});

const getTaskDetails = asyncHandler(async (req, res) => {
  const taskId = req.params.taskId;
  if (!isValidObjectId(taskId)) {
    throw new ApiError(400, "Invalid task ID");
  }
  const userId = req.user.userId;

  const aggregation = [];
  aggregation.push({
    $match: { _id: new mongoose.Types.ObjectId(taskId) },
  });
  aggregation.push({
    $lookup: {
      from: "taskupdatehistories",
      let: { taskId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$taskId", "$$taskId"] },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "updatedBy",
            foreignField: "userId",
            as: "updatedByUser",
          },
        },
        {
          $unwind: {
            path: "$updatedByUser",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            updateDescription: 1,
            taskCompletedQuantity: 1,
            status: 1,
            updatePhotos: 1,
            updateDocuments: 1,
            updatedBy: "$updatedByUser.username",
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ],
      as: "taskUpdateHistory",
    },
  });

  aggregation.push({
    $lookup: {
      from: "tasks",
      localField: "taskId",
      foreignField: "_id",
      as: "taskDetails",
    },
  });
  aggregation.push({
    $unwind: {
      path: "$taskDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $lookup: {
      from: "projects",
      localField: "projectId",
      foreignField: "_id",
      as: "projectDetails",
    },
  });
  aggregation.push({
    $unwind: {
      path: "$projectDetails",
      preserveNullAndEmptyArrays: true,
    },
  });
  aggregation.push({
    $lookup: {
      from: "projectinvoices",
      let: {
        projectTaskId: "$_id",
        projectId: "$projectId",
        userId: "$userId",
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$projectTaskId", "$$projectTaskId"] },
                { $eq: ["$projectId", "$$projectId"] },
                { $eq: ["$userId", userId] },
              ],
            },
          },
        },
      ],
      as: "projectInvoices",
    },
  });

  aggregation.push({
    $unwind: {
      path: "$projectInvoices",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $project: {
      _id: 1,
      taskName: "$taskDetails.taskName",
      description: 1,
      amount: 1,
      status: 1,
      taskUpdatePhotos: 1,
      taskUpdateDescription: 1,
      invoiceUrl: "$projectInvoices.invoiceUrl",
      taskUpdateHistory: "$taskUpdateHistory",
      taskQuantity: 1,
      taskCompletedQuantity: 1,
      projectDetails: {
        _id: "$projectDetails._id",
        projectName: "$projectDetails.projectName",
        description: "$projectDetails.description",
        status: "$projectDetails.status",
      },
    },
  });

  const task = await ProjectTask.aggregate(aggregation);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        task.length > 0
          ? "Task details fetched successfully"
          : "Task not found",
        task.length > 0 ? task[0] : null
      )
    );
});

const updateProjectTask = asyncHandler(async (req, res) => {
  const projectTaskId = req.params.projectTaskId;
  const {
    projectId,
    taskId,
    amount,
    taskQuantity,
    description,
    taskUpdateDescription,
  } = req.body;

  if (!isValidObjectId(projectTaskId)) {
    throw new ApiError(400, "Invalid project task ID");
  }

  const task = await ProjectTask.findById(projectTaskId);
  if (!task) {
    throw new ApiError(404, "Project task not found");
  }

  const updatedTask = await ProjectTask.findByIdAndUpdate(
    projectTaskId,
    {
      taskQuantity,
      description,
      taskUpdateDescription,
      amount,
      projectId,
      taskId,
    },
    { new: true }
  );

  if (!updatedTask) {
    throw new ApiError(404, "Project task not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Project task updated successfully", updatedTask)
    );
});

const deleteProjectTask = asyncHandler(async (req, res) => {
  const projectTaskId = req.params.projectTaskId;

  const task = await ProjectTask.findByIdAndDelete(projectTaskId);
  if (!task) {
    throw new ApiError(404, "Project task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Project task deleted successfully"));
});

const getAllInvoicesProject = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const status = req.query.status || "all";
  if (status !== "all" && !["unpaid", "paid", "draft"].includes(status)) {
    throw new ApiError(400, "Invalid status [unpaid, paid, draft, all]");
  }

  const aggregation = [];
  aggregation.push({
    $match: {
      userId: req.user.userId,
      status: status === "all" ? { $in: ["unpaid", "paid", "draft"] } : status,
    },
  });

  aggregation.push({
    $lookup: {
      from: "projects",
      localField: "projectId",
      foreignField: "_id",
      as: "projectDetails",
    },
  });
  aggregation.push({
    $unwind: {
      path: "$projectDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $lookup: {
      from: "projecttasks",
      localField: "taskId",
      foreignField: "_id",
      as: "taskDetails",
    },
  });

  aggregation.push({
    $unwind: {
      path: "$taskDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $lookup: {
      from: "tasks",
      localField: "taskDetails.taskId",
      foreignField: "_id",
      as: "taskInfo",
    },
  });

  aggregation.push({
    $unwind: {
      path: "$taskInfo",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "userId",
      as: "userDetails",
    },
  });

  aggregation.push({
    $unwind: {
      path: "$userDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $sort: { createdAt: -1 },
  });

  aggregation.push({
    $facet: {
      invoices: [
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            invoiceNumber: 1,
            projectName: "$projectDetails.projectName",
            taskName: "$taskInfo.taskName",
            userDetails: {
              name: 1,
              email: 1,
              username: 1,
              address: 1,
            },
            taskCompletedQuantity: 1,
            invoiceUrl: 1,
            status: 1,
            amount: 1,
            InvoiceDate: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ],
      totalCount: [{ $count: "count" }],
    },
  });

  const result = await Invoice.aggregate(aggregation);

  const invoices = result[0].invoices;
  const totalRecords =
    result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
  const totalPages = Math.ceil(totalRecords / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      invoices.length > 0
        ? "Fetched all project invoices successfully"
        : "No project invoices found",
      invoices.length > 0
        ? {
            invoices,
            total_page: totalPages,
            current_page: page,
            total_records: totalRecords,
            per_page: limit,
          }
        : null
    )
  );
});

const ProjectInvoices = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  let { search, sortBy, sortDirection } = req.query;
  if (sortBy === "projectName") {
    sortBy = "projectDetails.projectName";
  } else if (sortBy === "userName") {
    sortBy = "userDetails.username";
  }

  const aggregation = [];
  aggregation.push({
    $lookup: {
      from: "projects",
      localField: "projectId",
      foreignField: "_id",
      as: "projectDetails",
    },
  });

  aggregation.push({
    $unwind: {
      path: "$projectDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "userId",
      as: "userDetails",
    },
  });
  aggregation.push({
    $unwind: {
      path: "$userDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  if (search || search === "") {
    aggregation.push({
      $match: {
        $or: [
          { "projectDetails.projectName": { $regex: search, $options: "i" } },
          { "userDetails.username": { $regex: search, $options: "i" } },
          { invoiceNumber: { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  aggregation.push({
    $sort: {
      [sortBy ? sortBy : "createdAt"]: sortDirection === "asc" ? 1 : -1,
    },
  });

  aggregation.push({
    $facet: {
      invoices: [
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            invoiceNumber: 1,
            projectId: "$projectDetails._id",
            projectName: "$projectDetails.projectName",
            invoiceUrl: 1,
            status: 1,
            InvoiceDate: 1,
            userDetails: {
              name: 1,
              email: 1,
              username: 1,
              address: 1,
            },
          },
        },
        { $sort: { createdAt: -1 } },
      ],
      totalCount: [{ $count: "count" }],
    },
  });

  const result = await Invoice.aggregate(aggregation);
  const invoices = result[0].invoices;
  const totalRecords =
    result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
  const totalPages = Math.ceil(totalRecords / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      invoices.length > 0
        ? "Fetched all project invoices successfully"
        : "No project invoices found",
      invoices.length > 0
        ? {
            invoices,
            total_page: totalPages,
            current_page: page,
            total_records: totalRecords,
            per_page: limit,
          }
        : null
    )
  );
});

const updateInvoiceStatus = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;
  const {  status } = req.body;

  if (!isValidObjectId(invoiceId)) {
    throw new ApiError(404, "Invalid Invoice Id");
  }

  const aggregation = [];
  aggregation.push({
    $match: {
      _id: new mongoose.Types.ObjectId(invoiceId),
    },
  });
  aggregation.push({
    $lookup: {
      from: "projects",
      localField: "projectId",
      foreignField: "_id",
      as: "projectDetails",
    },
  });
  aggregation.push({
    $unwind: {
      path: "$projectDetails",
      preserveNullAndEmptyArrays: true,
    },
  });
  aggregation.push({
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "userId",
      as: "userDetails",
    },
  });
  aggregation.push({
    $unwind: {
      path: "$userDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $lookup: {
      from: "devicedetails",
      localField: "userId",
      foreignField: "userId",
      as: "deviceDetails",
    },
  });

  aggregation.push({
    $project: {
      _id: 1,
      invoiceNumber: 1,
      projectId: "$projectDetails._id",
      projectName: "$projectDetails.projectName",
      invoiceUrl: 1,
      status: 1,
      InvoiceDate: 1,
      userDetails: {
        name: 1,
        email: 1,
        username: 1,
        address: 1,
      },
      deviceDetails: 1,
      userId: 1,
    },
  });
  const invoice = await Invoice.aggregate(aggregation);

  if (!invoice || invoice.length === 0) {
    throw new ApiError(404, "Invoice not found");
  }

  if (!["paid", "unpaid", "draft"].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  invoice[0].status = status;
  const updatedInvoice = await Invoice.findByIdAndUpdate(
    invoice[0]._id,
    invoice[0],
    { new: true }
  );

  // // update the user's project invoice status using notification service
  // const getUser
  const deviceTokens = invoice[0]?.deviceDetails
    .map((device) => device.deviceToken)
    .filter((token) => token);
  if (deviceTokens.length > 0) {
    const notificationTitle = "Invoice Status Updated";
    const notificationBody = `Your invoice ${invoice[0].invoiceNumber} status has been updated to ${status}.`;
    await sendPushNotification(
      deviceTokens,
      notificationTitle,
      notificationBody,
      req.user.userId,
      invoice[0].userId
    );
  }

  if (!updatedInvoice) {
    throw new ApiError(500, "Failed to update invoice status");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Invoice status updated successfully", invoice[0])
    );
});

const getAllActivities = asyncHandler(async (req, res) => {
  const { invoiceDate, invoiceEndDate } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const aggregation = [];

  aggregation.push({
    $match: {
      userId: req.user.userId,
      updatedAt: {
        $gte: invoiceDate ? new Date(invoiceDate) : new Date("1970-01-01"),
        $lte: invoiceEndDate ? new Date(invoiceEndDate) : new Date(),
      },
    },
  });

  aggregation.push({
    $lookup: {
      from: "projects",
      localField: "projectId",
      foreignField: "_id",
      as: "projectDetails",
    },
  });

  aggregation.push({
    $unwind: {
      path: "$projectDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $lookup: {
      from: "projecttasks",
      localField: "projectTaskId",
      foreignField: "_id",
      as: "taskDetails",
    },
  });
  aggregation.push({
    $unwind: {
      path: "$taskDetails",
      preserveNullAndEmptyArrays: true,
    },
  });
  aggregation.push({
    $lookup: {
      from: "tasks",
      localField: "taskDetails.taskId",
      foreignField: "_id",
      as: "taskInfo",
    },
  });
  aggregation.push({
    $unwind: {
      path: "$taskInfo",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "userId",
      as: "userDetails",
    },
  });
  aggregation.push({
    $unwind: {
      path: "$userDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $sort: { createdAt: -1 },
  });

  aggregation.push({
    $facet: {
      activities: [
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            taskName: "$taskInfo.taskName",
            projectName: "$projectDetails.projectName",
            invoiceNumber: 1,
            invoiceUrl: 1,
            amount: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ],
      totalCount: [{ $count: "count" }],
    },
  });

  const result = await ProjectInvoice.aggregate(aggregation);

  const activities = result[0].activities;
  const totalRecords =
    result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
  const totalPages = Math.ceil(totalRecords / limit);
  return res.status(200).json(
    new ApiResponse(
      200,
      activities.length > 0
        ? "Fetched all activities successfully"
        : "No activities found",
      activities.length > 0
        ? {
            activities,
            total_page: totalPages,
            current_page: page,
            total_records: totalRecords,
            per_page: limit,
          }
        : null
    )
  );
});

const getProjectInvoices = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const userId = req.user.userId;
  if (!userId) {
    throw new ApiError(404, "User not found");
  }

  const aggregation = [
    {
      $match: { userId: userId },
    },
    {
      $group: {
        _id: "$projectId",
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "_id",
        foreignField: "_id",
        as: "projectDetails",
      },
    },
    {
      $unwind: "$projectDetails",
    },
    {
      $replaceRoot: { newRoot: "$projectDetails" },
    },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          {
            $project: {
              __v: 0,
            },
          },
          { $skip: skip },
          { $limit: limit },
        ],
      },
    },
    {
      $addFields: {
        total: { $arrayElemAt: ["$metadata.total", 0] },
      },
    },
  ];

  const result = await AssignTask.aggregate(aggregation);

  const projects = result[0]?.data || [];
  const total = result[0]?.total || 0;
  const totalPages = Math.ceil(total / limit);

  res.status(200).json(
    new ApiResponse(200, "User projects fetched successfully", {
      projects,
      total_page: totalPages,
      current_page: page,
      total_records: total,
      per_page: limit,
    })
  );
});

const generateProjectInvoice = asyncHandler(async (req, res) => {
  const { projectId } = req.body;
  if (!isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const user = req.user;

  const aggregation = [];

  aggregation.push({
    $match: {
      projectId: new mongoose.Types.ObjectId(projectId),
      userId: user.userId,
    },
  });

  aggregation.push({
    $lookup: {
      from: "projecttasks",
      localField: "taskId",
      foreignField: "_id",
      as: "projectTask",
    },
  });

  aggregation.push({
    $unwind: {
      path: "$projectTask",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $lookup: {
      from: "tasks",
      localField: "projectTask.taskId",
      foreignField: "_id",
      as: "taskDetails",
    },
  });
  aggregation.push({
    $unwind: {
      path: "$taskDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $lookup: {
      from: "projects",
      localField: "projectId",
      foreignField: "_id",
      as: "projectDetails",
    },
  });
  aggregation.push({
    $unwind: {
      path: "$projectDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $addFields: {
      user: {
        name: user.name,
        username: user.username,
        email: user.email,
        address: user.address,
      },
    },
  });

  aggregation.push({
    $project: {
      projectName: "$projectDetails.projectName",
      taskName: "$taskDetails.taskName",
      invoiceNumber: 1,
      date: "$InvoiceDate",
      items: [
        {
          name: "$taskDetails.taskName",
          quantity: "$taskCompletedQuantity",
          price: "$taskDetails.amount",
        },
      ],
      user: 1,
    },
  });

  const invoices = await Invoice.aggregate(aggregation);
  if (!invoices || invoices.length === 0) {
    throw new ApiError(404, "No invoices found for this project");
  }

  const generatedInvoice = await generateInvoice(
    invoices,
    `invoices/${projectId}.pdf`
  );

  res.status(200).json(
    new ApiResponse(200, "Invoice generated successfully", {
      invoiceUrl: generatedInvoice,
    })
  );
});

const getAllDocumentType = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const aggregation = [];
  aggregation.push({
    $facet: {
      documentTypes: [
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ],
      totalCount: [{ $count: "count" }],
    },
  });

  const result = await DocumentType.aggregate(aggregation);

  const documentTypes = result[0].documentTypes;
  const totalRecords =
    result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json(
    new ApiResponse(
      200,
      documentTypes.length > 0
        ? "Document types fetched successfully"
        : "No document types found",
      documentTypes.length > 0
        ? {
            documentTypes,
            total_page: totalPages,
            current_page: page,
            total_records: totalRecords,
            per_page: limit,
          }
        : null
    )
  );
});

const addDocumentType = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    throw new ApiError(400, "Document Type name is required");
  }

  const existingDocumentType = await DocumentType.findOne({ name });
  if (existingDocumentType) {
    throw new ApiError(400, "Document Type with this name already exists");
  }

  const newDocumentType = await DocumentType.create({ name, description });
  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Document Type created successfully",
        newDocumentType
      )
    );
});

const getDocumentTypeDropdown = asyncHandler(async (req, res) => {
  const documentTypes = await DocumentType.find({}, { _id: 1, name: 1 });
  res
    .status(200)
    .json(
      new ApiResponse(200, "Document types fetched successfully", documentTypes)
    );
});

const getProjectTaskAndAssignUsers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const { search, sortBy, sortDirection } = req.query;

  if (!isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const aggregation = [];
  aggregation.push({
    $match: { projectId: new mongoose.Types.ObjectId(projectId) },
  });

  aggregation.push(
    {
      $lookup: {
        from: "tasks",
        localField: "taskId",
        foreignField: "_id",
        as: "taskDetails",
        pipeline: [{ $project: { taskName: 1, _id: 0 } }],
      },
    },
    {
      $set: {
        taskName: { $first: "$taskDetails.taskName" },
      },
    }
  );

  if (search) {
    aggregation.push({
      $match: { $or: [{ taskName: { $regex: search, $options: "i" } }] },
    });
  }

  aggregation.push({
    $lookup: {
      from: "assigntasks",
      localField: "_id",
      foreignField: "projectTaskId",
      as: "assignedUsers",
      pipeline: [
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "userId",
            as: "userDetails",
            pipeline: [
              {
                $project: {
                  userId: 1,
                  name: 1,
                  username: 1,
                  profile_image: 1,
                  _id: 0,
                },
              },
            ],
          },
        },
        {
          $project: {
            user: { $first: "$userDetails" },
          },
        },
      ],
    },
  });

  aggregation.push({
    $project: {
      projectId: 1,
      taskId: 1,
      amount: 1,
      taskQuantity: 1,
      taskCompletedQuantity: 1,
      taskName: 1,
      assignedUsers: "$assignedUsers.user",
    },
  });

  const result = await ProjectTask.aggregate(aggregation);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Project tasks and assigned users fetched successfully",
        result
      )
    );
});

const getProjectTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const aggregation = [];
  aggregation.push({
    $match: { projectId: new mongoose.Types.ObjectId(projectId) },
  });

  aggregation.push({
    $lookup: {
      from: "projecttasks",
      localField: "taskId",
      foreignField: "_id",
      as: "projectTask",
    },
  });

  aggregation.push({
    $unwind: {
      path: "$projectTask",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $lookup: {
      from: "tasks",
      localField: "projectTask.taskId",
      foreignField: "_id",
      as: "taskDetails",
    },
  });
  aggregation.push({
    $unwind: {
      path: "$taskDetails",
      preserveNullAndEmptyArrays: true,
    },
  });
  // aggregation.push({
  //   $project: {
  //     _id: 1,
  //     taskId: 1,
  //     taskName: 1,
  //     amount: 1,
  //     taskQuantity: 1,
  //     taskCompletedQuantity: 1,
  //   },
  // });

  // add the pagination in this
  aggregation.push({
    $facet: {
      projectTasks: [
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            taskId: 1,
            taskName: 1,
            amount: 1,
            taskQuantity: 1,
            taskCompletedQuantity: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ],
      totalCount: [{ $count: "count" }],
    },
  });

  const result = await ProjectTask.aggregate(aggregation);

  const projectTasks = result[0].projectTasks;
  const totalRecords =
    result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json(
    new ApiResponse(200, "Project tasks fetched successfully", {
      projectTasks,
      total_page: totalPages,
      current_page: page,
      total_records: totalRecords,
      per_page: limit,
    })
  );
});

const getProjectAssignTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  let { search, sortBy, sortDirection } = req.query;
  if (!isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  if (sortBy === "taskName") {
    sortBy = "taskDetails.taskName";
  } else if (sortBy === "projectName") {
    sortBy = "projectDetails.projectName";
  } else if (sortBy === "name") {
    sortBy = "userDetails.name";
  } else if (sortBy === "username") {
    sortBy = "userDetails.username";
  }
  const aggregation = [];
  aggregation.push({
    $match: { projectId: new mongoose.Types.ObjectId(projectId) },
  });
  aggregation.push({
    $lookup: {
      from: "projects",
      localField: "projectId",
      foreignField: "_id",
      as: "projectDetails",
    },
  });
  aggregation.push({
    $unwind: {
      path: "$projectDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "userId",
      as: "userDetails",
    },
  });

  aggregation.push({
    $unwind: {
      path: "$userDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $lookup: {
      from: "tasks",
      localField: "taskId",
      foreignField: "_id",
      as: "taskDetails",
    },
  });

  aggregation.push({
    $unwind: {
      path: "$taskDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  if (search) {
    aggregation.push({
      $match: {
        $or: [
          { "taskDetails.taskName": { $regex: search, $options: "i" } },
          { "projectDetails.projectName": { $regex: search, $options: "i" } },
          { "userDetails.name": { $regex: search, $options: "i" } },
          { "userDetails.username": { $regex: search, $options: "i" } },
        ],
      },
    });
  }
  // if(sortBy) {
  //   if (sortBy === "taskName") {
  //     aggregation.push({
  //       $sort: { "taskDetails.taskName": sortDirection === "asc" ? 1 : -1 },
  //     });
  //   }
  // }

  aggregation.push({
    $sort: {
      [sortBy ? sortBy : "createdAt"]: sortDirection === "asc" ? 1 : -1,
    },
  });

  aggregation.push({
    $facet: {
      tasks: [
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            taskId: "$projectTaskId",
            taskName: "$taskDetails.taskName",
            projectId: "$projectDetails._id",
            projectName: "$projectDetails.projectName",
            userId: "$userDetails.userId",
            name: "$userDetails.name",
            username: "$userDetails.username",
          },
        },
      ],
      totalCount: [{ $count: "count" }],
    },
  });

  const result = await AssignTask.aggregate(aggregation);

  const tasks = result[0].tasks;

  const totalRecords =
    result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json(
    new ApiResponse(
      200,
      tasks.length > 0
        ? "Fetched all assigned tasks successfully"
        : "No assigned tasks found",
      tasks.length > 0
        ? {
            tasks,
            total_page: totalPages,
            current_page: page,
            total_records: totalRecords,
            per_page: limit,
          }
        : null
    )
  );
});

const getQualityAssuranceByProjectId = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  let { search, sortBy, sortDirection } = req.query;
  if (sortBy === "projectName") {
    sortBy = "projectDetails.projectName";
  } else if (sortBy === "documentName") {
    sortBy = "documentTypeDetails.name";
  }
  if (!isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  const aggregation = [];
  aggregation.push({
    $match: { projectId: new mongoose.Types.ObjectId(projectId) },
  });
  aggregation.push({
    $lookup: {
      from: "projects",
      localField: "projectId",
      foreignField: "_id",
      as: "projectDetails",
    },
  });
  aggregation.push({
    $unwind: {
      path: "$projectDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $lookup: {
      from: "documenttypes",
      localField: "documentTypeId",
      foreignField: "_id",
      as: "documentTypeDetails",
    },
  });

  aggregation.push({
    $unwind: {
      path: "$documentTypeDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  if (search || search === "") {
    aggregation.push({
      $match: {
        $or: [
          { "projectDetails.projectName": { $regex: search, $options: "i" } },
          { "documentTypeDetails.name": { $regex: search, $options: "i" } },
        ],
      },
    });
  }
  aggregation.push({
    $sort: {
      [sortBy ? sortBy : "createdAt"]: sortDirection === "asc" ? 1 : -1,
    },
  });

  aggregation.push({
    $facet: {
      qualityAssurances: [
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            projectName: "$projectDetails.projectName",
            projectId: "$projectDetails._id",
            documentName: "$documentTypeDetails.name",
            documentTypeId: "$documentTypeDetails._id",
            documentFile: 1,
            status: 1,
            _id: 1,
          },
        },
      ],
      totalCount: [{ $count: "count" }],
    },
  });

  const result = await QualityAssurance.aggregate(aggregation);
  const qualityAssurances = result[0].qualityAssurances;
  const totalRecords =
    result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
  const totalPages = Math.ceil(totalRecords / limit);
  res.status(200).json(
    new ApiResponse(
      200,
      qualityAssurances.length > 0
        ? "Fetched all quality assurances successfully"
        : "No quality assurances found",
      qualityAssurances.length > 0
        ? {
            qualityAssurances,
            total_page: totalPages,
            current_page: page,
            total_records: totalRecords,
            per_page: limit,
          }
        : null
    )
  );
});

const getProjectTaskInvoices = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  let { search, sortBy, sortDirection } = req.query;

  // Map sort fields
  if (sortBy === "userName") {
    sortBy = "userDetails.username";
  } else if (sortBy === "projectName") {
    sortBy = "projectDetails.projectName";
  }

  const aggregation = [];

  // ✅ Filter by taskId + invoiceType
  aggregation.push({
    $match: {
      taskId: new mongoose.Types.ObjectId(taskId),
      invoiceType: "task",
    },
  });

  // ✅ Join project
  aggregation.push({
    $lookup: {
      from: "projects",
      localField: "projectId",
      foreignField: "_id",
      as: "projectDetails",
    },
  });

  aggregation.push({
    $unwind: {
      path: "$projectDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  aggregation.push({
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "userId",
      as: "userDetails",
    },
  });

  aggregation.push({
    $unwind: {
      path: "$userDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  if (search) {
    aggregation.push({
      $match: {
        $or: [
          { invoiceNumber: { $regex: search, $options: "i" } },
          { "userDetails.username": { $regex: search, $options: "i" } },
          { "projectDetails.projectName": { $regex: search, $options: "i" } },
        ],
      },
    });
  }


  aggregation.push({
    $sort: {
      [sortBy || "createdAt"]: sortDirection === "asc" ? 1 : -1,
    },
  });


  aggregation.push({
    $facet: {
      invoices: [
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            invoiceNumber: 1,
            invoiceUrl: 1,
            amount: 1,
            status: 1,
            InvoiceDate: 1,
            taskCompletedQuantity: 1,
            projectId: "$projectDetails._id",
            projectName: "$projectDetails.projectName",
            userDetails: {
              name: "$userDetails.name",
              email: "$userDetails.email",
              username: "$userDetails.username",
              address: "$userDetails.address",
            },
          },
        },
      ],
      totalCount: [{ $count: "count" }],
    },
  });

  const result = await Invoice.aggregate(aggregation);

  const invoices = result[0]?.invoices || [];
  const totalRecords =
    result[0]?.totalCount?.length > 0 ? result[0].totalCount[0].count : 0;

  const totalPages = Math.ceil(totalRecords / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      invoices.length > 0
        ? "Fetched task invoices successfully"
        : "No task invoices found",
      invoices.length > 0
        ? {
            invoices,
            total_page: totalPages,
            current_page: page,
            total_records: totalRecords,
            per_page: limit,
          }
        : null
    )
  );
});

const getInvoicesByProjectId = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  let { search, sortBy, sortDirection } = req.query;

  // Map sort fields
  if (sortBy === "userName") {
    sortBy = "userDetails.username";
  }

  const aggregation = [];

  aggregation.push({
    $match: {
      projectId: new mongoose.Types.ObjectId(projectId),
    },
  });


  aggregation.push({
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "userId", 
      as: "userDetails",
    },
  });

  aggregation.push({
    $unwind: {
      path: "$userDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  if (search) {
    aggregation.push({
      $match: {
        $or: [
          { invoiceNumber: { $regex: search, $options: "i" } },
          { "userDetails.username": { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  aggregation.push({
    $sort: {
      [sortBy || "createdAt"]: sortDirection === "asc" ? 1 : -1,
    },
  });

  aggregation.push({
    $facet: {
      invoices: [
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            invoiceNumber: 1,
            invoiceUrl: 1,
            amount: 1,
            status: 1,
            InvoiceDate: 1,
            createdAt: 1,
            userDetails: {
              name: "$userDetails.name",
              email: "$userDetails.email",
              username: "$userDetails.username",
              address: "$userDetails.address",
            },
          },
        },
      ],
      totalCount: [{ $count: "count" }],
    },
  });

  const result = await Invoice.aggregate(aggregation);

  const invoices = result[0]?.invoices || [];
  const totalRecords =
    result[0]?.totalCount?.length > 0
      ? result[0].totalCount[0].count
      : 0;

  const totalPages = Math.ceil(totalRecords / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      invoices.length > 0
        ? "Fetched project invoices successfully"
        : "No invoices found for this project",
      invoices.length > 0
        ? {
            invoices,
            total_page: totalPages,
            current_page: page,
            total_records: totalRecords,
            per_page: limit,
          }
        : null
    )
  );
});

export {
  getAllProjects,
  addProject,
  updateProject,
  deleteProject,
  getAllTasks,
  addTask,
  getProjectDropDown,
  updateTask,
  deleteTask,
  getAllTaskofProject,
  getAssignTasks,
  assignTask,
  updateAssignTask,
  deleteAssignedTask,
  getQualityAssurance,
  addQualityAssurance,
  updateQualityAssurance,
  deleteQualityAssurance,
  clockIn,
  getProjectDetails,
  getMyProjects,
  getDocumentType,
  getDocDetails,
  taskCompletionUpdate,
  getTaskDetails,
  getAllInvoicesProject,
  ProjectInvoices,
  updateInvoiceStatus,
  getAllActivities,
  addProjectTask,
  getAllProjectTasks,
  getTaskDropDown,
  deleteProjectTask,
  updateProjectTask,
  getTodayClockingDetails,
  clockOut,
  getProjectInvoices,
  generateProjectInvoice,
  getAllDocumentType,
  addDocumentType,
  getDocumentTypeDropdown,
  getProjectTaskAndAssignUsers,
  getProjectTasks,
  getProjectAssignTasks,
  getQualityAssuranceByProjectId,
  getProjectById,
  getProjectTaskInvoices,
  getInvoicesByProjectId
};
