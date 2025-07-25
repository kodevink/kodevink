import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Modal from "@mui/material/Modal";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import PieChart from "examples/Charts/PieChart";
import Publications from "layouts/dashboard/components/Publications";
import PublicationForm from "components/PublicationForm";
import { getPublicationChartData } from "layouts/dashboard/data/publicationChartData";
import { supabase } from "utils/supabase";

function Dashboard() {
  const [openModal, setOpenModal] = useState(false);
  const [publications, setPublications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    thisYear: 0,
    ugcCare: 0,
    scopusIndexed: 0,
  });
  const [editPublication, setEditPublication] = useState(null);

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
      console.log("Dashboard fetched publications:", data);
      setPublications(data || []);

      // Calculate statistics
      const currentYear = new Date().getFullYear();
      const total = data.length;
      const verified = data.filter((pub) => pub.verification_status === "verified").length;
      const pending = data.filter((pub) => pub.verification_status === "pending").length;
      const thisYear = data.filter((pub) => pub.publication_year === currentYear).length;
      const ugcCare = data.filter((pub) => pub.is_ugc_care).length;
      const scopusIndexed = data.filter((pub) => pub.is_scopus_indexed).length;
      setStats({ total, verified, pending, thisYear, ugcCare, scopusIndexed });
    } catch (err) {
      console.error("Error fetching publications:", err.message);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  // Pie chart data
  const typeCounts = publications.reduce((acc, pub) => {
    acc[pub.publication_type] = (acc[pub.publication_type] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = {
    labels: Object.keys(typeCounts),
    datasets: {
      label: "Publications",
      backgroundColors: ["primary", "success", "dark", "info"],
      data: Object.values(typeCounts),
    },
  };

  // Get line chart data
  const { publicationsPerYear, verificationStatus } = getPublicationChartData(publications);

  const handleOpenModal = (publication = null) => {
    console.log("Handle edit, selectedPublication:", publication);
    setEditPublication(publication);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    console.log("Closing modal, editPublication:", editPublication);
    setEditPublication(null);
    setOpenModal(false);
  };

  const handleSubmitSuccess = (refreshPublications) => {
    console.log("Dashboard handleSubmitSuccess called, refreshing data");
    fetchPublications();
    if (typeof refreshPublications === "function") {
      console.log("Triggering Publications refresh from Dashboard");
      refreshPublications();
    } else {
      console.warn("refreshPublications is not a function:", refreshPublications);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3} display="flex" justifyContent="flex-end">
          <MDButton variant="gradient" color="info" onClick={() => handleOpenModal()}>
            Add Publication
          </MDButton>
        </MDBox>
        <Modal
          open={openModal}
          onClose={handleCloseModal}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(5px)",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          }}
        >
          <PublicationForm
            key={editPublication ? editPublication.id : "new"}
            onClose={handleCloseModal}
            onSubmitSuccess={() => handleSubmitSuccess(fetchPublications)}
            editPublication={editPublication}
          />
        </Modal>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={2}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="library_books"
                title="Total Publications"
                count={stats.total}
                percentage={{
                  color: "success",
                  amount: "+10%",
                  label: "than last year",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={2}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="verified"
                title="Verified Submissions"
                count={stats.verified}
                percentage={{
                  color: "success",
                  amount: "+3%",
                  label: "than last year",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={2}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="pending_actions"
                title="Pending Verifications"
                count={stats.pending}
                percentage={{
                  color: "success",
                  amount: "+1%",
                  label: "than last year",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={2}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="calendar_month"
                title="Publications This Year"
                count={stats.thisYear}
                percentage={{
                  color: "error",
                  amount: "-5%",
                  label: "than last year",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg Gaza Strip={2}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="info"
                icon="school"
                title="Scopus Indexed"
                count={stats.scopusIndexed}
                percentage={{
                  color: "success",
                  amount: "+5%",
                  label: "than last year",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={2}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="warning"
                icon="verified_user"
                title="UGC-CARE Listed"
                count={stats.ugcCare}
                percentage={{
                  color: "success",
                  amount: "+2%",
                  label: "than last year",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="Publications per Year"
                  description="Number of publications over the last 10 years."
                  date="updated today"
                  chart={publicationsPerYear}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="dark"
                  title="Verification Status"
                  description="Verified vs. pending publications over time."
                  date="updated today"
                  chart={verificationStatus}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <PieChart
                  color="info"
                  title="Publications by Type"
                  description="Breakdown of your scholarly work."
                  date="updated today"
                  chart={pieChartData}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Publications
                refreshPublications={fetchPublications}
                onEditPublication={handleOpenModal}
              />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;