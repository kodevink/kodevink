import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Modal from "@mui/material/Modal";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import { supabase } from "utils/supabase";

// FacultyForm component (similar to PublicationForm)
function FacultyForm({ onClose, onSubmitSuccess, editFaculty }) {
    const [formData, setFormData] = useState({
        name: editFaculty?.name || "",
        email: editFaculty?.email || "",
        department: editFaculty?.department || "",
        role: editFaculty?.role || "professor",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            if (editFaculty) {
                // Update faculty
                const { error } = await supabase
                    .from("profiles")
                    .update({
                        name: formData.name,
                        email: formData.email,
                        department: formData.department,
                        role: formData.role,
                    })
                    .eq("id", editFaculty.id);
                if (error) throw error;
            } else {
                // Add new faculty (assuming profile creation is handled server-side)
                const { error } = await supabase
                    .from("profiles")
                    .insert({
                        name: formData.name,
                        email: formData.email,
                        department: formData.department,
                        role: formData.role,
                    });
                if (error) throw error;
            }
            onSubmitSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving faculty:", error.message);
        }
    };

    return (
        <MDBox
            bgColor="white"
            borderRadius="lg"
            p={4}
            width="100%"
            maxWidth="500px"
            sx={{ boxShadow: 3 }}
        >
            <MDTypography variant="h5" mb={3}>
                {editFaculty ? "Edit Faculty" : "Add Faculty"}
            </MDTypography>
            <form onSubmit={handleSubmit}>
                <MDBox mb={2}>
                    <MDTypography variant="caption">Name</MDTypography>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                        required
                    />
                </MDBox>
                <MDBox mb={2}>
                    <MDTypography variant="caption">Email</MDTypography>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                        required
                    />
                </MDBox>
                <MDBox mb={2}>
                    <MDTypography variant="caption">Department</MDTypography>
                    <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                        required
                    />
                </MDBox>
                <MDBox mb={2}>
                    <MDTypography variant="caption">Role</MDTypography>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                    >
                        <option value="faculty">Faculty</option>
                        <option value="faculty-coordinator">Faculty Coordinator</option>
                        <option value="admin">Admin</option>
                    </select>
                </MDBox>
                <MDBox display="flex" justifyContent="flex-end" mt={3}>
                    <MDButton variant="outlined" color="secondary" onClick={onClose} sx={{ mr: 1 }}>
                        Cancel
                    </MDButton>
                    <MDButton variant="gradient" color="info" type="submit">
                        {editFaculty ? "Update" : "Add"}
                    </MDButton>
                </MDBox>
            </form>
        </MDBox>
    );
}

// FacultyTable component (similar to Publications, using Material-UI Table)
function FacultyTable({ faculties, onEditFaculty }) {
    return (
        <MDBox mb={3}>
            <MDTypography variant="h5" mb={2}>
                Faculty List
            </MDTypography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {faculties.length > 0 ? (
                            faculties.map((faculty) => (
                                <TableRow key={faculty.id}>
                                    <TableCell>{faculty.full_name}</TableCell>
                                    <TableCell>{faculty.email}</TableCell>
                                    <TableCell>{faculty.department}</TableCell>
                                    <TableCell>{faculty.role}</TableCell>
                                    <TableCell align="right">
                                        <MDButton
                                            variant="text"
                                            color="info"
                                            onClick={() => onEditFaculty(faculty)}
                                        >
                                            Edit
                                        </MDButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <MDTypography variant="body2" color="textSecondary">
                                        No faculty members found.
                                    </MDTypography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </MDBox>
    );
}

function ManageFaculty() {
    const [openModal, setOpenModal] = useState(false);
    const [faculties, setFaculties] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        faculty: 0,
        coordinators: 0,
        admins: 0,
        departments: 0,
    });
    const [editFaculty, setEditFaculty] = useState(null);

    // Fetch faculties
    const fetchFaculties = async () => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .in("role", ["professor", "faculty-coordinator", "hod"]);
            if (error) {
                throw new Error(`Error fetching faculties: ${error.message}`);
            }
            console.log("ManageFaculty fetched faculties:", data);
            setFaculties(data || []);

            // Calculate statistics
            const total = data.length;
            const faculty = data.filter((f) => f.role === "professor").length;
            const coordinators = data.filter((f) => f.role === "faculty-coordinator").length;
            const admins = data.filter((f) => f.role === "hod").length;
            const departments = new Set(data.map((f) => f.department)).size;
            setStats({ total, faculty, coordinators, admins, departments });
        } catch (err) {
            console.error("Error fetching faculties:", err.message);
        }
    };

    useEffect(() => {
        fetchFaculties();
    }, []);

    const handleOpenModal = (faculty = null) => {
        console.log("Handle edit, selectedFaculty:", faculty);
        setEditFaculty(faculty);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        console.log("Closing modal, editFaculty:", editFaculty);
        setEditFaculty(null);
        setOpenModal(false);
    };

    const handleSubmitSuccess = () => {
        console.log("ManageFaculty handleSubmitSuccess called, refreshing data");
        fetchFaculties();
    };

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox py={3}>
                <MDBox mb={3} display="flex" justifyContent="flex-end">
                    <MDButton variant="gradient" color="info" onClick={() => handleOpenModal()}>
                        Add Faculty
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
                    <FacultyForm
                        key={editFaculty ? editFaculty.id : "new"}
                        onClose={handleCloseModal}
                        onSubmitSuccess={handleSubmitSuccess}
                        editFaculty={editFaculty}
                    />
                </Modal>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6} lg={3}>
                        <MDBox mb={1.5}>
                            <ComplexStatisticsCard
                                color="dark"
                                icon="group"
                                title="Total Faculty"
                                count={stats.total}
                                percentage={{
                                    color: "success",
                                    amount: "+5%",
                                    label: "than last year",
                                }}
                            />
                        </MDBox>
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <MDBox mb={1.5}>
                            <ComplexStatisticsCard
                                icon="person"
                                title="Faculty Members"
                                count={stats.faculty}
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
                                icon="supervisor_account"
                                title="Coordinators"
                                count={stats.coordinators}
                                percentage={{
                                    color: "success",
                                    amount: "+2%",
                                    label: "than last year",
                                }}
                            />
                        </MDBox>
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <MDBox mb={1.5}>
                            <ComplexStatisticsCard
                                color="primary"
                                icon="admin_panel_settings"
                                title="Admins"
                                count={stats.admins}
                                percentage={{
                                    color: "error",
                                    amount: "-1%",
                                    label: "than last year",
                                }}
                            />
                        </MDBox>
                    </Grid>
                </Grid>
                <MDBox mt={4.5}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FacultyTable
                                faculties={faculties}
                                onEditFaculty={handleOpenModal}
                            />
                        </Grid>
                    </Grid>
                </MDBox>
            </MDBox>
        </DashboardLayout>
    );
}

export default ManageFaculty;