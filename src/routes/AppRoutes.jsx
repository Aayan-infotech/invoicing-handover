import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Users from "../pages/UserManagement/Users";
// import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../pages/admin/AdminLayout";
import Projects from "../pages/Projects/Projects";
import Task from "../pages/TaskManagement/Task";
import AssignTasks from "../pages/Projects/AssignTasks";
import QualityAssurance from "../pages/Projects/QuanlityAssuarnce";
import TermsOfService from "../pages/TermsOfService/TermsOfService";
import Pages from "../pages/Pages";
import ProjectInvoices from "../pages/Projects/ProjectInvoices";
import ProjectTask from "../pages/Projects/ProjectTask";
import Homepage from "../pages/Home/Homepage";
// import DocumentType from "../pages/DocumentType/DocumentType";
import PrivacyPolicy from "../pages/PrivacyPolicy/PrivacyPolicy";
import TermCondition from "../pages/Term&Conditions/TermCondition";
import ProtectedRoute, { ProtectedRouteWeb } from "./ProtectedRoute";
import LoginWeb from "../pages/WebAuth/Login";
import SignupWeb from "../pages/WebAuth/Signup";
import VerifyWeb from "../pages/WebAuth/verify";
import SuccessWeb from "../pages/WebAuth/success";
import LayoutWeb from "../pages/Web/Layout";
import Home from "../pages/Web/Home";
import ClockIn from "../pages/Web/Clockin";
import Holiday from "../pages/Web/holiday";
import ProjectWeb from "../pages/Web/project";
import ProjectDetail from "../pages/Web/project-detail";
import QualityAssuranceWeb from "../pages/Web/QualityAssurance";
import Rams from "../pages/Web/rams";
import DataSheets from "../pages/Web/Data-sheets";
import ToolBoxTalks from "../pages/Web/Tool-box-talks";
import ITPS from "../pages/Web/ITPS";
import Drawings from "../pages/Web/Drawings";
import TaskDetail from "../pages/Web/Task-detail";
import TaskCompleted from "../pages/Web/TaskCompleted";
import Invoices from "../pages/Web/invoices";
import Notification from "../pages/Web/notification";
import UpdateProfile from "../pages/Web/UpdateProfile";
import Profile from "../pages/Web/Profile";
import SecuritySettings from "../pages/Web/securitySetting";
import Activity from "../pages/Web/activity";
import ProfileNotification from "../pages/Web/profileNotification";
import ForgetPassword from "../pages/WebAuth/forgetPassword";
import ResetPassword from "../pages/WebAuth/resetPassword";
import ErrorPage from "../components/errorPage";
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-and-conditions" element={<TermCondition />} />
      <Route path="*" element={<ErrorPage />} />

      <Route path="">
        {/* Public admin route - login should not be protected */}
        <Route path="/login" element={<LoginWeb />} />
        <Route path="/signup" element={<SignupWeb />} />
        <Route path="/verify" element={<VerifyWeb />} />
        <Route path="/verify-user" element={<VerifyWeb />} />
        <Route path="/success" element={<SuccessWeb />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path=""
          element={
            <ProtectedRouteWeb>
              <LayoutWeb />
            </ProtectedRouteWeb>
          }
        >
          <Route path="/home" element={<Home />} />
          {/* <Route path="/clockin" element={<ClockIn />} /> */}
          <Route path="/holidays" element={<Holiday />} />
          <Route path="/projects" element={<ProjectWeb />} />
          <Route path="/project-detail/:id" element={<ProjectDetail />} />
          <Route path="/task-detail/:id" element={<TaskDetail />} />
          <Route
            path="/quality-assurance/:id"
            element={<QualityAssuranceWeb />}
          />
          <Route path="/rams" element={<Rams />} />
          <Route path="/data-sheets" element={<DataSheets />} />
          <Route path="/tool-box-talks" element={<ToolBoxTalks />} />
          <Route path="/ITPs" element={<ITPS />} />
          <Route path="/drawings" element={<Drawings />} />
          <Route path="/task-completed" element={<TaskCompleted />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/notification" element={<Notification />} />
          <Route path="" element={<Profile />}>
            <Route path="/profile" element={<UpdateProfile />} />
            <Route path="/security-setting" element={<SecuritySettings />} />
            <Route path="/activity" element={<Activity />} />
            <Route
              path="/profile-notification"
              element={<ProfileNotification />}
            />
          </Route>
        </Route>
      </Route>
      <Route path="/admin">
        {/* Public admin route - login should not be protected */}
        <Route path="login" element={<Login />} />
        <Route
          path=""
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="tasks" element={<Task />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projectTasks" element={<ProjectTask />} />
          <Route path="invoices" element={<ProjectInvoices />} />
          <Route path="assign-tasks" element={<AssignTasks />} />
          <Route path="quality-assurance" element={<QualityAssurance />} />
          <Route path="pages" element={<Pages />} />
          <Route path="terms-of-service" element={<TermsOfService />} />
        </Route>
      </Route>
    </Routes>
  );
}
