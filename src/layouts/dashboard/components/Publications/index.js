import { useState, useEffect } from "react";
import { supabase } from "utils/supabase";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import PublicationForm from "components/PublicationForm";

function Publications() {
  const [publications, setPublications] = useState([]);
  const [menu, setMenu] = useState(null);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  // Fetch publications for the authenticated user
  useEffect(() => {
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
        setPublications(data || []);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchPublications();
  }, []);

  const openMenu = ({ currentTarget }, publication) => {
    setMenu(currentTarget);
    setSelectedPublication(publication);
  };
  const closeMenu = () => {
    setMenu(null);
    setSelectedPublication(null);
  };

  const handleEdit = () => {
    setShowForm(true);
    closeMenu();
  };

  const handleDelete = async () => {
    try {
      // Delete associated PDF if exists
      if (selectedPublication.document_url) {
        const fileName = selectedPublication.document_url.split("/").pop();
        const { error: storageError } = await supabase.storage
          .from("publication-documents")
          .remove([`${selectedPublication.profile_id}/${fileName}`]);
        if (storageError) {
          throw new Error(`Error deleting PDF: ${storageError.message}`);
        }
      }
      // Delete publication from Supabase
      const { error } = await supabase
        .from("publications")
        .delete()
        .eq("id", selectedPublication.id);
      if (error) {
        throw new Error(`Error deleting publication: ${error.message}`);
      }
      setPublications(publications.filter((pub) => pub.id !== selectedPublication.id));
      alert("Publication deleted successfully!");
    } catch (err) {
      setError(err.message);
    }
    closeMenu();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedPublication(null);
    // Refresh publications
    const fetchPublications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("publications")
        .select("*")
        .eq("profile_id", user.id);
      setPublications(data || []);
    };
    fetchPublications();
  };

  const columns = [
    { Header: "Title", accessor: "title", width: "25%" },
    { Header: "Publication Type", accessor: "publication_type", width: "15%" },
    { Header: "Publication Name", accessor: "publication_name", width: "20%" },
    { Header: "Year", accessor: "publication_year", width: "10%" },
    { Header: "Scopus Indexed", accessor: "is_scopus_indexed", width: "10%" },
    { Header: "UGC-CARE", accessor: "is_ugc_care", width: "10%" },
    { Header: "Status", accessor: "verification_status", width: "10%" },
    { Header: "Actions", accessor: "actions", width: "10%" },
  ];

  const rows = publications.map((pub) => ({
    title: pub.title,
    publication_type: pub.publication_type,
    publication_name: pub.publication_name,
    publication_year: pub.publication_year || "N/A",
    is_scopus_indexed: pub.is_scopus_indexed ? "Yes" : "No",
    is_ugc_care: pub.is_ugc_care ? "Yes" : "No",
    verification_status: pub.verification_status,
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
  }));

  const renderMenu = (
    <Menu
      id="simple-menu"
      anchorEl={menu}
      anchorOrigin={{ vertical: "top", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={Boolean(menu)}
      onClose={closeMenu}
    >
      <MenuItem onClick={handleEdit}>Edit</MenuItem>
      <MenuItem onClick={handleDelete}>Delete</MenuItem>
    </Menu>
  );

  return (
    <Card>
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
               <strong>{publications.length} total</strong> publications
            </MDTypography>
          </MDBox>
        </MDBox>
        <MDBox color="text" px={2}>
          <Icon sx={{ cursor: "pointer", fontWeight: "bold" }} fontSize="small" onClick={openMenu}>
            more_vert
          </Icon>
        </MDBox>
        {renderMenu}
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
      {showForm && (
        <PublicationForm
          onClose={handleFormClose}
          publication={selectedPublication}
        />
      )}
    </Card>
  );
}

export default Publications;