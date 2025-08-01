import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CoverLayout from "layouts/authentication/components/CoverLayout";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import Card from "@mui/material/Card";
import { supabase } from "utils/supabase";
import bgImage from "assets/images/forget-password.jpg";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const [message, setMessage] = useState("");
  const [expired, setExpired] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const type = url.searchParams.get("type");
    const tsParam = url.searchParams.get("ts");

    if (type === "recovery") {
      const now = Date.now();
      const expiryLimit = 15 * 60 * 1000; // 15 minutes

      if (!tsParam || now - Number(tsParam) > expiryLimit) {
        setMessage("This reset link has expired. Please request a new one.");
        setIsResetMode(false);
        setExpired(true);
      } else {
        setIsResetMode(true);
      }
    }
  }, []);

  const handleEmailSubmit = async () => {
    const timestamp = Date.now();
    const redirectUrl = `http://localhost:3000/reset-password?type=recovery&ts=${timestamp}`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      setMessage("Error sending reset email");
    } else {
      setMessage("Password reset link sent. Check your inbox.");
    }
  };

  const handlePasswordReset = async () => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage("Error updating password");
    } else {
      setMessage("Password updated successfully. Redirecting to login...");
      await supabase.auth.signOut();
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  return (
    <CoverLayout coverHeight="50vh" image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          py={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            {isResetMode ? "Set New Password" : "Reset Password"}
          </MDTypography>
          <MDTypography variant="button" color="white" my={1}>
            {isResetMode
              ? "Enter your new password below"
              : "You will receive an email shortly with a reset link"}
          </MDTypography>
        </MDBox>

        <MDBox pt={4} pb={3} px={3}>
          <MDBox>
            {isResetMode && !expired ? (
              <>
                <MDBox mb={4}>
                  <MDInput
                    type="password"
                    label="New Password"
                    variant="standard"
                    fullWidth
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </MDBox>
                <MDBox mt={4} mb={1}>
                  <MDButton
                    variant="gradient"
                    color="info"
                    fullWidth
                    onClick={handlePasswordReset}
                  >
                    Update Password
                  </MDButton>
                </MDBox>
              </>
            ) : (
              <>
                <MDBox mb={4}>
                  <MDInput
                    type="email"
                    label="Email"
                    variant="standard"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </MDBox>
                <MDBox mt={4} mb={1}>
                  <MDButton
                    variant="gradient"
                    color="info"
                    fullWidth
                    onClick={handleEmailSubmit}
                  >
                    Send Reset Link
                  </MDButton>
                </MDBox>
              </>
            )}
            {message && (
              <MDTypography
                variant="button"
                color={expired ? "error" : "text"}
                mt={2}
                textAlign="center"
              >
                {message}
              </MDTypography>
            )}
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default ResetPassword;
