// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
// import Footer from "examples/Footer";
// import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import PieChart from "examples/Charts/PieChart";


// // Data
// import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
// import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// // Dashboard components
// import Projects from "layouts/dashboard/components/Projects";
// import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

function Dashboard() {
    const publications=[
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

  const pieChartData = {
    labels: Object.keys(typeCounts),
    datasets: {
      label: "Publications",
      backgroundColors: ["info", "primary", "dark", "secondary", "success"],
      data: Object.values(typeCounts),
    },
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox py={3}>
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
                  label: "than lask year",
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
                <PieChart
                  icon={{ color: "info", component: "donut_large" }}
                  title="Publications by Type"
                  description="Breakdown of your scholarly work."
                  chart={pieChartData}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;
