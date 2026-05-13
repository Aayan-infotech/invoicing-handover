import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import "./Login.css";
import { login } from "../../services/index/users";
import { userActions } from "../../store/reducers/userReducers";
import { useDispatch, useSelector } from "react-redux";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userState = useSelector((state) => state.user);

  const { mutate, isLoading } = useMutation({
    mutationFn: ({ username, password }) => {
      return login({ username, password });
    },
    onSuccess: (data) => {
      const response = data.data;
      dispatch(userActions.setUserInfo(response));
      localStorage.setItem("account", JSON.stringify(response));
    },
    onError: (error) => {
      toast.error(error.message);
      console.log(error);
    },
  });

  useEffect(() => {
    if (userState.userInfo) {
      if (userState.userInfo.user.role === "admin") {
        toast.success("Login successful!");
        navigate("/admin/dashboard");
      } else {
        toast.error("You are not authorized to access this page.");
        navigate("/");
        localStorage.removeItem("account");
        dispatch(userActions.setUserInfo(null));
      }
    }
  }, [navigate, userState.userInfo]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const submitHandler = (data) => {
    const { username, password } = data;
    mutate({ username, password });
  };

  return (
    <div className="login-wrapper d-flex align-items-center justify-content-center min-vh-100">
      <div
        className="login-card p-4 shadow-lg rounded bg-white"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h3 className="text-center mb-4 text-primary">🔐 Admin Login</h3>
        <form onSubmit={handleSubmit(submitHandler)}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label fw-semibold">
              Username
            </label>
            <input
              type="text"
              className={`form-control ${errors.username ? "is-invalid" : ""}`}
              placeholder="Enter username"
              id="username"
              {...register("username", {
                required: {
                  value: true,
                  message: "Username is required",
                },
              })}
            />
            {errors.username && (
              <div className="invalid-feedback">{errors.username.message}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-semibold">
              Password
            </label>
            <input
              type="password"
              id="password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              placeholder="Enter password"
              {...register("password", {
                required: {
                  value: true,
                  message: "Password is required",
                },
                minLength: {
                  value: 6,
                  message: "Password length must be at least 6 characters",
                },
              })}
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password.message}</div>
            )}
          </div>

          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary fw-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
