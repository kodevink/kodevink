import Icon from "@mui/material/Icon";
import SignIn from "layouts/authentication/sign-in";
import ResetPassword from "layouts/authentication/reset-password/cover";
import Dashboard from "layouts/dashboard";
import FacultyCoordinatorDashboard from "layouts/faculty-coordinator-dashboard";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";

const routes = [
    {
        type: "collapse",
        name: "Faculty Coordinator",
        key: "faculty-coordinator",
        icon: <Icon fontSize="small">supervisor_account</Icon>,
        route: "/faculty-coordinator",
        collapse: [
            {
                name: "Coordinator Dashboard",
                key: "coordinator-dashboard",
                route: "/faculty-coordinator/dashboard",
                component: <FacultyCoordinatorDashboard />,
                requiresAuth: true,
                requiredRole: "faculty-coordinator",
            },
            {
                name: "Manage Faculty",
                key: "manage-faculty",
                route: "/faculty-coordinator/manage-faculty",
                component: <FacultyCoordinatorDashboard />,
                requiresAuth: true,
            },
            {
                name: "Approve Leave",
                key: "approve-leave",
                route: "/faculty-coordinator/approve-leave",
                component: <FacultyCoordinatorDashboard />,
                requiresAuth: true,
            },
        ],
    },
    // {
    //     type: "collapse",
    //     name: "Coordinator Dashboard",
    //     key: "coordinator-dashboard",
    //     icon: <Icon fontSize="small">dashboard</Icon>,
    //     route: "/coordinator-dashboard",
    //     component: <FacultyCoordinatorDashboard />,
    //     requiresAuth: true,
    // },
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
    },
    {
        type: "title",
        name: "Sign In",
        key: "sign-in",
        icon: <Icon fontSize="small">login</Icon>,
        route: "/login",
        component: <SignIn />,
    },
    {
        type: "title",
        name: "Reset Password",
        key: "reset-password",
        icon: <Icon fontSize="small">password</Icon>,
        route: "/reset-password",
        component: <ResetPassword />,
    },
];

export default routes;
