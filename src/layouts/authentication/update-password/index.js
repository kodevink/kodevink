import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Material Dashboard 2 Components
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Supabase Client
import { supabase } from "utils/supabase";
// 🔁 adjust this path

function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage("Error updating password.");
    } else {
      setMessage("Password updated successfully. Redirecting...");
      setTimeout(() => navigate("/authentication/sign-in"), 2000);
    }
  };

  return (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <Card sx={{ width: 400, p: 4 }}>
        <MDTypography variant="h4" textAlign="center" mb={2}>
          Set New Password
        </MDTypography>
        <form onSubmit={handleUpdate}>
          <MDBox mb={3}>
            <MDInput
              type="password"
              label="New Password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </MDBox>
          <MDButton variant="gradient" color="info" type="submit" fullWidth>
            Update Password
          </MDButton>
        </form>
        {message && (
          <MDTypography variant="button" color="text" textAlign="center" mt={2}>
            {message}
          </MDTypography>
        )}
      </Card>
    </MDBox>
  );
}

export default UpdatePassword;
