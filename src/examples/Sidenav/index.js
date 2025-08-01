import { useState, useEffect, useMemo } from "react";
import { useLocation, NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import Collapse from "@mui/material/Collapse";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";
import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "context";
import { useAuth } from "../../App";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;
  const { userRole } = useAuth();
  const location = useLocation();
  const [openCollapse, setOpenCollapse] = useState(null);

  console.log("Sidenav: Rendering with userRole=", userRole, "location.pathname=", location.pathname);

  let textColor = "white";
  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  // Toggle sub-menu
  const handleCollapseToggle = (key) => {
    console.log("Sidenav: Toggling collapse for key=", key);
    setOpenCollapse(openCollapse === key ? null : key);
  };

  // Normalize paths to remove trailing slashes
  const normalizePath = (path) => {
    if (typeof path !== "string") {
      console.warn("Sidenav: Invalid path, expected string, got:", path);
      return "";
    }
    return path.replace(/\/+$/, "").toLowerCase();
  };

  // Check if a route or its sub-routes are active
  const isActive = (route, collapse, name) => {
    const currentPath = normalizePath(location.pathname);
    const routePath = normalizePath(route || "");
    let active = false;
    const hasCollapse = Array.isArray(collapse) && collapse.length > 0;

    console.log(`Sidenav: isActive for ${name}: entering ${hasCollapse ? "collapse" : "else"} branch, route=${JSON.stringify(routePath)}, currentPath=${JSON.stringify(currentPath)}, collapse=${!!hasCollapse}`);

    if (hasCollapse) {
      active = collapse.some((subRoute) => normalizePath(subRoute.route) === currentPath);
    } else {
      active = routePath === currentPath;
    }

    console.log(
      `Sidenav: isActive for ${name}: route=${JSON.stringify(routePath)}, currentPath=${JSON.stringify(
        currentPath
      )}, active=${active}, rawRoute=${JSON.stringify(route)}, rawCurrentPath=${JSON.stringify(
        location.pathname
      )}`
    );
    return active;
  };

  // Check if a route is accessible based on user role
  const isRouteAccessible = (route) => {
    if (!route.requiredRole) {
      console.log(`Sidenav: Route ${route.name} accessible (no requiredRole)`);
      return true;
    }
    const accessible = userRole === route.requiredRole;
    console.log(`Sidenav: Route ${route.name} accessible=${accessible}, userRole=${userRole}, requiredRole=${route.requiredRole}`);
    return accessible;
  };

  const renderRoutes = useMemo(
    () =>
      routes
        .filter((route) => {
          console.log(`Sidenav: Filtering route=${route.name}, key=${route.key}`);
          if (route.type === "collapse" && route.collapse) {
            const accessible = route.collapse.some((subRoute) => isRouteAccessible(subRoute));
            console.log(`Sidenav: Collapsible route ${route.name} accessible=${accessible}`);
            return accessible;
          }
          return isRouteAccessible(route);
        })
        .map(({ type, name, icon, title, noCollapse, key, href, route, collapse }) => {
          console.log(`Sidenav: Rendering route=${name}, key=${key}, type=${type}, route=${route}`);
          let returnValue;

          if (type === "collapse") {
            const accessibleSubRoutes = collapse ? collapse.filter((subRoute) => isRouteAccessible(subRoute)) : [];
            const active = isActive(route, accessibleSubRoutes, name);

            returnValue = href ? (
              <Link
                href={href}
                key={key}
                target="_blank"
                rel="noreferrer"
                sx={{ textDecoration: "none" }}
              >
                <SidenavCollapse
                  name={name}
                  icon={icon}
                  active={active}
                  noCollapse={noCollapse}
                />
              </Link>
            ) : (
              <MDBox key={key} mb={0.5}>
                <MDBox
                  display="flex"
                  alignItems="center"
                  sx={{
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.08)" },
                  }}
                  onClick={() => accessibleSubRoutes.length ? handleCollapseToggle(key) : null}
                  role="button"
                  tabIndex={0}
                  aria-expanded={accessibleSubRoutes.length ? openCollapse === key : undefined}
                  aria-controls={accessibleSubRoutes.length ? `sub-menu-${key}` : undefined}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      accessibleSubRoutes.length && handleCollapseToggle(key);
                    }
                  }}
                >
                  <NavLink to={route} style={{ textDecoration: "none", flexGrow: 1 }}>
                    <SidenavCollapse
                      name={name}
                      icon={icon}
                      active={active}
                      noCollapse={noCollapse}
                    />
                  </NavLink>
                  {accessibleSubRoutes.length > 0 && (
                    <Icon
                      sx={{
                        fontWeight: "normal",
                        mr: 2,
                        transition: "transform 0.3s",
                        transform: openCollapse === key ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    >
                      expand_more
                    </Icon>
                  )}
                </MDBox>
                {accessibleSubRoutes.length > 0 && (
                  <Collapse in={openCollapse === key} timeout="auto" unmountOnExit>
                    <List sx={{ pl: 3 }} id={`sub-menu-${key}`}>
                      {accessibleSubRoutes.map((subRoute) => {
                        const subActive = normalizePath(location.pathname) === normalizePath(subRoute.route);
                        console.log(`Sidenav: Rendering sub-route=${subRoute.name}, active=${subActive}`);
                        return (
                          <NavLink
                            to={subRoute.route}
                            key={subRoute.key}
                            style={{ textDecoration: "none" }}
                          >
                            <SidenavCollapse
                              name={subRoute.name}
                              icon={<Icon fontSize="small">{subRoute.icon?.props.children}</Icon>}
                              active={subActive}
                              noCollapse={true}
                              sx={{
                                py: 0.5,
                                "&:hover": {
                                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                                },
                              }}
                            />
                          </NavLink>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </MDBox>
            );
          } else if (type === "title") {
            returnValue = (
              <MDTypography
                key={key}
                color={textColor}
                display="block"
                variant="caption"
                fontWeight="bold"
                textTransform="uppercase"
                pl={3}
                mt={2}
                mb={1}
                ml={1}
              >
                {title}
              </MDTypography>
            );
          } else if (type === "divider") {
            returnValue = (
              <Divider
                key={key}
                light={
                  (!darkMode && !whiteSidenav && !transparentSidenav) ||
                  (darkMode && !transparentSidenav && whiteSidenav)
                }
              />
            );
          }

          return returnValue;
        }),
    [routes, userRole, location.pathname, openCollapse, darkMode, transparentSidenav, whiteSidenav, sidenavColor]
  );

  useEffect(() => {
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
      setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
      setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
    }

    window.addEventListener("resize", handleMiniSidenav);
    handleMiniSidenav();
    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, transparentSidenav, whiteSidenav]);

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
    >
      <MDBox pt={3} pb={1} px={4} textAlign="center">
        <MDBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={closeSidenav}
          sx={{ cursor: "pointer" }}
        >
          <MDTypography variant="h6" color="secondary">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </MDTypography>
        </MDBox>
        <MDBox component={NavLink} to="/" display="flex" alignItems="center">
          {brand && <MDBox component="img" src={brand} alt="Brand" width="2rem" />}
          <MDBox
            width={!brandName && "100%"}
            sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
          >
            <MDTypography component="h6" variant="button" fontWeight="medium" color={textColor}>
              {brandName}
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
      <Divider
        light={
          (!darkMode && !whiteSidenav && !transparentSidenav) ||
          (darkMode && !transparentSidenav && whiteSidenav)
        }
      />
      <List>{renderRoutes}</List>
    </SidenavRoot>
  );
}

Sidenav.defaultProps = {
  color: "info",
  brand: "",
};

Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;