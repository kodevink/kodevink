import Icon from "@mui/material/Icon";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";

const routes = [
    // {
    //     type: "collapse",
    //     name: "Dashboard",
    //     key: "dashboard",
    //     icon: <Icon fontSize="small">dashboard</Icon>,
    //     route: "/dashboard",
    //     component: <Dashboard />,
    // },
    // {
    //     type: "collapse",
    //     name: "Tables",
    //     key: "tables",
    //     icon: <Icon fontSize="small">table_view</Icon>,
    //     route: "/tables",
    //     component: <Tables />,
    // },
    // {
    //     type: "collapse",
    //     name: "Notifications",
    //     key: "notifications",
    //     icon: <Icon fontSize="small">notifications</Icon>,
    //     route: "/notifications",
    //     component: <Notifications />,
    // },
    // {
    //     type: "collapse",
    //     name: "Profile",
    //     key: "profile",
    //     icon: <Icon fontSize="small">person</Icon>,
    //     route: "/profile",
    //     component: <Profile />,
    // },
    {
        type: "collapse",
        name: "Sign In",
        key: "sign-in",
        icon: <Icon fontSize="small">login</Icon>,
        route: "/authentication/sign-in",
        component: <SignIn />,
    },
    {
        type: "collapse",
        name: "Sign Up",
        key: "sign-up",
        icon: <Icon fontSize="small">assignment</Icon>,
        route: "/authentication/sign-up",
        component: <SignUp />,
    },
];

export default routes;
