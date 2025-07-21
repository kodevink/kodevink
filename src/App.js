import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./assets/theme";
import themeDark from "./assets/theme-dark"; // Import the new dark theme
import { useMaterialUIController } from "./context";
import { Routes, Route, Navigate } from "react-router-dom"; // Placeholder for routes

import routes from "routes";



export default function App() {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;


  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      <Routes>
        {getRoutes(routes)}
        <Route path="*" element={<Navigate to="/authentication/sign-in" />} />
      </Routes>
    </ThemeProvider>
  );
}