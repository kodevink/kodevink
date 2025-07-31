import { useState, useEffect } from "react";
import { useLocation, NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
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

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;
  const location = useLocation();
  const [openCollapse, setOpenCollapse] = useState(null); // Track open sub-menu

  let textColor = "white";
  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  // Toggle sub-menu
  const handleCollapseToggle = (key) => {
    setOpenCollapse(openCollapse === key ? null : key);
  };

  // Check if a route or its sub-routes are active
  const isActive = (route, collapse) => {
    if (collapse) {
      return collapse.some((subRoute) => location.pathname === subRoute.route);
    }
    return location.pathname === route;
  };

  const renderRoutes = routes.map(({ type, name, icon, title, noCollapse, key, href, route, collapse }) => {
    let returnValue;

    if (type === "collapse") {
      const active = isActive(route, collapse);
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
        <MDBox key={key}>
          <MDBox
            display="flex"
            alignItems="center"
            sx={{ cursor: "pointer" }}
            onClick={() => collapse ? handleCollapseToggle(key) : null}
          >
            <NavLink to={route} style={{ textDecoration: "none", flexGrow: 1 }}>
              <SidenavCollapse
                name={name}
                icon={icon}
                active={active}
                noCollapse={noCollapse}
              />
            </NavLink>
            {collapse && (
              <Icon sx={{ fontWeight: "normal", mr: 2 }}>
                {openCollapse === key ? "expand_less" : "expand_more"}
              </Icon>
            )}
          </MDBox>
          {collapse && openCollapse === key && (
            <List sx={{ pl: 4 }}>
              {collapse.map((subRoute) => (
                <NavLink to={subRoute.route} key={subRoute.key} style={{ textDecoration: "none" }}>
                  <SidenavCollapse
                    name={subRoute.name}
                    icon={<Icon fontSize="small">{subRoute.icon?.props.children}</Icon>}
                    active={location.pathname === subRoute.route}
                    noCollapse={true}
                  />
                </NavLink>
              ))}
            </List>
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
  });

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