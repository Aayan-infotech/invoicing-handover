import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Sidebar.css";

export default function Sidebar() {
  const location = useLocation();
  const { pathname } = location;
  const [openUsers, setOpenUsers] = useState(false);
  const [openTasks, setOpenTasks] = useState(false);
  const [openProjects, setOpenProjects] = useState(false);
  const [openPages, setOpenPages] = useState(false);
  // const [openDocumentType, setOpenDocumentType] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/admin/users")) {
      setOpenUsers(true);
    }
    if (pathname.startsWith("/admin/tasks")) {
      setOpenTasks(true);
    }
    // if (pathname.startsWith("/document-types")) {
    //   setOpenDocumentType(true);
    // }
    if (
      pathname.startsWith("/admin/projects") ||
      pathname.startsWith("/admin/projectTasks") ||
      pathname.startsWith("/admin/assign-tasks") ||
      pathname.startsWith("/admin/quality-assurance") ||
      pathname.startsWith("/admin/invoices")
    ) {
      setOpenProjects(true);
    }
    if (
      pathname.startsWith("/admin/pages") ||
      pathname.startsWith("/admin/terms-of-service")
    ) {
      setOpenPages(true);
    }
  }, [pathname]);

  return (
    <div className="custom-sidebar">
      <h4 className="sidebar-title">
        <i className="bi bi-globe2 me-2"></i>Tracking Invoice
      </h4>

      <ul className="sidebar-nav">
        <li className="sidebar-item">
          <Link to="/admin/dashboard" className="sidebar-link-dash">
            <i className="bi bi-speedometer2 me-2"></i> Dashboard
          </Link>
        </li>

        {/* Users Dropdown */}
        <li className="sidebar-item">
          <div
            className="sidebar-link"
            onClick={() => setOpenUsers(!openUsers)}
          >
            <span>
              <i className="bi bi-people-fill me-2"></i>User Management
            </span>
            <i
              className={`bi ${
                openUsers ? "bi-chevron-up" : "bi-chevron-down"
              }`}
            ></i>
          </div>
          {openUsers && (
            <ul className="sidebar-submenu">
              <li>
                <Link
                  to="/admin/users"
                  className={`sidebar-sublink ${
                    pathname === "/admin/users" ? "active" : ""
                  }`}
                >
                  All Users
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Users Dropdown */}
        <li className="sidebar-item">
          <div
            className="sidebar-link"
            onClick={() => setOpenTasks(!openTasks)}
          >
            <span>
              <i className="bi bi-list-task me-2"></i>Task Management
            </span>
            <i
              className={`bi ${
                openTasks ? "bi-chevron-up" : "bi-chevron-down"
              }`}
            ></i>
          </div>
          {openTasks && (
            <ul className="sidebar-submenu">
              <li>
                <Link
                  to="/admin/tasks"
                  className={`sidebar-sublink ${
                    pathname === "/admin/tasks" ? "active" : ""
                  }`}
                >
                  All Tasks
                </Link>
              </li>
            </ul>
          )}
        </li>

        <li className="sidebar-item">
          <Link
            to="/admin/projects"
            className={`sidebar-link-dash ${
              pathname === "/admin/projects" ? "active" : ""
            }`}
          >
            <i className="bi bi-file-bar-graph me-2"></i> Projects
          </Link>
        </li>

        {/* Project Management */}
        {/* <li className="sidebar-item">
          <div
            className="sidebar-link"
            onClick={() => setOpenProjects(!openProjects)}
          >
            <span>
              <i className="bi bi-bar-chart-fill me-2"></i>Projects
            </span>
            <i
              className={`bi ${
                openProjects ? "bi-chevron-up" : "bi-chevron-down"
              }`}
            ></i>
          </div>
          {openProjects && (
            <ul className="sidebar-submenu">
              <li>
                <Link
                  to="/admin/projects"
                  className={`sidebar-sublink ${
                    pathname === "/admin/projects" ? "active" : ""
                  }`}
                >
                  All Projects
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/projectTasks"
                  className={`sidebar-sublink ${
                    pathname === "/admin/projectTasks" ? "active" : ""
                  }`}
                >
                  Project Tasks
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/assign-tasks"
                  className={`sidebar-sublink ${
                    pathname === "/admin/assign-tasks" ? "active" : ""
                  }`}
                >
                  Assign Tasks
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/quality-assurance"
                  className={`sidebar-sublink ${
                    pathname === "/admin/quality-assurance" ? "active" : ""
                  }`}
                >
                  Quality Assurance
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/invoices"
                  className={`sidebar-sublink ${
                    pathname === "/admin/invoices" ? "active" : ""
                  }`}
                >
                  Project Invoices
                </Link>
              </li>
            </ul>
          )}
        </li> */}
        {/* Pages Dropdown */}
        <li className="sidebar-item">
          <div
            className="sidebar-link"
            onClick={() => setOpenPages(!openPages)}
          >
            <span>
              <i className="bi bi-file-text-fill me-2"></i>Pages
            </span>
            <i
              className={`bi ${
                openPages ? "bi-chevron-up" : "bi-chevron-down"
              }`}
            ></i>
          </div>
          {openPages && (
            <ul className="sidebar-submenu">
              <li>
                <Link
                  to="/admin/pages"
                  className={`sidebar-sublink ${
                    pathname === "/admin/pages" ? "active" : ""
                  }`}
                >
                  Pages
                </Link>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
}
