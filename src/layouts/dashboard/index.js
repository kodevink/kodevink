import { useEffect, useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import Modal from "@mui/material/Modal";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import PieChart from "examples/Charts/PieChart";
import MDButton from "components/MDButton";
import PublicationForm from "components/PublicationForm";


// Dashboard components
// import Projects from "layouts/dashboard/components/Projects";

// Data
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

function Dashboard() {
  const { sales, tasks } = reportsLineChartData;

  const [openModal, setOpenModal] = useState(false);

  const publications = [
    {
      id: 1,
      title: "A Study on a Novel Machine Learning Algorithm",
      publication_type: "Journal Paper",
      publication_year: 2024,
      verification_status: "verified",
      profiles: { full_name: "Dr. Anjali Sharma" }
    },
    {
      id: 2,
      title: "Innovations in Cloud Computing Security",
      publication_type: "Conference Paper",
      publication_year: 2024,
      verification_status: "pending",
      profiles: { full_name: "Dr. Anjali Sharma" }
    },
    {
      id: 3,
      title: "System and Method for Data Encryption",
      publication_type: "Patent",
      publication_year: 2023,
      verification_status: "verified",
      profiles: { full_name: "Dr. Anjali Sharma" }
    },
    {
      id: 4,
      title: "Advanced Topics in Quantum Physics",
      publication_type: "Book Chapter",
      publication_year: 2022,
      verification_status: "verified",
      profiles: { full_name: "Dr. Anjali Sharma" }
    },
    {
      id: 5,
      title: "The Impact of AI on Modern Education",
      publication_type: "Journal Paper",
      publication_year: 2023,
      verification_status: "verified",
      profiles: { full_name: "Dr. Anjali Sharma" }
    },
  ];

  const typeCounts = publications.reduce((acc, pub) => {
    acc[pub.publication_type] = (acc[pub.publication_type] || 0) + 1;
    return acc;
  }, {});

  const doughnutChartData = {
    labels: Object.keys(typeCounts),
    datasets: {
      label: "Publications",
      backgroundColors: ["primary", "success", "dark", "info"],
      data: Object.values(typeCounts),
    },
    cutout: "60%", // Matches default cutout in component
  };

  const pieChartData = {
    labels: Object.keys(typeCounts),
    datasets: {
      label: "Publications",
      backgroundColors: ["primary", "success", "dark", "info"], // Aligned with Material Dashboard color palette
      data: Object.values(typeCounts),
    },
  };


  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3} display="flex" justifyContent="flex-end">
          <MDButton variant="gradient" color="info" onClick={handleOpenModal}>
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
          }}
        >
          <PublicationForm onClose={handleCloseModal} />
        </Modal>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="library_books"
                title="Total Publications"
                count={22}
                percentage={{
                  color: "success",
                  amount: "+10%",
                  label: "than last year",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="verified"
                title="Verified Submissions"
                count="18"
                percentage={{
                  color: "success",
                  amount: "+3%",
                  label: "than last year",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="pending_actions"
                title="Pending Verifications"
                count="4"
                percentage={{
                  color: "success",
                  amount: "+1%",
                  label: "than last year",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="calendar_month"
                title="Publications This Year"
                count="2"
                percentage={{
                  color: "error",
                  amount: "-5%",
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
                  title="daily sales"
                  description={
                    <>
                      (<strong>+15%</strong>) increase in today sales.
                    </>
                  }
                  date="updated 4 min ago"
                  chart={sales}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="dark"
                  title="completed tasks"
                  description="Last Campaign Performance"
                  date="just updated"
                  chart={tasks}
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

        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
              {/* <Projects /> */}
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;