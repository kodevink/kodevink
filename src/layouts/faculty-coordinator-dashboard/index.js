import { useEffect, useState } from "react";
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
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import DataTable from "examples/Tables/DataTable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PublicationTable({ publications, onVerify, selectedTab }) {
    const [menu, setMenu] = useState(null);
    const [selectedPublication, setSelectedPublication] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState("All");

    const openMenu = ({ currentTarget }, publication) => {
        setSelectedPublication(publication);
        setMenu(currentTarget);
    };

    const closeMenu = () => {
        setMenu(null);
    };

    const handleVerify = (publicationId) => {
        onVerify(publicationId);
        closeMenu();
    };

    const handleCategoryChange = (event) => {
        setCategoryFilter(event.target.value);
    };

    const columns = [
        { Header: "Title", accessor: "title", width: "20%" },
        { Header: "Author", accessor: "author", width: "15%" },
        { Header: "Publication Type", accessor: "publication_type", width: "15%" },
        { Header: "Publication Name", accessor: "publication_name", width: "20%" },
        { Header: "Year", accessor: "publication_year", width: "10%" },
        { Header: "Scopus Indexed", accessor: "is_scopus_indexed", width: "10%" },
        { Header: "Document", accessor: "document", width: "10%" },
        { Header: "Actions", accessor: "actions", width: "5%" },
    ];

    const filteredPublications = categoryFilter === "All"
        ? publications
        : publications.filter((pub) => pub.publication_type === categoryFilter);

    const rows = filteredPublications.map((pub) => ({
        title: pub.title,
        author: pub.profiles?.full_name || "Unknown",
        publication_type: pub.publication_type,
        publication_name: pub.publication_name,
        publication_year: pub.publication_year || "N/A",
        is_scopus_indexed: pub.is_scopus_indexed ? "Yes" : "No",
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
        actions: selectedTab === "pending" && pub.document_url ? (
            <MDBox>
                <Icon
                    sx={{ cursor: "pointer", fontWeight: "bold" }}
                    fontSize="small"
                    onClick={(e) => openMenu(e, pub)}
                >
                    more_vert
                </Icon>
            </MDBox>
        ) : null,
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
            <MenuItem onClick={() => handleVerify(selectedPublication.id)}>Verify</MenuItem>
        </Menu>
    );

    return (
        <MDBox width="100%" mx="auto" my={3}>
            <Card sx={{ width: "100%", maxWidth: "100%" }}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
                    <MDBox>
                        <MDTypography variant="h6" gutterBottom>
                            {selectedTab === "pending" ? "Pending Publications" : "Verified Publications"}
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

function FacultyCoordinatorDashboard({ role = "faculty-coordinator" }) {
    const [activeSection, setActiveSection] = useState("dashboard");
    const [facultyData, setFacultyData] = useState([]);
    const [pendingPublications, setPendingPublications] = useState([]);
    const [verifiedPublications, setVerifiedPublications] = useState([]);
    const [selectedTab, setSelectedTab] = useState("pending");
    const [stats, setStats] = useState({
        totalFaculty: 0,
        activeFaculty: 0,
        pendingVerifications: 0,
        newFacultyThisYear: 0,
        deptDistribution: {},
    });
    const [userDepartment, setUserDepartment] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get authenticated user
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError || !user) throw new Error("User not authenticated");

                // Fetch user's profile to get their department
                const { data: userProfile, error: profileError } = await supabase
                    .from("profiles")
                    .select("department_id, departments (dname)")
                    .eq("id", user.id)
                    .single();
                if (profileError) throw new Error(`Error fetching user profile: ${profileError.message} `);
                const departmentId = userProfile.department_id;
                const departmentName = userProfile.departments.dname;
                setUserDepartment(departmentName);

                // Fetch all faculty in the same department
                const { data: faculty, error: facultyError } = await supabase
                    .from("profiles")
                    .select("*, departments (dname)")
                    .eq("department_id", departmentId);
                if (facultyError) throw new Error(`Error fetching faculty: ${facultyError.message} `);
                setFacultyData(faculty || []);

                // Calculate faculty stats
                const currentYear = new Date().getFullYear();
                const totalFaculty = faculty.length;
                const activeFaculty = totalFaculty; // Assuming all are active if no status column
                const newFacultyThisYear = faculty.filter(f => new Date(f.created_at).getFullYear() === currentYear).length;
                const deptDistribution = faculty.reduce((acc, f) => {
                    const dname = f.departments.dname;
                    acc[dname] = (acc[dname] || 0) + 1;
                    return acc;
                }, {});

                // Fetch publications for the department's faculty
                const facultyIds = faculty.map(f => f.id);
                const { data: publications, error: pubError } = await supabase
                    .from("publications")
                    .select(`
                        *,
                        profiles(
                            full_name
                        )
                            `)
                    .in("profile_id", facultyIds);
                if (pubError) throw new Error(`Error fetching publications: ${pubError.message} `);

                const pending = publications.filter(p => p.verification_status === "pending");
                const verified = publications.filter(p => p.verification_status === "verified");
                setPendingPublications(pending);
                setVerifiedPublications(verified);

                setStats({
                    totalFaculty,
                    activeFaculty,
                    pendingVerifications: pending.length,
                    newFacultyThisYear,
                    deptDistribution,
                });
            } catch (err) {
                console.error("Error fetching data:", err.message);
                toast.error(`Error: ${err.message} `, { autoClose: 2000 });
            }
        };
        fetchData();
    }, [role]);

    const handleVerify = async (publicationId) => {
        try {
            const { error } = await supabase
                .from("publications")
                .update({ verification_status: "verified" })
                .eq("id", publicationId);
            console.log("Verification status updated:", publicationId);
            if (error) throw error;
            toast.success("Publication verified successfully!", { autoClose: 2000 });
            // Refetch data
            const facultyIds = facultyData.map(f => f.id);
            const { data: publications, error: pubError } = await supabase
                .from("publications")
                .select(`
                    *,
                    profiles(
                        full_name
                    )
                        `)
                .in("profile_id", facultyIds);
            if (pubError) throw new Error(`Error fetching publications: ${pubError.message} `);
            const pending = publications.filter(p => p.verification_status === "pending");
            const verified = publications.filter(p => p.verification_status === "verified");
            setPendingPublications(pending);
            setVerifiedPublications(verified);
            setStats((prev) => ({ ...prev, pendingVerifications: pending.length }));
        } catch (err) {
            toast.error(`Error verifying publication: ${err.message} `, { autoClose: 2000 });
        }
    };

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
            <MDBox mt={4.5}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <MDBox display="flex" mb={2}>
                            <MDButton
                                variant={selectedTab === "pending" ? "gradient" : "outlined"}
                                color="info"
                                onClick={() => setSelectedTab("pending")}
                                sx={{ mr: 1 }}
                            >
                                Pending Publications
                            </MDButton>
                            <MDButton
                                variant={selectedTab === "verified" ? "gradient" : "outlined"}
                                color="info"
                                onClick={() => setSelectedTab("verified")}
                            >
                                Verified Publications
                            </MDButton>
                        </MDBox>
                        <PublicationTable
                            publications={selectedTab === "pending" ? pendingPublications : verifiedPublications}
                            onVerify={handleVerify}
                            selectedTab={selectedTab}
                        />
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
                setMessage={(msg, isError) => isError ? toast.error(msg, { autoClose: 2000 }) : toast.success(msg, { autoClose: 2000 })}
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
                <ToastContainer />
                {activeSection === "dashboard" && renderDashboard()}
                {activeSection === "faculty" && renderFacultyManagement()}
                {activeSection === "students" && renderStudentReports()}
                {activeSection === "settings" && role === "hod" && renderSettings()}
            </MDBox>
        </DashboardLayout>
    );
}

export default FacultyCoordinatorDashboard;