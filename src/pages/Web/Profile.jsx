import React, { useState, useEffect } from "react";
import {
  Outlet,
  Link,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import { images } from "../../contstants";
import axiosInstance from "../../components/axiosInstance";
import Loading from "../../components/Loading/Loading";

export default function Profile() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showMobileContent, setShowMobileContent] = useState(false);
  const { snackbar } = useOutletContext();

  const getProfileData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("users/get-profile");
      if (response) {
        setUser(response.data.data);
        snackbar.success(response?.data?.message);
      }
    } catch (error) {
      snackbar.error(
        error?.response?.data?.message || "Error fetching Profile"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfileData();
  }, []);

  // // Reset mobile view when location changes
  // useEffect(() => {
  //   // Show content section on mobile when we're not on the base profile path
  //   if (location.pathname !== "/profile") {
  //     setShowMobileContent(true);
  //   } else {
  //     setShowMobileContent(false);
  //   }
  // }, [location.pathname]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    console.log(userAgent);

    // Get Browser
    let browser = "Unknown";
    if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Edge")) browser = "Edge";
    else if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
      browser = "Safari";
    else if (userAgent.includes("Opera") || userAgent.includes("OPR"))
      browser = "Opera";
    else if (userAgent.includes("MSIE") || userAgent.includes("Trident/7"))
      browser = "Internet Explorer";
    else if (userAgent.includes("brave")) browser = "Brave";
    else if (userAgent.includes("Vivaldi")) browser = "Vivaldi";
    else if (userAgent.includes("Yandex")) browser = "Yandex";

    return `${browser}`;
  };

  const handleConfirmLogout = async () => {
    setLogoutLoading(true);
    try {
      const response = await axiosInstance.post("auth/logout", {
        deviceName: getDeviceInfo(), // e.g., "Chrome"
        deviceType: "web",
      });
      if (response) {
        snackbar.success(response?.data?.message || "Logged out successfully");

        // Clear any stored tokens or user data
        localStorage.removeItem("RefreshToken");
        localStorage.removeItem("token");

        // Navigate to login page
        navigate("/login");
      }
    } catch (error) {
      snackbar.error(error?.response?.data?.message || "Error during logout");
      // Even if API fails, clear local storage and redirect
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      navigate("/login");
    } finally {
      setLogoutLoading(false);
      setShowLogoutModal(false);
    }
  };

  const handleBackToMenu = () => {
    setShowMobileContent(false);
    navigate("/profile");
  };

  const handleNavLinkClick = () => {
    // On mobile, show the content section when a link is clicked
    if (window.innerWidth < 992) {
      // LG breakpoint
      setShowMobileContent(true);
    }
  };

  return (
    <div className="container">
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title w-100 text-center">
                  Confirm Logout
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCancelLogout}
                  disabled={logoutLoading}
                ></button>
              </div>
              <div className="modal-body text-center">
                <p>Are you sure you want to logout?</p>
              </div>
              <div className="modal-footer justify-content-between border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelLogout}
                  disabled={logoutLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmLogout}
                  disabled={logoutLoading}
                >
                  {logoutLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Logging out...
                    </>
                  ) : (
                    "Yes, Logout"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : (
        <div className="row h-100 mt-4 pb-4 gy-4">
          {/* Sidebar Navigation - Hidden on mobile when content is shown */}
          <div
            className={`col-lg-4 ${
              showMobileContent ? "d-none d-lg-block" : ""
            }`}
          >
            <div className="card shadow-sm h-100">
              <div className="card-body p-0">
                <nav className="nav flex-column gap-4">
                  <Link
                    to="/profile"
                    className={`nav-link py-3 px-3 rounded ${
                      location.pathname === "/profile"
                        ? "nav-custom active"
                        : "nav-custom "
                    }`}
                    onClick={handleNavLinkClick}
                  >
                    <div className=""> Update Profile </div>
                    <div className="">
                      <img
                        src={images.avatar}
                        alt="Profile"
                        className="profile-icon"
                      />
                      <i className="bi bi-chevron-right"></i>
                    </div>
                  </Link>
                  <Link
                    to="/security-setting"
                    className={`nav-link py-3 px-3 rounded ${
                      location.pathname === "/security-setting"
                        ? "nav-custom active"
                        : "nav-custom "
                    }`}
                    onClick={handleNavLinkClick}
                  >
                    <div>Security Setting</div>
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link
                    to="/activity"
                    className={`nav-link py-3 px-3 rounded ${
                      location.pathname === "/activity"
                        ? "nav-custom active"
                        : "nav-custom "
                    }`}
                    onClick={handleNavLinkClick}
                  >
                    <div>Activity</div>
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  {/* <Link
                    to="/profile-notification"
                    className={`nav-link py-3 px-3 rounded ${
                      location.pathname === "/profile-notification"
                        ? "nav-custom active"
                        : "nav-custom "
                    }`}
                    onClick={handleNavLinkClick}
                  >
                    <div>Notifications</div>
                    <i className="bi bi-chevron-right"></i>
                  </Link> */}
                  <button
                    onClick={handleLogoutClick}
                    className="rounded-4 nav-link py-3 px-3 rounded text-primary border border-2 border-primary"
                    disabled={logoutLoading}
                  >
                    {logoutLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Logging out...
                      </>
                    ) : (
                      "Logout"
                    )}
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content Area - Always visible on desktop, conditional on mobile */}
          <div
            className={`${
              showMobileContent ? "col-12" : "d-none d-lg-block col-lg-8"
            }`}
          >
            <div className="mh-custom-profile h-100">
              <div className="profile-content h-100">
                <div className="card shadow-sm">
                  <div className="card-body p-0">
                    {/* Back Button for Mobile */}
                    {showMobileContent && (
                      <div className="d-lg-none py-3 border-bottom">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={handleBackToMenu}
                        >
                          <i className="bi bi-arrow-left me-2"></i>
                          Back to Menu
                        </button>
                      </div>
                    )}
                    <Outlet context={{ user, getProfileData }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
