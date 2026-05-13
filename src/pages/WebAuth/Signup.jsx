import Header from "./header";
import "../../assets/css/web.css";
import { Link } from "react-router-dom";
import axiosInstance from "../../components/axiosInstance";
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SnackBarMui from "../../components/SnackBarMui";
export default function SignupWeb() {
  const [email, setEmail] = useState("");
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
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("auth/register", { email });
      if (response) {
        snackbarActions.success(response?.data?.message);

        setTimeout(() => {
          navigate("/verify" , {state: { email }});
        }, 2000);
      }
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
                    Sign Up
                  </h2>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={handleEmailChange}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2 rounded-4"
                    >
                      Signup
                    </button>
                    <div className="d-flex justify-content-center mt-3">
                      <span className="text-secondary">
                        Already have an Account?
                      </span>
                      <Link to="/login" className="text-decoration-none">
                        <p className="text-end">Login</p>
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
              <div className="card mt-3 border-0">
                <div className="card-body">
                  <div className="d-flex flex-row gap-2">
                    <span className="w-100 border border-1  border-dark rounded-3 p-2 text-center">
                      <i className="bi bi-google fs-5"></i>
                    </span>
                    <span className="w-100 border border-1 border-dark rounded-3 p-2 text-center">
                      <i className="bi bi-facebook fs-5"></i>
                    </span>
                    <span className="w-100 border border-1 border-dark rounded-3 p-2 text-center">
                      <i className="bi bi-apple fs-5"></i>
                    </span>
                  </div>
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
