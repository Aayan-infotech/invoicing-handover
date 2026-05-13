import Header from "./header";
import "../../assets/css/web.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import OtpInput from "react-otp-input";
import React, { useState, useRef } from "react";
import SnackBarMui from "../../components/SnackBarMui";
import axiosInstance from "../../components/axiosInstance";

export default function VerifyWeb() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const snackbarRef = useRef(null);
  const location = useLocation();
  const email = location.state?.email || "";
  const is2FAEnabled = location.state?.is2FAEnabled || false;
  console.log(email);

  const showSnackbar = (message, severity = "info") => {
    snackbarRef.current?.show(message, severity);
  };

  const hideSnackbar = () => {
    snackbarRef.current?.hide();
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

  const snackbarActions = {
    show: showSnackbar,
    success: (message) => showSnackbar(message, "success"),
    error: (message) => showSnackbar(message, "error"),
    warning: (message) => showSnackbar(message, "warning"),
    info: (message) => showSnackbar(message, "info"),
    hide: hideSnackbar,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(`auth/verify-otp`, {
        email,
        otp,
      });
      if (response) {
        snackbarActions.success(response?.data?.message);

        // Check for is2FAEnabled from state instead of pathname
        if (is2FAEnabled) {
          localStorage.setItem("token", response?.data?.data?.accessToken);
          localStorage.setItem(
            "RefreshToken",
            response?.data?.data?.refreshToken
          );
          await axiosInstance.post("auth/save-device-details", {
            deviceName: getDeviceInfo(),
            deviceType: "web",
          });
          navigate("/home");
        } else {
          // For forgot password flow
          setTimeout(() => {
            if (location.pathname === "/verify-user") {
              navigate("/reset-password", { state: { email } });
              return;
            }
          }, 2000);
        }
      }
    } catch (error) {
      snackbarActions.error(
        error.response?.data?.message ||
          "Verification failed. Please try again."
      );
    }
  };

  const resendOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(`auth/resend-otp`, {
        email,
      });
      if (response) {
        snackbarActions.success(response?.data?.message);
      }
    } catch (error) {
      snackbarActions.error(
        error.response?.data?.message || " Please try again."
      );
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
                    Verification Code
                  </h2>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        Enter Otp
                      </label>
                      <OtpInput
                        value={otp}
                        onChange={setOtp}
                        numInputs={4}
                        renderSeparator={<span>-</span>}
                        renderInput={(props) => <input {...props} />}
                        shouldAutoFocus
                        containerStyle={{
                          width: "100%",
                          justifyContent: "space-between",
                        }}
                        inputStyle={{
                          width: "50px",
                          height: "50px",
                        }}
                      />
                    </div>
                    <div className="mb-3 text-center">
                      <div onClick={resendOtp}>Resend OTP</div>
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
