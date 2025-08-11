import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Modal from "@mui/material/Modal";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDTypography from "components/MDTypography";
import FacultyForm from "../faculty-coordinator-dashboard/components/FacultyForm";
import { supabase } from "utils/supabase";

function HODDashboard() {
  const [facultyData, setFacultyData] = useState([]);
  const [newFaculty, setNewFaculty] = useState({
    name: "",
    email: "",
    department: "",
  });
  const [selectedCoordinator, setSelectedCoordinator] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      setFacultyData(data || []);
    } catch (err) {
      console.error("Error fetching faculty:", err.message);
    }
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (!newFaculty.name || !newFaculty.email || !newFaculty.department) {
      setMessage("All fields are required.");
      return;
    }
    try {
      const { error } = await supabase.from("profiles").insert(newFaculty);
      if (error) throw error;
      setFacultyData([
        ...facultyData,
        { id: facultyData.length + 1, ...newFaculty },
      ]);
      setNewFaculty({ name: "", email: "", department: "" });
      setMessage("Faculty added successfully!");
    } catch (err) {
      setMessage(`Error adding faculty: ${err.message}`);
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleRemoveFaculty = async (email) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("email", email);
      if (error) throw error;
      setFacultyData(facultyData.filter((f) => f.email !== email));
      setMessage("Faculty removed successfully!");
    } catch (err) {
      setMessage(`Error removing faculty: ${err.message}`);
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleCoordinatorChange = async (event) => {
    const newCoordinatorEmail = event.target.value;
    setSelectedCoordinator(newCoordinatorEmail);
    try {
      await supabase
        .from("profiles")
        .update({ is_coordinator: false })
        .neq("email", newCoordinatorEmail);
      await supabase
        .from("profiles")
        .update({ is_coordinator: true })
        .eq("email", newCoordinatorEmail);
      fetchFaculty();
      setMessage("Coordinator updated successfully.");
    } catch (err) {
      setMessage(`Error updating coordinator: ${err.message}`);
    }
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MDBox mb={3} display="flex" justifyContent="flex-end">
              <MDButton
                variant="gradient"
                color="info"
                onClick={() => setOpenModal(true)}
              >
                Add Faculty
              </MDButton>
            </MDBox>
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
              <FacultyForm
                onClose={() => setOpenModal(false)}
                onSubmit={handleAddFaculty}
                newFaculty={newFaculty}
                setNewFaculty={setNewFaculty}
              />
            </Modal>
            <h2 className="text-xl font-bold">Faculty List</h2>
            <ul className="list-disc pl-5 mt-2">
              {facultyData.map((faculty) => (
                <li key={faculty.id} className="my-1">
                  {faculty.name} - {faculty.email} ({faculty.department})
                  <MDButton
                    color="error"
                    size="small"
                    onClick={() => handleRemoveFaculty(faculty.email)}
                    sx={{ ml: 2 }}
                  >
                    Remove
                  </MDButton>
                </li>
              ))}
            </ul>
          </Grid>
          <Grid item xs={12}>
            <h2 className="text-xl font-bold">Assign Coordinator</h2>
            <select
              value={selectedCoordinator}
              onChange={handleCoordinatorChange}
              className="w-full p-2 border rounded mt-2"
            >
              <option value="" disabled>
                Select Coordinator
              </option>
              {facultyData.map((faculty) => (
                <option key={faculty.email} value={faculty.email}>
                  {faculty.name}
                </option>
              ))}
            </select>
          </Grid>
        </Grid>
        {message && <p className="mt-4 text-green-600">{message}</p>}
      </MDBox>
    </DashboardLayout>
  );
}

export default HODDashboard;
