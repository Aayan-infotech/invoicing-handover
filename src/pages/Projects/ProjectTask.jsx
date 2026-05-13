import { useState, useEffect } from "react";
import "./Projects.css";
import axios from "axios";
import { fetchWithAuth } from "../../utils/authFetch";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { links } from "../../contstants";
import Loading from "../../components/Loading/Loading";
import { useSelector } from "react-redux";
import Table from "../../components/Table";
import SortableTh from "../../components/SortableTh";
import { useDebounce } from "../../hooks/useDebounce";

function ProjectTask() {
  const userState = useSelector((state) => state.user);

  // STATES
  const [loading, setLoading] = useState(true);
  const [projectTasks, setProjectTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [refreshTable, setRefreshTable] = useState(false);

  const [taskData, setTaskData] = useState({
    projectId: "",
    taskId: "",
    taskName: "",
    taskAmount: "",
    taskQuantity: "",
    description: "",
  });

  const [disabled, setDisabled] = useState(false);

  const [pagination, setPagination] = useState({
    current_page: 1,
    total_page: 1,
    per_page: 10,
    total_records: 0,
  });

  // SEARCH + SORT
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 800);

  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "",
  });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const clearSearch = () => {
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  // API CALLS
  const fetchProjects = async () => {
    try {
      const response = await fetchWithAuth(
        `${links.BASE_URL}projects/project-dropdown`
      );
      setProjects(response?.data?.data || []);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to fetch projects";
      toast.error(message);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetchWithAuth(
        `${links.BASE_URL}projects/task-dropdown`
      );
      setTasks(response?.data?.data || []);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to fetch tasks";
      toast.error(message);
    }
  };

  const fetchProjectTasks = async () => {
    try {
      setLoading(true);

      const response = await fetchWithAuth(
        `${links.BASE_URL}/projects/project-tasks`,
        {
          method: "GET",
          params: {
            page: pagination.current_page,
            limit: pagination.per_page,
            search: debouncedSearchTerm,
            sortBy: sortConfig.key,
            sortDirection: sortConfig.direction,
          },
        }
      );

      setProjectTasks(response?.data?.data?.projectTasks || []);

      setPagination({
        current_page: response?.data?.data?.current_page,
        total_page: response?.data?.data?.total_page,
        per_page: response?.data?.data?.per_page,
        total_records: response?.data?.data?.total_records,
      });

      setLoading(false);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to fetch project tasks";
      toast.error(message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTasks();
    fetchProjectTasks();
  }, [pagination.current_page, refreshTable, debouncedSearchTerm, sortConfig]);

  // MODAL HANDLERS
  const handleAddTask = () => {
    setModalType("add");
    setTaskData({
      projectId: "",
      taskId: "",
      taskName: "",
      taskAmount: "",
      taskQuantity: "",
      description: "",
    });
  };

  const handleCloseModal = () => {
    setModalType(null);
    setTaskData({
      projectId: "",
      taskId: "",
      taskAmount: "",
      taskQuantity: "",
      description: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  // CRUD
  const saveTaskDetails = async () => {
    try {
      setDisabled(true);

      await axios.post(
        `${links.BASE_URL}projects/project-tasks`,
        {
          projectId: taskData.projectId,
          taskId: taskData.taskId,
          amount: taskData.taskAmount,
          taskQuantity: taskData.taskQuantity,
          description: taskData.description,
        },
        {
          headers: { Authorization: `Bearer ${userState.userInfo.accessToken}` },
        }
      );

      toast.success("Task saved successfully");
      setModalType(null);
      setDisabled(false);
      setRefreshTable((p) => !p);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save task");
      setDisabled(false);
    }
  };

  const handleView = async (idx) => {
    const projectTask = projectTasks[idx];

    const taskDetails = await fetchWithAuth(
      `${links.BASE_URL}projects/task-details/${projectTask._id}`
    );

    const details = taskDetails?.data?.data || {};

    setTaskData({
      projectName: projectTask.projectName,
      taskName: projectTask.taskName,
      taskAmount: projectTask.amount,
      taskQuantity: projectTask.taskQuantity,
      description: projectTask.description,
      taskUpdateHistory: details.taskUpdateHistory || [],
    });

    setModalType("view");
  };

  const handleEdit = (idx) => {
    const task = projectTasks[idx];

    setTaskData({
      id: task._id,
      projectId: task.projectId,
      taskId: task.taskId,
      taskAmount: task.amount,
      taskQuantity: task.taskQuantity,
      description: task.description,
    });

    setModalType("edit");
  };

  const updateTaskDetails = async () => {
    try {
      setDisabled(true);

      await axios.put(
        `${links.BASE_URL}projects/project-tasks/${taskData.id}`,
        {
          projectId: taskData.projectId,
          taskId: taskData.taskId,
          amount: taskData.taskAmount,
          taskQuantity: taskData.taskQuantity,
          description: taskData.description,
        },
        {
          headers: { Authorization: `Bearer ${userState.userInfo.accessToken}` },
        }
      );

      toast.success("Task updated successfully");
      setModalType(null);
      setDisabled(false);
      setRefreshTable((p) => !p);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update task");
      setDisabled(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      <Table
        PageTitle="📌 Project Task Management"
        pagination={pagination}
        setPagination={setPagination}
        dataLength={projectTasks.length}
        handleAdd={handleAddTask}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
      >
        <table className="table table-bordered align-middle text-center table-striped">
          <thead className="table-dark">
            <tr>
              <SortableTh
                columnKey="projectName"
                label="Project Name"
                sortConfig={sortConfig}
                onSort={handleSort}
              />

              <SortableTh
                columnKey="taskName"
                label="Task Name"
                sortConfig={sortConfig}
                onSort={handleSort}
              />

              <SortableTh
                columnKey="amount"
                label="Amount"
                sortConfig={sortConfig}
                onSort={handleSort}
              />

              <SortableTh
                columnKey="taskQuantity"
                label="Quantity"
                sortConfig={sortConfig}
                onSort={handleSort}
              />

              <SortableTh
                columnKey="status"
                label="Status"
                sortConfig={sortConfig}
                onSort={handleSort}
              />

              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {projectTasks.length > 0 ? (
              projectTasks.map((task, idx) => (
                <tr key={task._id}>
                  <td>{task.projectName}</td>

                  <td>{task.taskName}</td>

                  <td>
                    {task.amount ? (
                      <span className="text-success fw-semibold">
                        ${task.amount.toFixed(2)}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>

                  <td>{task.taskQuantity}</td>

                  <td>
                    {task.status === "completed" ? (
                      <span className="badge bg-success">Completed</span>
                    ) : task.status === "in progress" ? (
                      <span className="badge bg-primary">In Progress</span>
                    ) : (
                      <span className="badge bg-warning">Pending</span>
                    )}
                  </td>

                  <td>
                    <i
                      className="bi bi-eye text-primary fs-5 me-3"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleView(idx)}
                    ></i>

                    <i
                      className="bi bi-pencil text-warning fs-5"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleEdit(idx)}
                    ></i>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No tasks found</td>
              </tr>
            )}
          </tbody>
        </table>
      </Table>
 {modalType && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalType === "add"
                    ? "Add Task"
                    : modalType === "view"
                    ? "View Task"
                    : "Edit Task"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                {modalType === "add" ? (
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label htmlFor="Project" className="form-label">
                          Select Project
                        </label>
                        <select
                          name="projectId"
                          className="form-select form-control"
                          id="Project"
                          onChange={handleChange}
                        >
                          <option value="">Select Project</option>
                          {projects.length > 0 &&
                            projects.map((project) => (
                              <option
                                value={project._id}
                                className="dropdown-projects"
                                key={project._id}
                              >
                                {project.projectName}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Select Task</label>
                        <select
                          name="taskId"
                          className="form-select form-control"
                          onChange={handleChange}
                        >
                          <option value="">Select Task</option>
                          {tasks.length > 0 &&
                            tasks.map((task) => (
                              <option value={task._id} key={task._id}>
                                {task.taskName}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Task Amount</label>
                        <input
                          type="number"
                          name="taskAmount"
                          className="form-control"
                          onChange={handleChange}
                          placeholder="Enter task amount"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Task Quantity</label>
                        <input
                          type="number"
                          name="taskQuantity"
                          className="form-control"
                          onChange={handleChange}
                          placeholder="Enter task quantity"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Task Description</label>
                        <textarea
                          name="description"
                          className="form-control"
                          onChange={handleChange}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                ) : modalType === "view" ? (
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3 d-flex">
                        <div className="fw-semibold w-25">📌 Project Name:</div>
                        <div className="text-muted">
                          {taskData?.projectName || "N/A"}
                        </div>
                      </div>
                      <div className="mb-3 d-flex">
                        <div className="fw-semibold w-25">📝 Task Name:</div>
                        <div className="text-muted">
                          {taskData?.taskName || "N/A"}
                        </div>
                      </div>
                      <div className="mb-3 d-flex">
                        <div className="fw-semibold w-25">💰 Amount:</div>
                        <div className="text-muted">
                          {taskData?.taskAmount
                            ? taskData.taskAmount.toFixed(2)
                            : "N/A"}
                        </div>
                      </div>
                      <div className="mb-3 d-flex">
                        <div className="fw-semibold w-25">
                          📦 Task Quantity:
                        </div>
                        <div className="text-muted">
                          {taskData?.taskQuantity || "N/A"}
                        </div>
                      </div>
                      <div className="mb-3 d-flex">
                        <div className="fw-semibold w-25">📖 Description:</div>
                        <div className="text-muted">
                          {taskData?.description || "N/A"}
                        </div>
                      </div>
                      <h5>Task Update History</h5>
                      <div className="table-responsive">
                        <table className="table table-bordered align-middle text-center table-striped">
                          <thead className="table-dark">
                            <tr>
                              <th>S.No</th>
                              <th>Update Description</th>
                              <th>Update Video/Images</th>
                              <th>Update Status</th>
                              <th>Updated At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {taskData?.taskUpdateHistory &&
                            taskData.taskUpdateHistory.length > 0 ? (
                              taskData.taskUpdateHistory.map(
                                (update, index) => (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{update.updateDescription}</td>
                                    <td>
                                      {update.updatePhotos.map(
                                        (photo, imgIndex) => (
                                          <a
                                            key={imgIndex}
                                            href={photo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary d-block"
                                          >
                                            View {imgIndex + 1}
                                          </a>
                                        )
                                      )}
                                    </td>
                                    <td>
                                      {update.status === "completed" ? (
                                        <span className="badge bg-success">
                                          Completed
                                        </span>
                                      ) : update.status === "in progress" ? (
                                        <span className="badge bg-primary">
                                          In Progress
                                        </span>
                                      ) : (
                                        <span className="badge bg-warning">
                                          Pending
                                        </span>
                                      )}
                                    </td>
                                    <td>
                                      {new Date(
                                        update.updatedAt
                                      ).toLocaleString("en-US")}
                                    </td>
                                  </tr>
                                )
                              )
                            ) : (
                              <tr>
                                <td colSpan="5" className="text-center">
                                  No updates available
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="Project" className="form-label">
                            Select Project
                          </label>
                          <select
                            name="projectId"
                            className="form-select form-control"
                            id="Project"
                            value={taskData.projectId}
                            onChange={handleChange}
                          >
                            <option value="">Select Project</option>
                            {projects.length > 0 &&
                              projects.map((project) => (
                                <option
                                  value={project._id}
                                  className="dropdown-projects"
                                  key={project._id}
                                >
                                  {project.projectName}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Select Task</label>
                          <select
                            name="taskId"
                            className="form-select form-control"
                            id="taskId"
                            value={taskData.taskId}
                            onChange={handleChange}
                          >
                            <option value="">Select Task</option>
                            <option value="">Select Task</option>
                            {tasks.length > 0 &&
                              tasks.map((task) => (
                                <option value={task._id} key={task._id}>
                                  {task.taskName}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Task Amount</label>
                          <input
                            type="number"
                            name="taskAmount"
                            className="form-control"
                            value={taskData.taskAmount}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Task Quantity</label>
                          <input
                            type="number"
                            name="taskQuantity"
                            className="form-control"
                            value={taskData.taskQuantity}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label
                            htmlFor="TaskDescription"
                            className="form-label"
                          >
                            Task Description
                          </label>
                          <textarea
                            id="TaskDescription"
                            name="description"
                            className="form-control"
                            onChange={handleChange}
                            value={taskData.description}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
                {modalType === "add" ? (
                  <Button
                    variant="primary"
                    onClick={saveTaskDetails}
                    disabled={disabled}
                  >
                    Save
                  </Button>
                ) : (
                  modalType === "edit" && (
                    <Button
                      variant="primary"
                      onClick={updateTaskDetails}
                      disabled={disabled}
                    >
                      Update
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProjectTask;

