import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Modal from "@mui/material/Modal";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import PieChart from "examples/Charts/PieChart";
import FacultyForm from "./components/FacultyForm"; // Assuming a new form component
import { supabase } from "utils/supabase";
import MDTypography from "components/MDTypography";

function FacultyCoordinatorDashboard({ role = "faculty-coordinator" }) {
    const [activeSection, setActiveSection] = useState("dashboard");
    const [facultyData, setFacultyData] = useState([]);
    const [newFaculty, setNewFaculty] = useState({ name: "", email: "", department: "" });
    const [publicationToVerify, setPublicationToVerify] = useState("");
    const [message, setMessage] = useState("");
    const [openModal, setOpenModal] = useState(false);

    const navItems = {
        "hod": [
            { name: "Dashboard", section: "dashboard" },
            { name: "Faculty Management", section: "faculty" },
            { name: "Student Reports", section: "students" },
            { name: "Department Settings", section: "settings" }
        ],
        "faculty-coordinator": [
            { name: "Dashboard", section: "dashboard" },
            { name: "Faculty Management", section: "faculty" },
            { name: "Student Reports", section: "students" }
        ]
    };

    const stats = {
        totalFaculty: 12,
        activeFaculty: 10,
        pendingVerifications: 2,
        newFacultyThisYear: 3,
        deptDistribution: { "CS": 5, "Math": 4, "Physics": 3 }
    };

    const lineChartData = {
        labels: ["2020", "2021", "2022", "2023", "2024", "2025"],
        datasets: {
            label: "Faculty Activity",
            data: [5, 7, 8, 9, 10, 12],
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



    useEffect(() => {
        const fetchFaculty = async () => {
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError) throw authError;
                if (!user) throw new Error("User not authenticated");

                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (error) throw error;

                setFacultyData(data || []);
                console.log("Fetching faculty:", data);
            } catch (err) {
                console.error("Error fetching faculty:", err.message || err);
            }
        };
        fetchFaculty();
        console.log(`Role detected: ${role}`);

        // if (role) {
        //     fetchFaculty();
        //     console.log(`Role detected: ${role}`);
        // }
    }, [role]);

    const handleAddFaculty = async (e) => {
        e.preventDefault();
        if (!newFaculty.name || !newFaculty.email || !newFaculty.department) {
            setMessage("All fields are required.");
            return;
        }
        try {
            const { error } = await supabase
                .from("profiles")
                .insert(newFaculty);
            if (error) throw error;
            setFacultyData([...facultyData, { id: facultyData.length + 1, ...newFaculty }]);
            setNewFaculty({ name: "", email: "", department: "" });
            setMessage("Faculty added successfully!");
        } catch (err) {
            setMessage(`Error adding faculty: ${err.message}`);
        }
        setTimeout(() => setMessage(""), 3000);
    };

    const handleVerifyPublication = async () => {
        if (!publicationToVerify) {
            setMessage("Please enter a publication to verify.");
            return;
        }
        try {
            const { data, error } = await supabase
                .from("publications")
                .select("*")
                .eq("title", publicationToVerify)
                .single();
            const isValid = !error && data && data.verification_status === "pending";
            setMessage(`Publication ${publicationToVerify} ${isValid ? "verified successfully" : "verification failed or already verified"}.`);
            if (isValid) {
                await supabase
                    .from("publications")
                    .update({ verification_status: "verified" })
                    .eq("title", publicationToVerify);
            }
        } catch (err) {
            setMessage(`Error verifying publication: ${err.message}`);
        }
        setPublicationToVerify("");
        setTimeout(() => setMessage(""), 3000);
    };

    const handleOpenModal = () => {
        if (role !== "faculty-coordinator") {
            setMessage("You do not have permission to add faculty.");
            return;
        }
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setNewFaculty({ name: "", email: "", department: "" });
    };

    const renderDashboard = () => (
        <MDBox py={3}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={2}>
                    <MDBox mb={1.5}>
                        <ComplexStatisticsCard
                            color="dark"
                            icon="group"
                            title="Total Faculty"
                            count={stats.totalFaculty}
                            percentage={{ color: "success", amount: "+5%", label: "than last year" }}
                        />
                    </MDBox>
                </Grid>
                <Grid item xs={12} md={6} lg={2}>
                    <MDBox mb={1.5}>
                        <ComplexStatisticsCard
                            icon="person"
                            title="Active Faculty"
                            count={stats.activeFaculty}
                            percentage={{ color: "success", amount: "+3%", label: "than last year" }}
                        />
                    </MDBox>
                </Grid>
                <Grid item xs={12} md={6} lg={2}>
                    <MDBox mb={1.5}>
                        <ComplexStatisticsCard
                            color="warning"
                            icon="pending_actions"
                            title="Pending Verifications"
                            count={stats.pendingVerifications}
                            percentage={{ color: "error", amount: "+1%", label: "than last year" }}
                        />
                    </MDBox>
                </Grid>
                <Grid item xs={12} md={6} lg={2}>
                    <MDBox mb={1.5}>
                        <ComplexStatisticsCard
                            color="info"
                            icon="calendar_today"
                            title="New Faculty This Year"
                            count={stats.newFacultyThisYear}
                            percentage={{ color: "success", amount: "+10%", label: "than last year" }}
                        />
                    </MDBox>
                </Grid>
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
            <MDBox mb={3} display="flex" justifyContent="flex-end">
                {role === "faculty-coordinator" && (
                    <MDButton variant="gradient" color="info" onClick={handleOpenModal}>
                        Add Faculty
                    </MDButton>
                )}
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
                <FacultyForm
                    onClose={handleCloseModal}
                    onSubmit={handleAddFaculty}
                    newFaculty={newFaculty}
                    setNewFaculty={setNewFaculty}
                />
            </Modal>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <MDBox mb={3}>
                        <h2 className="text-xl font-bold">Faculty List</h2>
                        <ul className="list-disc pl-5 mt-2">
                            {facultyData.map((faculty) => (
                                <li key={faculty.id} className="my-1">
                                    {faculty.name} - {faculty.email} ({faculty.department})
                                </li>
                            ))}
                        </ul>
                    </MDBox>
                </Grid>
                {role === "faculty-coordinator" && (
                    <Grid item xs={12}>
                        <MDBox mb={3}>
                            <h2 className="text-xl font-bold">Verify Publication</h2>
                            <div className="mt-2 space-y-2">
                                <input
                                    type="text"
                                    value={publicationToVerify}
                                    onChange={(e) => setPublicationToVerify(e.target.value)}
                                    placeholder="Enter publication title or ID"
                                    className="w-full p-2 border rounded"
                                />
                                <MDButton
                                    variant="gradient"
                                    color="success"
                                    onClick={handleVerifyPublication}
                                >
                                    Verify Publication
                                </MDButton>
                            </div>
                            {message && <p className="mt-2 text-sm text-green-600">{message}</p>}
                        </MDBox>
                    </Grid>
                )}
            </Grid>
        </MDBox>
    );

    const renderStudentReports = () => (
        <MDBox py={3}>
            <h2 className="text-xl font-bold">Student Reports</h2>
            <p>View student performance reports here. (Placeholder)</p>
        </MDBox>
    );

    const renderSettings = () => (
        <MDBox py={3}>
            <h2 className="text-xl font-bold">Department Settings</h2>
            <p>Configure department settings here. (Placeholder)</p>
        </MDBox>
    );

    // Only render if the role is valid for this dashboard
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
            {activeSection === "dashboard" && renderDashboard()}
            {activeSection === "faculty" && renderFacultyManagement()}
            {activeSection === "students" && renderStudentReports()}
            {activeSection === "settings" && role === "hod" && renderSettings()}
            <div className="w-64 bg-blue-800 text-white p-4 fixed h-full">
                <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
                <nav>
                    {navItems[role].map((item) => (
                        <div
                            key={item.section}
                            className={`cursor-pointer p-2 rounded hover:bg-blue-600 ${activeSection === item.section ? "bg-blue-600" : ""}`}
                            onClick={() => setActiveSection(item.section)}
                        >
                            {item.name}
                        </div>
                    ))}
                </nav>
            </div>
        </DashboardLayout>
    );
}

export default FacultyCoordinatorDashboard;