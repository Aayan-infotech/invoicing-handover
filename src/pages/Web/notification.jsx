import React, { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import axiosInstance from "../../components/axiosInstance";
import Loading from "../../components/Loading/Loading";
import PaginationWeb from "../../components/PaginationWeb";
import { images } from "../../contstants";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleIcon from "@mui/icons-material/Circle";

const Notification = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("All");
  const [loading, setLoading] = useState(true);
  const { snackbar } = useOutletContext();
  const [data, setData] = useState({
    notifications: [],
    total_page: 0,
    current_page: 1,
    total_records: 0,
    per_page: 10,
  });

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    // Reset to first page when changing tabs
    setCurrentPage(1);
  };

  const getAllData = async (page = 1) => {
    setLoading(true);

    try {
      // You can add pagination parameters if your API supports it
      // Example: `users/get-notifications?page=${page}&limit=${perPage}`
      const response = await axiosInstance.get("users/get-notifications", {
        params: {
          page,
          limit: perPage,
        },
      });

      if (response) {
        setData(response.data.data);
        setCurrentPage(response.data.data.current_page || 1);
        snackbar.success(response?.data?.message);
      }
    } catch (error) {
      snackbar.error(
        error?.response?.data?.message || "Error fetching notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    getAllData(newPage);
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await axiosInstance.put(
        "users/update-notification-status",
        {
          notificationId,
          isRead: true,
        }
      );

      if (response.data.success) {
        // Update the local state to mark the notification as read
        setData((prevData) => ({
          ...prevData,
          notifications: prevData.notifications.map((notification) =>
            notification.notificationId === notificationId
              ? { ...notification, isRead: true }
              : notification
          ),
        }));
        snackbar.success("Notification marked as read");
      }
    } catch (error) {
      snackbar.error(
        error?.response?.data?.message || "Error updating notification status"
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      // Get all unread notification IDs
      const unreadNotifications = data.notifications.filter((n) => !n.isRead);

      // Mark each unread notification as read
      for (const notification of unreadNotifications) {
        await markAsRead(notification.notificationId);
      }

      snackbar.success("All notifications marked as read");
    } catch (error) {
      snackbar.error("Error marking all as read");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? "s" : ""} ago`;
    }
  };

  const filterNotifications = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (value) {
      case "Week":
        return data.notifications.filter(
          (notification) => new Date(notification.createdAt) >= weekAgo
        );
      case "Month":
        return data.notifications.filter(
          (notification) => new Date(notification.createdAt) >= monthAgo
        );
      default:
        return data.notifications;
    }
  };

  useEffect(() => {
    getAllData(currentPage);
  }, []);

  if (loading) {
    return <Loading />;
  }

  const filteredNotifications = filterNotifications();
  const unreadCount = data.notifications.filter((n) => !n.isRead).length;

  return (
    <div className="container">
      <div className="py-4">
        <div className="d-flex flex-row gap-3 align-items-center justify-content-between">
          <h2 className="text-light d-inline">
            Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
          </h2>

          {unreadCount > 0 && (
            <Button
              variant="outlined"
              onClick={markAllAsRead}
              sx={{
                color: "#fff",
                borderColor: "#fff",
                "&:hover": {
                  borderColor: "#ccc",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Mark all as read
            </Button>
          )}
        </div>

        <div className="mt-5">
          <Box
            className="mt-2 notification-tabs"
            sx={{ width: "100%", typography: "body1" }}
          >
            <TabContext value={value} className=" ">
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <TabList
                  onChange={handleChange}
                  className="custom-tab-selection"
                  aria-label="lab API tabs example"
                  sx={{
                    "& .MuiTabs-scroller": {
                      overflow: "visible !important",
                    },
                    "& .MuiTabs-flexContainer": {
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      width: "100%",
                    },
                  }}
                >
                  <Tab
                    label="All"
                    value="All"
                    sx={{
                      width: "100%",
                      minWidth: "auto",
                      textTransform: "none",
                    }}
                  />
                  <Tab
                    label="Week"
                    value="Week"
                    sx={{
                      width: "100%",
                      minWidth: "auto",
                      textTransform: "none",
                    }}
                  />
                  <Tab
                    label="Month"
                    value="Month"
                    sx={{
                      width: "100%",
                      minWidth: "auto",
                      textTransform: "none",
                    }}
                  />
                </TabList>
              </Box>

              <TabPanel value="All" className="px-0">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-light">No notifications found</p>
                  </div>
                ) : (
                  <>
                    <div className="d-flex flex-column gap-3">
                      {filteredNotifications.map((notification) => (
                        <div
                          key={notification.notificationId}
                          className={`card ${
                            notification.isRead
                              ? "bg-primary"
                              : "bg-primary-dark"
                          } border-0 rounded-4`}
                        >
                          <div className="card-body p-3 px-4">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                  <h5 className="mb-0 text-dark">
                                    {notification.title}
                                  </h5>
                                  {!notification.isRead && (
                                    <CircleIcon
                                      sx={{
                                        fontSize: 12,
                                        color: "#4dabf7",
                                      }}
                                    />
                                  )}
                                </div>
                                <p className="mb-2 text-dark">
                                  {notification.body}
                                </p>
                                <small className="text-muted">
                                  {formatDate(notification.createdAt)}
                                </small>
                              </div>
                              {!notification.isRead && (
                                <Button
                                  variant="text"
                                  size="small"
                                  onClick={() =>
                                    markAsRead(notification.notificationId)
                                  }
                                  sx={{
                                    color: "#4dabf7",
                                    minWidth: "auto",
                                    padding: "4px 8px",
                                  }}
                                >
                                  Mark as read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination for All tab */}
                    {data.total_page > 1 && (
                      <div className="mt-4">
                        <PaginationWeb
                          currentPage={currentPage}
                          totalPages={data.total_page}
                          onPageChange={handlePageChange}
                          maxVisiblePages={5}
                          showPreviousNext={true}
                          showFirstLast={true}
                          className=""
                        />
                      </div>
                    )}
                  </>
                )}
              </TabPanel>

              <TabPanel value="Week" className="px-0">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-light">
                      No notifications from the past week
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="d-flex flex-column gap-3">
                      {filteredNotifications.map((notification) => (
                        <div
                          key={notification.notificationId}
                          className={`card ${
                            notification.isRead
                              ? "bg-primary"
                              : "bg-primary-dark"
                          } border-0 rounded-4`}
                        >
                          <div className="card-body p-3 px-4">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                  <h5 className="mb-0 text-dark">
                                    {notification.title}
                                  </h5>
                                  {!notification.isRead && (
                                    <CircleIcon
                                      sx={{
                                        fontSize: 12,
                                        color: "#4dabf7",
                                      }}
                                    />
                                  )}
                                </div>
                                <p className="mb-2 text-dark">
                                  {notification.body}
                                </p>
                                <small className="text-dark">
                                  {formatDate(notification.createdAt)}
                                </small>
                              </div>
                              {!notification.isRead && (
                                <Button
                                  variant="text"
                                  size="small"
                                  onClick={() =>
                                    markAsRead(notification.notificationId)
                                  }
                                  sx={{
                                    color: "#4dabf7",
                                    minWidth: "auto",
                                    padding: "4px 8px",
                                  }}
                                >
                                  Mark as read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Note: Week and Month tabs show filtered results but don't have server-side pagination
                        You can add client-side pagination if needed */}
                  </>
                )}
              </TabPanel>

              <TabPanel value="Month" className="px-0">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-light">
                      No notifications from the past month
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="d-flex flex-column gap-3">
                      {filteredNotifications.map((notification) => (
                        <div
                          key={notification.notificationId}
                          className={`card ${
                            notification.isRead
                              ? "bg-primary"
                              : "bg-primary-dark"
                          } border-0 rounded-4`}
                        >
                          <div className="card-body p-3 px-4">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                  <h5 className="mb-0 text-dark">
                                    {notification.title}
                                  </h5>
                                  {!notification.isRead && (
                                    <CircleIcon
                                      sx={{
                                        fontSize: 12,
                                        color: "#4dabf7",
                                      }}
                                    />
                                  )}
                                </div>
                                <p className="mb-2 text-dark">
                                  {notification.body}
                                </p>
                                <small className="text-dark">
                                  {formatDate(notification.createdAt)}
                                </small>
                              </div>
                              {!notification.isRead && (
                                <Button
                                  variant="text"
                                  size="small"
                                  onClick={() =>
                                    markAsRead(notification.notificationId)
                                  }
                                  sx={{
                                    color: "#4dabf7",
                                    minWidth: "auto",
                                    padding: "4px 8px",
                                  }}
                                >
                                  Mark as read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </TabPanel>
            </TabContext>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default Notification;
