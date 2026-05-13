import React, { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import LoggedHeader from "./header";
import SnackBarMui from "../../components/SnackBarMui";
import "../../assets/css/web.css";

export default function LayoutWeb() {
  const location = useLocation();
  const snackbarRef = useRef(null);

  const getLayoutClass = () => {
    const path = location.pathname;

    // Exact path matches
    if (path === "/holidays") return "bg-auth";

    // Dynamic routes with startsWith
    if (path.startsWith("/quality-assurance/")) return "bg-auth";
    if (path.startsWith("/rams/")) return "bg-auth";
    if (path.startsWith("/tool-box-talks/")) return "bg-auth";
    if (path.startsWith("/ITPs/")) return "bg-auth";
    if (path.startsWith("/data-sheets/")) return "bg-auth";
    if (path.startsWith("/drawings/")) return "bg-auth";

    // Exact path matches for other routes
    if (path === "/upload") return "bg-auth";
    if (path === "/profile") return "bg-auth";
    if (path === "/activity") return "bg-auth";
    if (path === "/security-setting") return "bg-auth";
    if (path === "/profile-notification") return "bg-auth";
    if (path === "/privacy-policy-profile") return "bg-auth";

    return "bg-dark-blue";
  };

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

  return (
    <>
      <div className={`layout-container ${getLayoutClass()}`}>
        <LoggedHeader />
        {/* IMPORTANT: Pass context to Outlet */}
        <Outlet context={{ snackbar: snackbarActions }} />
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
