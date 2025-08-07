import Icon from "@mui/material/Icon";
import SignIn from "layouts/authentication/sign-in";
import ResetPassword from "layouts/authentication/reset-password/cover";
import Dashboard from "layouts/dashboard";
import FacultyCoordinatorDashboard from "layouts/faculty-coordinator-dashboard";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";

const ROLES = {
  FACULTY_COORDINATOR: "faculty-coordinator",
  HOD: "hod",
};

const routes = [
  {
    type: "collapse",
    name: "Faculty Coordinator",
    key: "faculty-coordinator",
    icon: <Icon fontSize="small">supervisor_account</Icon>,
    route: "/faculty-coordinator",
    redirect: "/faculty-coordinator/dashboard",
    requiredRole: ROLES.FACULTY_COORDINATOR,
    requiresAuth: true,
    collapse: [
      {
        name: "Coordinator Dashboard",
        key: "coordinator-dashboard",
        route: "/faculty-coordinator/dashboard",
        component: <FacultyCoordinatorDashboard />,
        icon: <Icon fontSize="small">widgets</Icon>,
        requiresAuth: true,
        requiredRole: ROLES.FACULTY_COORDINATOR,
      },
      {
        name: "Manage Faculty",
        key: "manage-faculty",
        route: "/faculty-coordinator/manage-faculty",
        component: <FacultyCoordinatorDashboard />,
        icon: <Icon fontSize="small">manage_accounts</Icon>,
        requiredRole: ROLES.FACULTY_COORDINATOR,
        requiresAuth: true,
      },
    ],
  },
  {
    type: "collapse",
    name: "hod",
    key: "hod",
    icon: <Icon fontSize="small">supervisor_account</Icon>,
    route: "/hod",
    redirect: "/hod/dashboard",
    requiredRole: ROLES.HOD,
    requiresAuth: true,
    collapse: [
      {
        name: "hod Dashboard",
        key: "hod-dashboard",
        route: "/hod/dashboard",
        component: <FacultyCoordinatorDashboard />,
        icon: <Icon fontSize="small">widgets</Icon>,
        requiresAuth: true,
        requiredRole: ROLES.HOD,
      },
      {
        name: "Manage Faculty",
        key: "manage-faculty",
        route: "/hod/manage-faculty",
        component: <FacultyCoordinatorDashboard />,
        icon: <Icon fontSize="small">manage_accounts</Icon>,
        requiredRole: ROLES.HOD,
        requiresAuth: true,
      },
    ],
  },
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
    requiresAuth: true,
  },
  {
    type: "collapse",
    name: "Notifications",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: <Notifications />,
    requiresAuth: true,
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
    requiresAuth: true,
  },
  {
    type: "title",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/login",
    component: <SignIn />,
    requiresAuth: false,
  },
  {
    type: "title",
    name: "Reset Password",
    key: "reset-password",
    icon: <Icon fontSize="small">password</Icon>,
    route: "/reset-password",
    component: <ResetPassword />,
    requiresAuth: false,
  },
];

export default routes;
