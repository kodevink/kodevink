import Icon from "@mui/material/Icon";
import SignIn from "layouts/authentication/sign-in";
import ResetPassword from "layouts/authentication/reset-password/cover";
import Dashboard from "layouts/dashboard";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";

const routes = [
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
