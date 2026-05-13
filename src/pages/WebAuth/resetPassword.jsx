import Header from "./header";
import "../../assets/css/web.css";
import { Link, useLocation } from "react-router-dom";
import axiosInstance from "../../components/axiosInstance";
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SnackBarMui from "../../components/SnackBarMui";

export default function ResetPassword() {
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: location.state?.email,
    password: "",
    confirm_password: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(
        "/auth/reset-password",
        formData
      );
      if (response) {
        snackbarActions.success(response?.data?.message);
        localStorage.setItem("token", response?.data?.data?.accessToken);
        localStorage.setItem(
          "RefreshToken",
          response?.data?.data?.refreshToken
        );
        setTimeout(() => {
          navigate("/login");
        }, 2000);
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
    }
  };

  console.log(location.state?.email);
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
                    Reset Password
                  </h2>
                  <form onSubmit={handleSubmit}>
                   
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">
                        Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="Enter your password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <span
                        className="text-danger fw-bold"
                        style={{ fontSize: ".8rem" }}
                      >
                        Must include:** 1 lowercase, 1 uppercase, 1 number, and
                        1 special char (@$!%*?&#).
                      </span>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="confirm_password" className="form-label">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirm_password"
                        placeholder="Enter your confirm password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                      />
                      <span
                        className="text-danger fw-bold"
                        style={{ fontSize: ".8rem" }}
                      >
                        Must include:** 1 lowercase, 1 uppercase, 1 number, and
                        1 special char (@$!%*?&#).
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2 rounded-4"
                    >
                      Submit
                    </button>
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
