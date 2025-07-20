import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./assets/theme";
import themeDark from "./assets/theme-dark"; // Import the new dark theme
import { useMaterialUIController } from "./context";
import { Routes, Route, Navigate } from "react-router-dom"; // Placeholder for routes
import SignIn from "./layouts/authentication/sign-in"; // Placeholder for sign-in page

export default function App() {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      <Routes>
        <Route path="/authentication/sign-in" element={<SignIn />} />
        <Route path="*" element={<Navigate to="/authentication/sign-in" />} />
      </Routes>
    </ThemeProvider>
  );
}