import { useEffect, useState, createContext, useContext } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Sidenav from "examples/Sidenav";
import theme from "assets/theme";
import themeDark from "assets/theme-dark";
import { useMaterialUIController, setOpenConfigurator } from "context";
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";
import UpdatePassword from "layouts/authentication/update-password";
import SignIn from "layouts/authentication/sign-in";
import routes from "routes";
import { supabase } from "utils/supabase";
import ResetPassword from "layouts/authentication/reset-password/cover"

const AuthContext = createContext();

function useAuth() {
  return useContext(AuthContext);
}

function ProtectedRoute({ children, requiresAuth }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  console.log(
    "ProtectedRoute: isAuthenticated =", isAuthenticated,
    "requiresAuth =", requiresAuth,
    "path =", location.pathname
  );

  if (isAuthenticated === null) {
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <MDTypography>Loading...</MDTypography>
      </MDBox>
    );
  }

  if (requiresAuth && !isAuthenticated) {
    console.log("Redirecting to /login from:", location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requiresAuth && isAuthenticated) {
    const from = location.state?.from?.pathname || "/dashboard";
    console.log("Redirecting to", from, "from:", location.pathname);
    return <Navigate to={from} replace />;
  }

  return children;
}

function App() {
  const [controller, dispatch] = useMaterialUIController();
  const { layout, openConfigurator, sidenavColor, transparentSidenav, whiteSidenav, darkMode } = controller;
  const { pathname } = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("App: Initial session check:", !!session);
      setIsAuthenticated(!!session);
    };
    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("App: Auth event:", event, "session:", !!session);
      setIsAuthenticated(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }
      if (route.route) {
        return (
          <Route
            exact
            path={route.route}
            element={
              <ProtectedRoute requiresAuth={route.requiresAuth ?? true}>
                {route.component}
              </ProtectedRoute>
            }
            key={route.key}
          />
        );
      }
      return null;
    });

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">settings</Icon>
    </MDBox>
  );

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      <ThemeProvider theme={darkMode ? themeDark : theme}>
        <CssBaseline />
        {layout === "dashboard" && isAuthenticated && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
              brandName="Shudh Kosh"
              routes={routes}
            />
            {configsButton}
          </>
        )}
        <Routes>
          <Route
            exact
            path="/login"
            element={
              <ProtectedRoute requiresAuth={false}>
                <SignIn />
              </ProtectedRoute>
            }
          />
          <Route
            exact
            path="/reset-password"
            element={
              <ProtectedRoute requiresAuth={false}>
                <ResetPassword />
              </ProtectedRoute>
            }
          />
          <Route
            exact
            path="/update-password"
            element={
              <ProtectedRoute requiresAuth={true}>
                <UpdatePassword />
              </ProtectedRoute>
            }
          />
          {getRoutes(routes)}
          <Route
            path="*"
            element={
              <ProtectedRoute requiresAuth={true}>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />
        </Routes>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}

export default App;