import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";
import "./Task.css";
import axios from "axios";
import { fetchWithAuth } from "../../utils/authFetch";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { links } from "../../contstants";
import Pagination from "../../components/Pagination";
import Loading from "../../components/Loading/Loading";
import { useSelector } from "react-redux";
import Table from "../../components/Table";
import SortableTh from "../../components/SortableTh";
import { useDebounce } from "../../hooks/useDebounce";

function Task() {
  const userState = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_page: 1,
    per_page: 10,
    total_records: 0,
  });
  const [modalType, setModalType] = useState(null);
  const [taskData, setTaskData] = useState({
    taskName: "",
    amount: "",
    status: "",
    description: "",
  });
  const [disabled, setDisabled] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const clearSearch = () => {
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${links.BASE_URL}projects/tasks`, {
        method: "GET",
        params: {
          page: pagination.current_page,
          limit: pagination.per_page,
          sortBy: sortConfig.key,
          sortDirection: sortConfig.direction,
          search: debouncedSearchTerm,
        },
      });

      setTasks(response?.data?.data?.tasks ? response.data.data.tasks : []);
      setPagination({
        current_page: response?.data?.data?.current_page || 1,
        total_page: response?.data?.data?.total_page || 1,
        per_page: response?.data?.data?.per_page || 10,
        total_records: response?.data?.data?.total_records || 0,
      });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      toast.error("Failed to fetch tasks");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [pagination.current_page, sortConfig, debouncedSearchTerm]);

  const handleCloseModal = () => {
    setModalType(null);
    setTaskData({
      projectId: "",
      taskName: "",
      taskAmount: "",
      description: "",
    });
  };

  const handleAddTask = () => {
    setModalType("add");
    setTaskData({
      taskName: "",
      description: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveTaskDetails = async () => {
    try {
      setDisabled(true);
      const result = await axios.post(
        `${links.BASE_URL}projects/tasks`,
        {
          taskName: taskData.taskName,
          amount: taskData.amount,
          status: taskData.status,
          description: taskData.description,
        },
        {
          headers: {
            Authorization: `Bearer ${userState.userInfo.accessToken}`,
          },
        }
      );
      toast.success("Task saved successfully");
      setModalType(null);
      setTaskData({
        taskName: "",
        amount: "",
        status: "",
        description: "",
      });
      setDisabled(false);
      setTasks((prev) => [result.data.data.task, ...prev]);
    } catch (err) {
      const response = err.response.data;
      setLoading(false);
      setDisabled(false);
      if (response && response.message) {
        toast.error(response.message);
      } else {
        toast.error("Failed to save task details");
      }
    }
  };

  const handleView = async (idx) => {
    const task = tasks[idx];
    setTaskData({
      taskName: task.taskName,
      description: task.description || "N/A",
      amount: task.amount || "N/A",
      status: task.status || "N/A",
    });
    setModalType("view");
  };

  const handleEdit = (idx) => {
    const task = tasks[idx];
    setTaskData({
      description: task.description || "",
      taskName: task.taskName || "",
      amount: task.amount || "",
      status: task.status || "",
      id: task._id || "",
    });
    setModalType("edit");
  };

  const updateTaskDetails = async () => {
    try {
      setDisabled(true);
      const result = await axios.put(
        `${links.BASE_URL}projects/tasks/${taskData.id}`,
        {
          taskName: taskData.taskName,
          status: taskData.status,
          description: taskData.description,
        },
        {
          headers: {
            Authorization: `Bearer ${userState.userInfo.accessToken}`,
          },
        }
      );
      toast.success("Task updated successfully");
      setModalType(null);
      setDisabled(false);
      setTasks((prev) =>
        prev.map((task) => (task._id === taskData.id ? result.data.data : task))
      );
      setTaskData({
        taskName: "",
        description: "",
      });
    } catch (err) {
      const response = err.response.data;
      setLoading(false);
      setDisabled(false);
      if (response && response.message) {
        toast.error(response.message);
      } else {
        toast.error("Failed to update task details");
      }
    }
  };

  const handleDelete = async (taskId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(
            `${links.BASE_URL}projects/tasks/${taskId}`,
            {
              headers: {
                Authorization: `Bearer ${userState.userInfo.accessToken}`,
              },
            }
          );
          toast.success("Task deleted successfully");
          setTasks((prev) => prev.filter((task) => task._id !== taskId));
        } catch (err) {
          const response = err.response.data;
          if (response && response.message) {
            toast.error(response.message);
          } else {
            toast.error("Failed to delete task");
          }
        }
      }
    });
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  return (
    <>
      <Table
        PageTitle="🗂️ Task Management"
        pagination={pagination}
        setPagination={setPagination}
        dataLength={tasks.length || 0}
        handleAdd={handleAddTask}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
      >
        <table className="table table-bordered align-middle text-center table-striped">
          <thead className="table-dark">
            <tr>
              <SortableTh
                columnKey="taskName"
                label="Task Name"
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
            {loading ? (
              <tr>
                <td colSpan="3" className="text-center py-5">
                  <Loading />
                </td>
              </tr>
            ) : tasks.length > 0 ? (
              tasks.map((task, idx) => (
                <tr key={task._id}>
                  <td className="text-start">{task.taskName}</td>
                  <td>
                    {task.status === "active" ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-danger">Blocked</span>
                    )}
                  </td>
                  <td>
                    <i
                      className="bi bi-eye text-primary fs-5 me-3"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleView(idx)}
                      title="View Task"
                    ></i>
                    <i
                      className="bi bi-pencil text-warning fs-5"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleEdit(idx)}
                      title="Edit Task"
                    ></i>
                    <i
                      className="bi bi-trash text-danger fs-5 ms-3"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDelete(task._id)}
                      title="Delete Task"
                    ></i>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Table>

      {/* <Table
        PageTitle="👥 User Management"
        pagination={pagination}
        setPagination={setPagination}
        dataLength={users.length || 0}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
      >
        <table className="table table-bordered align-middle text-center table-striped">
          <thead className="table-dark">
            <tr>
              <SortableTh
                columnKey="name"
                label="Avatar & Name"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <SortableTh
                columnKey="username"
                label="Username"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <SortableTh
                columnKey="email"
                label="Email"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <SortableTh
                columnKey="mobile"
                label="Mobile"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <SortableTh
                columnKey="isVerified"
                label="Email Verified"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-5">
                  <Loading /> 
                </td>
              </tr>
            ) : users.length > 0 ? (
              users.map((user, idx) => (
                <tr key={user._id}>
                  <td className="d-flex align-items-center gap-2 justify-content-start">
                    <img
                      src={user.profile_image || images.placeholder}
                      alt="avatar"
                      className="rounded-circle"
                      width="40"
                      height="40"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = images.placeholder;
                      }}
                    />
                    <span>{user.name}</span>
                  </td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td className="text-success">{user.mobile}</td>
                  <td>
                    {user.isVerified ? (
                      <span className="badge bg-success">verified</span>
                    ) : (
                      <span className="badge bg-danger">unverified</span>
                    )}
                  </td>
                  <td>
                    <i
                      className="bi bi-eye text-primary fs-5 me-3"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleView(idx)}
                      title="View User"
                    ></i>
                    <i
                      className="bi bi-pencil text-warning fs-5"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleEdit(idx)}
                      title="Edit User"
                    ></i>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Table> */}

      {/* <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-dark">Task Management</h3>
        <Button title="Add Task" onClick={handleAddTask} variant="primary">
          Add Task
        </Button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered align-middle text-center table-striped">
          <thead className="table-dark">
            <tr>
              <th>Task Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="text-center py-5">
                  <Loading />
                </td>
              </tr>
            ) : tasks.length > 0 ? (
              tasks.map((task, idx) => (
                <tr key={task._id}>
                  <td>{task.taskName}</td>
                  <td>
                    {task.status === "active" ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-danger">Blocked</span>
                    )}
                  </td>
                  <td>
                    <i
                      className="bi bi-eye text-primary fs-5 me-3"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleView(idx)}
                      title="View Project"
                    ></i>
                    <i
                      className="bi bi-pencil text-warning fs-5"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleEdit(idx)}
                      title="Edit Project"
                    ></i>
                    <i
                      className="bi bi-trash text-danger fs-5 ms-3"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDelete(task._id)}
                      title="Delete Project"
                    ></i>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        onPageChange={(page) =>
          setPagination((prev) => ({ ...prev, current_page: page }))
        }
        currentPage={pagination.current_page}
        totalPageCount={pagination.total_page}
      /> */}

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
                        <label className="form-label">Task Name</label>
                        <input
                          type="text"
                          name="taskName"
                          className="form-control"
                          onChange={handleChange}
                          placeholder="Enter task name"
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
                        <div className="fw-semibold w-25">📝 Task Name:</div>
                        <div className="text-muted">
                          {taskData?.taskName || "N/A"}
                        </div>
                      </div>
                      <div className="mb-3 d-flex">
                        <div className="fw-semibold w-25">📊 Status:</div>
                        <div className="text-muted">
                          {taskData.status === "active" ? (
                            <span className="badge bg-success">Active</span>
                          ) : (
                            <span className="badge bg-danger">Blocked</span>
                          )}
                        </div>
                      </div>
                      <div className="mb-3 d-flex">
                        <div className="fw-semibold w-25">📖 Description:</div>
                        <div className="text-muted">
                          {taskData?.description || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Task Name</label>
                          <input
                            type="text"
                            name="taskName"
                            className="form-control"
                            value={taskData.taskName}
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

                        <div className="mb-3">
                          <label className="form-label">Status</label>
                          <select
                            name="status"
                            className="form-select"
                            value={taskData.status}
                            onChange={handleChange}
                          >
                            <option value="">Select Status</option>
                            <option value="active">Active</option>
                            <option value="blocked">Blocked</option>
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

export default Task;
