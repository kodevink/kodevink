import { useEffect, useState } from "react";
import { supabase } from "utils/supabase";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";

function Publications({ refreshPublications, onEditPublication }) {
  const [publications, setPublications] = useState([]);
  const [menu, setMenu] = useState(null);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Fetch publications for the authenticated user
  const fetchPublications = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }
      const { data, error } = await supabase
        .from("publications")
        .select("*")
        .eq("profile_id", user.id);
      if (error) {
        throw new Error(`Error fetching publications: ${error.message}`);
      }
      console.log("Publications fetched:", data);
      setPublications(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  // Handle external refresh from Dashboard
  useEffect(() => {
    if (typeof refreshPublications === "function") {
      console.log("Received refreshPublications from Dashboard, refreshing");
      fetchPublications();
    }
  }, [refreshPublications]);

  const openMenu = ({ currentTarget }, publication) => {
    console.log("Opening menu for publication:", publication);
    setSelectedPublication(publication);
    setMenu(currentTarget);
  };

  const closeMenu = () => {
    setMenu(null);
  };

  const handleEdit = (publication) => {
    console.log("Handle edit, calling onEditPublication with:", publication);
    if (typeof onEditPublication === "function" && publication) {
      onEditPublication(publication);
    } else {
      console.error("onEditPublication is not a function or publication is invalid:", publication);
      setError("Cannot edit publication. Please try again.");
    }
    closeMenu();
  };

  const handleDelete = async (publication) => {
    if (!window.confirm("Are you sure you want to delete this publication?")) {
      closeMenu();
      return;
    }
    try {
      if (!publication) {
        throw new Error("No publication selected for deletion");
      }
      // Delete associated PDF if exists
      if (publication.document_url) {
        const fileName = publication.document_url.split("/").pop();
        const { error: storageError } = await supabase.storage
          .from("research-papers")
          .remove([`${publication.profile_id}/${fileName}`]);
        if (storageError) {
          throw new Error(`Error deleting PDF: ${storageError.message}`);
        }
      }
      // Delete publication from Supabase
      const { error } = await supabase
        .from("publications")
        .delete()
        .eq("id", publication.id);
      if (error) {
        throw new Error(`Error deleting publication: ${error.message}`);
      }
      setPublications(publications.filter((pub) => pub.id !== publication.id));
      alert("Publication deleted successfully!");
      if (typeof refreshPublications === "function") {
        console.log("Triggering external refresh after deletion");
        refreshPublications();
      }
    } catch (err) {
      setError(err.message);
    }
    closeMenu();
  };

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    console.log("Category filter changed to:", category);
    setCategoryFilter(category);
  };

  const columns = [
    { Header: "Title", accessor: "title", width: "20%" },
    { Header: "Publication Type", accessor: "publication_type", width: "15%" },
    { Header: "Publication Name", accessor: "publication_name", width: "20%" },
    { Header: "Year", accessor: "publication_year", width: "10%" },
    { Header: "Scopus Indexed", accessor: "is_scopus_indexed", width: "10%" },
    { Header: "UGC-CARE", accessor: "is_ugc_care", width: "10%" },
    { Header: "Status", accessor: "verification_status", width: "10%" },
    { Header: "Document", accessor: "document", width: "10%" },
    { Header: "Actions", accessor: "actions", width: "5%" },
  ];

  const filteredPublications = categoryFilter === "All"
    ? publications
    : publications.filter((pub) => pub.publication_type === categoryFilter);

  const rows = filteredPublications.map((pub) => {
    console.log("Rendering status for publication:", pub.id, "status:", pub.verification_status);
    return {
      title: pub.title,
      publication_type: pub.publication_type,
      publication_name: pub.publication_name,
      publication_year: pub.publication_year || "N/A",
      is_scopus_indexed: pub.is_scopus_indexed ? "Yes" : "No",
      is_ugc_care: pub.is_ugc_care ? "Yes" : "No",
      verification_status: (
        <MDTypography
          variant="caption"
          sx={{
            color: "#ffffff",
            backgroundColor: ({ palette: { success, warning } }) =>
              pub.verification_status === "verified" ? success.dark : warning.dark,
            borderRadius: "12px",
            px: 1.5,
            py: 0.5,
            fontWeight: "medium",
          }}
        >
          {pub.verification_status.charAt(0).toUpperCase() + pub.verification_status.slice(1)}
        </MDTypography>
      ),
      document: pub.document_url ? (
        <MDButton
          variant="text"
          color="info"
          size="small"
          href={pub.document_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          View PDF
        </MDButton>
      ) : (
        <Icon sx={{ color: ({ palette: { error } }) => error.main }}>close</Icon>
      ),
      actions: (
        <MDBox>
          <Icon
            sx={{ cursor: "pointer", fontWeight: "bold" }}
            fontSize="small"
            onClick={(e) => openMenu(e, pub)}
          >
            more_vert
          </Icon>
        </MDBox>
      ),
    };
  });

  const renderMenu = (
    <Menu
      id="simple-menu"
      anchorEl={menu}
      anchorOrigin={{ vertical: "top", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={Boolean(menu)}
      onClose={closeMenu}
    >
      <MenuItem onClick={() => handleEdit(selectedPublication)}>Edit</MenuItem>
      <MenuItem onClick={() => handleDelete(selectedPublication)}>Delete</MenuItem>
    </Menu>
  );

  return (
    <MDBox width="100%" mx="auto" my={3}>
      <Card sx={{ width: "100%", maxWidth: "100%" }}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
          <MDBox>
            <MDTypography variant="h6" gutterBottom>
              Publications
            </MDTypography>
            <MDBox display="flex" alignItems="center" lineHeight={0}>
              <Icon
                sx={{
                  fontWeight: "bold",
                  color: ({ palette: { info } }) => info.main,
                  mt: -0.5,
                }}
              >
                done
              </Icon>
              <MDTypography variant="button" fontWeight="regular" color="text">
                <strong>{filteredPublications.length} total</strong> publications
              </MDTypography>
            </MDBox>
          </MDBox>
          <MDBox>
            <FormControl sx={{ minWidth: 150 }}>
              <Select
                value={categoryFilter}
                onChange={handleCategoryChange}
                displayEmpty
                sx={{ height: "36px", fontSize: "0.875rem" }}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Journal Paper">Journal Paper</MenuItem>
                <MenuItem value="Conference Paper">Conference Paper</MenuItem>
                <MenuItem value="Patent">Patent</MenuItem>
                <MenuItem value="Book Chapter">Book Chapter</MenuItem>
              </Select>
            </FormControl>
          </MDBox>
        </MDBox>
        <MDBox display="flex" alignItems="center" px={3} pb={2}>
          <MDBox display="flex" alignItems="center" mr={2}>
            <MDTypography
              variant="caption"
              sx={{
                color: ({ palette: { success } }) => success.dark,
                fontSize: "1.2rem",
                lineHeight: 1.5,
                mr: 0.5,
              }}
            >
              ●
            </MDTypography>
            <MDTypography
              variant="caption"
              color="dark"
              sx={{ fontSize: "0.75rem", lineHeight: 1.5 }}
            >
              Verified
            </MDTypography>
          </MDBox>
          <MDBox display="flex" alignItems="center">
            <MDTypography
              variant="caption"
              sx={{
                color: ({ palette: { warning } }) => warning.dark,
                fontSize: "1.2rem",
                lineHeight: 1.5,
                mr: 0.5,
              }}
            >
              ●
            </MDTypography>
            <MDTypography
              variant="caption"
              color="dark"
              sx={{ fontSize: "0.75rem", lineHeight: 1.5 }}
            >
              Pending
            </MDTypography>
          </MDBox>
        </MDBox>
        {error && (
          <MDBox p={3}>
            <MDTypography variant="body2" color="error">
              {error}
            </MDTypography>
          </MDBox>
        )}
        <MDBox>
          <DataTable
            table={{ columns, rows }}
            showTotalEntries={false}
            isSorted={false}
            noEndBorder
            entriesPerPage={false}
          />
        </MDBox>
      </Card>
      {renderMenu}
    </MDBox>
  );
}

export default Publications;