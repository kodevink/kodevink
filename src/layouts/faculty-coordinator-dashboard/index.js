import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Modal from "@mui/material/Modal";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import PieChart from "examples/Charts/PieChart";
import ManageFaculty from "./manage-faculty";
import { supabase } from "utils/supabase";

function FacultyCoordinatorDashboard({ role = "faculty-coordinator" }) {
    const [activeSection, setActiveSection] = useState("dashboard");
    const [facultyData, setFacultyData] = useState([]);
    const [stats, setStats] = useState({
        totalFaculty: 0,
        activeFaculty: 0,
        pendingVerifications: 0,
        newFacultyThisYear: 0,
        deptDistribution: {},
    });
    const [message, setMessage] = useState("");
    const [userDepartment, setUserDepartment] = useState("");


    useEffect(() => {
        const fetchFaculty = async () => {
            try {
                // Get authenticated user
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError || !user) throw new Error("User not authenticated");

                // Fetch user's profile to get their department
                const { data: userProfile, error: profileError } = await supabase
                    .from("profiles")
                    .select("department_id")
                    .eq("id", user.id)
                    .single();
                if (profileError) throw new Error(`Error fetching user profile: ${profileError.message}`);
                const department = userProfile.department;
                setUserDepartment(department);

                // Fetch all faculty in the same department
                const { data: faculty, error: facultyError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("department_id", department);
                // .eq("role", "professor"); // Assuming 'role' column exists to identify faculty
                if (facultyError) throw new Error(`Error fetching faculty: ${facultyError.message}`);
                setFacultyData(faculty || []);

                // Calculate stats
                const currentYear = new Date().getFullYear();
                const totalFaculty = faculty.length;
                const activeFaculty = faculty.filter(f => f.status === "active").length; // Assuming 'status' column
                const newFacultyThisYear = faculty.filter(f => new Date(f.created_at).getFullYear() === currentYear).length;
                const deptDistribution = faculty.reduce((acc, f) => {
                    acc[f.department] = (acc[f.department] || 0) + 1;
                    return acc;
                }, {});

                // Fetch pending verifications for publications in the same department
                const { data: publications, error: pubError } = await supabase
                    .from("publications")
                    .select(`
                        *,
                        profiles (
                        id,
                        department_id
                        )
                    `)
                    .eq("verification_status", "pending")
                    .eq("profiles.department_id", department);
                if (pubError) throw new Error(`Error fetching publications: ${pubError.message}`);
                const pendingVerifications = publications.length;

                setStats({
                    totalFaculty,
                    activeFaculty,
                    pendingVerifications,
                    newFacultyThisYear,
                    deptDistribution,
                });
            } catch (err) {
                console.error("Error fetching data:", err.message);
                setMessage(`Error: ${err.message}`);
                setTimeout(() => setMessage(""), 3000);
            }
        };
        fetchFaculty();
    }, [role]);

    const lineChartData = {
        labels: ["2020", "2021", "2022", "2023", "2024", "2025"],
        datasets: {
            label: "Faculty Activity",
            data: facultyData.reduce((acc, f) => {
                const year = new Date(f.created_at).getFullYear();
                const index = year - 2020;
                if (index >= 0 && index < acc.length) acc[index]++;
                return acc;
            }, [0, 0, 0, 0, 0, 0]),
        },
    };

    const pieChartData = {
        labels: Object.keys(stats.deptDistribution),
        datasets: {
            label: "Department Distribution",
            backgroundColors: ["primary", "success", "info"],
            data: Object.values(stats.deptDistribution),
        },
    };

    const renderDashboard = () => (
        <MDBox py={3}>
            <Grid container spacing={2}>
                {[
                    {
                        color: "dark",
                        icon: "group",
                        title: "Total Faculty",
                        count: stats.totalFaculty,
                        percentage: { color: "success", amount: "+5%", label: "than last year" },
                    },
                    {
                        icon: "person",
                        title: "Active Faculty",
                        count: stats.activeFaculty,
                        percentage: { color: "success", amount: "+3%", label: "than last year" },
                    },
                    {
                        color: "warning",
                        icon: "pending_actions",
                        title: "Pending Verifications",
                        count: stats.pendingVerifications,
                        percentage: { color: "error", amount: "+1%", label: "than last year" },
                    },
                    {
                        color: "info",
                        icon: "calendar_today",
                        title: "New Faculty This Year",
                        count: stats.newFacultyThisYear,
                        percentage: { color: "success", amount: "+10%", label: "than last year" },
                    },
                ].map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} lg={3} key={index} sx={{ flex: "1 1 0", minWidth: 0 }}>
                        <MDBox mb={1.5}>
                            <ComplexStatisticsCard
                                color={stat.color}
                                icon={stat.icon}
                                title={stat.title}
                                count={stat.count}
                                percentage={stat.percentage}
                                sx={{ "& .MuiTypography-root": { textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" } }}
                            />
                        </MDBox>
                    </Grid>
                ))}
            </Grid>
            <MDBox mt={4.5}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6} lg={6}>
                        <MDBox mb={3}>
                            <ReportsLineChart
                                color="success"
                                title="Faculty Activity"
                                description="Activity over the last 6 years."
                                date="updated today"
                                chart={lineChartData}
                            />
                        </MDBox>
                    </Grid>
                    <Grid item xs={12} md={6} lg={6}>
                        <MDBox mb={3}>
                            <PieChart
                                color="info"
                                title="Department Distribution"
                                description="Faculty across departments."
                                date="updated today"
                                chart={pieChartData}
                            />
                        </MDBox>
                    </Grid>
                </Grid>
            </MDBox>
        </MDBox>
    );

    const renderFacultyManagement = () => (
        <MDBox py={3}>
            <ManageFaculty
                facultyData={facultyData}
                setFacultyData={setFacultyData}
                userDepartment={userDepartment}
                role={role}
                setMessage={setMessage}
            />
        </MDBox>
    );

    const renderStudentReports = () => (
        <MDBox py={3}>
            <MDTypography variant="h5" fontWeight="medium">Student Reports</MDTypography>
            <MDTypography variant="body2">View student performance reports here. (Placeholder)</MDTypography>
        </MDBox>
    );

    const renderSettings = () => (
        <MDBox py={3}>
            <MDTypography variant="h5" fontWeight="medium">Department Settings</MDTypography>
            <MDTypography variant="body2">Configure department settings here. (Placeholder)</MDTypography>
        </MDBox>
    );

    if (role !== "faculty-coordinator" && role !== "hod") {
        return (
            <DashboardLayout>
                <DashboardNavbar />
                <MDBox py={3}>
                    <MDTypography variant="h4" color="error">
                        Access Denied: You do not have permission to view this dashboard.
                    </MDTypography>
                </MDBox>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox py={3}>
                {message && (
                    <MDTypography variant="body2" color={message.includes("Error") ? "error" : "success"} mb={2}>
                        {message}
                    </MDTypography>
                )}
                {activeSection === "dashboard" && renderDashboard()}
                {activeSection === "faculty" && renderFacultyManagement()}
                {activeSection === "students" && renderStudentReports()}
                {activeSection === "settings" && role === "hod" && renderSettings()}
            </MDBox>
        </DashboardLayout>
    );
}

export default FacultyCoordinatorDashboard;