import Icon from "@mui/material/Icon";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import ResetPassword from "layouts/authentication/reset-password/cover";
import Dashboard from "layouts/dashboard";
import Notifications from "layouts/notifications";

const routes = [
    {
        type: "collapse",
        name: "Dashboard",
        key: "dashboard",
        icon: <Icon fontSize="small">dashboard</Icon>,
        route: "/dashboard",
        component: <Dashboard />,
    },
    {
        type: "collapse",
        name: "Notifications",
        key: "notifications",
        icon: <Icon fontSize="small">notifications</Icon>,
        route: "/notifications",
        component: <Notifications />,
    },
    {
        type: "collapse",
        name: "Profile",
        key: "profile",
        icon: <Icon fontSize="small">person</Icon>,
        route: "/profile",
        component: <SignIn />,
    },
    {
        type: "title",
        name: "Sign In",
        key: "sign-in",
        icon: <Icon fontSize="small">login</Icon>,
        route: "/authentication/sign-in",
        component: <SignIn />,
    },
    {
        type: "title",
        name: "Sign Up",
        key: "sign-up",
        icon: <Icon fontSize="small">assignment</Icon>,
        route: "/authentication/sign-up",
        component: <SignUp />,
    },
    {
        type: "title",
        name: "Reset Password",
        key: "reset-password",
        icon: <Icon fontSize="small">password</Icon>,
        route: "/authentication/reset-password",
        component: <ResetPassword />,
    },
];

export default routes;
