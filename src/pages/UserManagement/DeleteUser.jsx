import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";
import "./Users.css";
import { toast } from "react-toastify";
import axios from "axios";
import { fetchWithAuth } from "../../api/authFetch";
import { useSelector } from "react-redux";

export default function DeleteUser() {
  const userState = useSelector((state) => state.user);
  const [deleteRequests, setDeleteRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionType, setActionType] = useState(""); // should be "approved" or "rejected"
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchDeleteRequests();
  }, []);

  const fetchDeleteRequests = async () => {
    try {
      setLoading(true);

      const response = await fetchWithAuth(
        "http://52.20.55.193:3030/api/users/get-all-delete-request",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const requests = response.data.data?.deleteRequests || [];
        setDeleteRequests(requests);

        if (requests.length === 0) {
          toast.info("No delete account requests found");
        }
      } else {
        toast.error(response.data.message || "Failed to fetch requests");
      }
    } catch (error) {
      toast.error("Failed to fetch delete requests");
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (request, action) => {
    setSelectedRequest(request);
    setActionType(action); // must be "approved" or "rejected"
    setShowConfirmation(true);
  };

  const processRequest = async () => {
  try {
    setProcessing(true);
    const token = userState.userInfo.accessToken;

    const response = await axios.put(
      "http://52.20.55.193:3030/api/users/update-delete-request",
      {
        requestId: selectedRequest._id,
        status: actionType, // "approved" or "rejected"
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      toast.success(response.data.message || "Request processed successfully");

      // Remove request from list after success
      setDeleteRequests((prev) =>
        prev.filter((req) => req._id !== selectedRequest._id)
      );
    } else {
      toast.error(response.data.message || "Action failed");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to process request");
  } finally {
    setProcessing(false);
    setShowConfirmation(false);
  }
};


  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 bg-light">
        <Topbar />
        <div className="p-4">
          <h3 className="mb-4 fw-bold text-dark">🗑️ Delete Account Requests</h3>

          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : deleteRequests.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered align-middle text-center table-striped">
                <thead className="table-dark">
                  <tr>
                    <th>User Info</th>
                    <th>Request Details</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deleteRequests.map((request) => (
                    <tr key={request._id}>
                      <td className="text-start">
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={request.profile_image || "https://i.pravatar.cc/40"}
                            alt="avatar"
                            className="rounded-circle"
                            width="40"
                            height="40"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://i.pravatar.cc/40";
                            }}
                          />
                          <div>
                            <div className="fw-bold">{request.name}</div>
                            <div className="text-muted small">{request.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-start">
                        <strong>Reason:</strong>
                        <div>{request.reason || "No reason provided"}</div>
                        <div className="text-muted small mt-2">
                          Requested: {new Date(request.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            request.status === "approved"
                              ? "bg-success"
                              : request.status === "rejected"
                              ? "bg-danger"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {request.status || "pending"}
                        </span>
                      </td>
                      <td>
                        {(!request.status || request.status === "pending") ? (
                          <>
                            <button
                              className="btn btn-success btn-sm me-2"
                              onClick={() => handleActionClick(request, "approved")}
                              disabled={processing}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleActionClick(request, "rejected")}
                              disabled={processing}
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-muted">Action taken</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">No delete account requests found</div>
          )}

          {/* Confirmation Modal */}
          {showConfirmation && (
            <div className="modal show fade d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      Confirm {actionType === "approved" ? "Approval" : "Rejection"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowConfirmation(false)}
                      disabled={processing}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>
                      Are you sure you want to <strong>{actionType}</strong> the delete request for{" "}
                      <strong>{selectedRequest?.name}</strong>?
                    </p>
                    {actionType === "approved" && (
                      <div className="alert alert-danger">
                        This will permanently delete the user's account!
                      </div>
                    )}
                    <div className="mt-3">
                      <strong>Reason:</strong>
                      <p className="border p-2 rounded mt-1">{selectedRequest?.reason || "No reason provided"}</p>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowConfirmation(false)}
                      disabled={processing}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className={`btn ${actionType === "approved" ? "btn-danger" : "btn-warning"}`}
                      onClick={processRequest}
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Processing...
                        </>
                      ) : (
                        `Confirm ${actionType}`
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
