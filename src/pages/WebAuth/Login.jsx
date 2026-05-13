import Header from "./header";
import "../../assets/css/web.css";
import { Link } from "react-router-dom";
import axiosInstance from "../../components/axiosInstance";
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SnackBarMui from "../../components/SnackBarMui";

export default function LoginWeb() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const snackbarRef = useRef(null);
  const showSnackbar = (message, severity = "info") => {
    snackbarRef.current?.show(message, severity);
  };

  const hideSnackbar = () => {
    snackbarRef.current?.hide();
  };

  const snackbarActions = {
    show: showSnackbar,
    success: (message) => showSnackbar(message, "success"),
    error: (message) => showSnackbar(message, "error"),
    warning: (message) => showSnackbar(message, "warning"),
    info: (message) => showSnackbar(message, "info"),
    hide: hideSnackbar,
  };

  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.post("/auth/login", formData);
      console.log(
        response?.data?.data?.user?.is2FAEnabled,
        response?.data?.data?.user?.email
      );
      if (response?.data?.data?.user?.is2FAEnabled) {
        snackbarActions.success(response?.data?.message);
        localStorage.setItem("token", response?.data?.data?.accessToken);
        localStorage.setItem(
          "RefreshToken",
          response?.data?.data?.refreshToken
        );
        await axiosInstance.post("auth/save-device-details", {
          deviceName: getDeviceInfo(), // e.g., "Chrome on Windows"
          deviceType: "web",
        });

        navigate("/verify-user", {
          state: {
            email: response?.data?.data?.user?.email,
            is2FAEnabled: true,
          },
        });
      } else {
        snackbarActions.success(response?.data?.message);
        localStorage.setItem("token", response?.data?.data?.accessToken);
        localStorage.setItem(
          "RefreshToken",
          response?.data?.data?.refreshToken
        );
        await axiosInstance.post("auth/save-device-details", {
          deviceName: getDeviceInfo(), // e.g., "Chrome on Windows"
          deviceType: "web",
        });
        navigate("/home");
      }
      // Handle successful login (e.g., store tokens, redirect)
    } catch (error) {
      console.error(
        "Signup failed:",
        error.response ? error.response.data : error.message
      );
      snackbarActions.error(
        error.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="bg-auth">
        <Header />
        <div className="container">
          <div className="row">
            <div className="col-md-6 offset-md-3">
              <div className="card mt-3 border-0">
                <div className="card-body">
                  <h2 className="card-title text-center fs-1 fw-bold mb-4">
                    Log In
                  </h2>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        User Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="username"
                        placeholder="Enter your user name"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3 position-relative">
                      <label htmlFor="password" className="form-label">
                        Password
                      </label>
                      <div className="input-group position-relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control"
                          id="password"
                          placeholder="Enter your password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                        />
                        <span
                          className=" position-absolute end-0 top-0 bottom-0 mt-3 me-3"
                          onClick={togglePasswordVisibility}
                          style={{ cursor: "pointer" }}
                        >
                          {showPassword ? (
                            <i class="bi bi-eye-slash-fill"></i>
                          ) : (
                            <i class="bi bi-eye-fill"></i>
                          )}
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="text-decoration-none text-secondary"
                    >
                      <p className="text-end">Forgot Password?</p>
                    </Link>

                    {loading ? (
                      <div className="d-flex justify-content-center">
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        className="btn btn-primary w-100 py-2 rounded-4"
                      >
                        Login
                      </button>
                    )}

                    <div className="d-flex justify-content-center mt-3">
                      <span className="text-secondary">
                        Don't have an Account?
                      </span>
                      <Link to="/signup" className="text-decoration-none">
                        <p className="text-end">Signup</p>
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SnackBarMui
        ref={snackbarRef}
        autoShow={false}
        duration={5000}
        position={{ vertical: "top", horizontal: "right" }}
      />
    </>
  );
}
