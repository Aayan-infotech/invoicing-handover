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

function AssignTasks() {
  const userState = useSelector((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [refreshTable, setRefreshTable] = useState(false);

  const [pagination, setPagination] = useState({
    current_page: 1,
    total_page: 1,
    per_page: 10,
    total_records: 0,
  });

  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState({
    projectId: "",
    taskId: "",
    userId: "",
  });

  const [disabled, setDisabled] = useState(false);

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
      const response = await fetchWithAuth(`${links.BASE_URL}projects/project-dropdown`);
      setProjects(response?.data?.data || []);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to fetch projects";
      toast.error(message);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetchWithAuth(`${links.BASE_URL}users/all-verified-users`);
      setUsers(response?.data?.data || []);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to fetch users";
      toast.error(message);
    }
  };

  const fetchTasks = async (projectId) => {
    try {
      const response = await fetchWithAuth(`${links.BASE_URL}projects/tasks/${projectId}`);
      setTasks(response?.data?.data || []);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to fetch tasks";
      toast.error(message);
    }
  };

  const fetchAssignedTasks = async () => {
    try {
      setLoading(true);

      const response = await fetchWithAuth(`${links.BASE_URL}projects/assign-tasks`, {
        method: "GET",
        params: {
          page: pagination.current_page,
          limit: pagination.per_page,
          search: debouncedSearchTerm,
          sortBy: sortConfig.key,
          sortDirection: sortConfig.direction,
        },
      });

      if (response.data.success) {
        setAssignedTasks(response?.data?.data?.tasks || []);
        setPagination({
          current_page: response?.data?.data?.current_page,
          total_page: response?.data?.data?.total_page,
          per_page: response?.data?.data?.per_page,
          total_records: response?.data?.data?.total_records,
        });
      }

      setLoading(false);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to fetch assigned tasks";
      toast.error(message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
    fetchAssignedTasks();
  }, [pagination.current_page, refreshTable, debouncedSearchTerm, sortConfig]);

  // FORM HANDLERS
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "projectId") {
      fetchTasks(value);
      setFormData((prev) => ({ ...prev, taskId: "" }));
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTask = () => {
    setModalType("add");
    setFormData({
      projectId: "",
      taskId: "",
      userId: "",
    });
  };

  const handleCloseModal = () => {
    setModalType(null);
    setFormData({
      id: "",
      projectId: "",
      taskId: "",
      userId: "",
    });
  };

  const saveAssignTask = async () => {
    try {
      setDisabled(true);

      await axios.post(
        `${links.BASE_URL}projects/assign-tasks`,
        {
          projectId: formData.projectId,
          taskId: formData.taskId,
          userId: formData.userId,
        },
        {
          headers: { Authorization: `Bearer ${userState.userInfo.accessToken}` },
        }
      );

      toast.success("Task assigned successfully");
      setModalType(null);
      setDisabled(false);
      setRefreshTable((p) => !p);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to assign task";
      toast.error(message);
      setDisabled(false);
    }
  };

  const handleView = (idx) => {
    const item = assignedTasks[idx];
    setFormData({
      projectName: item.projectName,
      taskName: item.taskName,
      username: item.username,
    });
    setModalType("view");
  };

  const handleEdit = (idx) => {
    const item = assignedTasks[idx];
    setFormData({
      id: item._id,
      projectId: item.projectId,
      taskId: item.taskId,
      userId: item.userId,
    });

    fetchTasks(item.projectId);
    setModalType("edit");
  };

  const updateTaskDetails = async () => {
    try {
      setDisabled(true);

      await axios.put(
        `${links.BASE_URL}projects/assign-tasks/${formData.id}`,
        {
          projectId: formData.projectId,
          taskId: formData.taskId,
          userId: formData.userId,
        },
        {
          headers: { Authorization: `Bearer ${userState.userInfo.accessToken}` },
        }
      );

      toast.success("Assigned task updated");
      setModalType(null);
      setDisabled(false);
      setRefreshTable((p) => !p);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to update assigned task";
      toast.error(message);
      setDisabled(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      <Table
        PageTitle="Assign Tasks"
        pagination={pagination}
        setPagination={setPagination}
        dataLength={assignedTasks.length}
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
                columnKey="username"
                label="Assigned User"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {assignedTasks.length > 0 ? (
              assignedTasks.map((item, idx) => (
                <tr key={item._id}>
                  <td>{item.projectName || "N/A"}</td>
                  <td>{item.taskName || "N/A"}</td>
                  <td>{item.username || "N/A"}</td>

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
                <td colSpan="4" className="text-center">
                  No assigned tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Table>

      {/* ---------------- MODAL (Same as your code) ---------------- */}
       {/* Modal */}
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
                    ? "Assign Task"
                    : modalType === "view"
                    ? "View Assign Task"
                    : "Edit Assign Task"}
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
                        <label htmlFor="Task" className="form-label">
                          Select Task
                        </label>
                        <select
                          name="taskId"
                          className="form-select form-control"
                          id="Task"
                          onChange={handleChange}
                        >
                          <option value="">Select Task</option>
                          {tasks.length > 0 &&
                            tasks.map((task) => (
                              <option
                                value={task._id}
                                className="dropdown-tasks"
                                key={task._id}
                              >
                                {task.taskName}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="User" className="form-label">
                          Select User
                        </label>
                        <select
                          name="userId"
                          className="form-select form-control"
                          id="User"
                          onChange={handleChange}
                        >
                          <option value="">Select User</option>
                          {users.length > 0 &&
                            users.map((user) => (
                              <option
                                value={user.userId}
                                className="dropdown-users"
                                key={user.userId}
                              >
                                {`${user.username} (${
                                  user.name ? user.name : "-"
                                })`}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ) : modalType === "view" ? (
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3 d-flex">
                        <div className="fw-semibold w-25">📌 Project Name:</div>
                        <div className="text-muted">
                          {formData?.projectName || "N/A"}
                        </div>
                      </div>
                      <div className="mb-3 d-flex">
                        <div className="fw-semibold w-25">📝 Task Name:</div>
                        <div className="text-muted">
                          {formData?.taskName || "N/A"}
                        </div>
                      </div>
                      <div className="mb-3 d-flex">
                        <div className="fw-semibold w-25">👤 Username:</div>
                        <div className="text-muted">
                          {formData?.username || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form>
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
                            value={formData.projectId}
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
                          <label htmlFor="Task" className="form-label">
                            Select Task
                          </label>
                          <select
                            name="taskId"
                            className="form-select form-control"
                            id="Task"
                            value={formData.taskId}
                            onChange={handleChange}
                          >
                            <option value="">Select Task</option>
                            {tasks.length > 0 &&
                              tasks.map((task) => (
                                <option
                                  value={task._id}
                                  className="dropdown-tasks"
                                  key={task._id}
                                >
                                  {task.taskName}
                                </option>
                              ))}
                          </select>
                        </div>

                        <div className="mb-3">
                          <label htmlFor="User" className="form-label">
                            Select User
                          </label>
                          <select
                            name="userId"
                            className="form-select form-control"
                            id="User"
                            value={formData.userId}
                            onChange={handleChange}
                          >
                            <option value="">Select User</option>
                            {users.length > 0 &&
                              users.map((user) => (
                                <option
                                  value={user.userId}
                                  className="dropdown-users"
                                  key={user.userId}
                                >
                                  {`${user.username} (${
                                    user.name ? user.name : "-"
                                  })`}
                                </option>
                              ))}
                          </select>
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
                    onClick={saveAssignTask}
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

export default AssignTasks;
