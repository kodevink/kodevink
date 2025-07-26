import { supabase } from "utils/supabase";
import { useState, useEffect } from "react";
import { Grid, TextField, Button, Box, Typography, Snackbar, Alert } from "@mui/material";

function ProfileForm({ profile, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        full_name: "",
        department_id: "",
        orcid_id: "",
        bio: "",
        google_scholar_url: "",
        scopus_url: "",
        researchgate_url: "",
        linkedin_url: "",
    });
    const [errors, setErrors] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    // Pre-fill form with existing data, leaving null/empty as empty strings
    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || "",
                department_id: profile.department?.dname || "", // Read-only department name
                orcid_id: profile.orcid_id || "",
                bio: profile.bio || "",
                google_scholar_url: profile.google_scholar_url || "",
                scopus_url: profile.scopus_url || "",
                researchgate_url: profile.researchgate_url || "",
                linkedin_url: profile.linkedin_url || "",
            });
        }
    }, [profile]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.full_name.trim()) newErrors.full_name = "Name is required";
        if (!formData.bio.trim()) newErrors.bio = "Bio is required";
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const departmentId = profile.department?.id || (await supabase
                .from("departments")
                .select("id")
                .eq("dname", formData.department_id)
                .single()).data.id; // Use existing department_id or fetch if needed
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: formData.full_name,
                    department_id: departmentId,
                    orcid_id: formData.orcid_id,
                    bio: formData.bio,
                    google_scholar_url: formData.google_scholar_url,
                    scopus_url: formData.scopus_url,
                    researchgate_url: formData.researchgate_url,
                    linkedin_url: formData.linkedin_url,
                })
                .eq("id", user.id);

            if (error) throw error;
            console.log("Profile updated:", formData);
            setSnackbarMessage("Profile updated successfully!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
            onClose(); // Dismiss form
            onSuccess();
        } catch (err) {
            console.error("Error updating profile:", err.message);
            setSnackbarMessage(`Failed to update profile: ${err.message}`);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
    };

    return (
        <Box
            sx={{
                p: 3,
                bgcolor: "white",
                backgroundColor: "#ffffff",
                borderRadius: 2,
                width: "400px",
                zIndex: 1300,
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
        >
            <Typography variant="h6" gutterBottom>
                Edit Profile
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Email"
                            value={profile?.email || ""}
                            disabled
                            InputProps={{ readOnly: true }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            error={!!errors.full_name}
                            helperText={errors.full_name}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Department"
                            name="department_id"
                            value={formData.department_id}
                            onChange={handleChange}
                            disabled
                            InputProps={{ readOnly: true }}
                            error={!!errors.department_id}
                            helperText={errors.department_id}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="ORCID ID"
                            name="orcid_id"
                            value={formData.orcid_id}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            error={!!errors.bio}
                            helperText={errors.bio}
                            required
                            multiline
                            rows={4}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Google Scholar URL"
                            name="google_scholar_url"
                            value={formData.google_scholar_url}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Scopus URL"
                            name="scopus_url"
                            value={formData.scopus_url}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="ResearchGate URL"
                            name="researchgate_url"
                            value={formData.researchgate_url}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="LinkedIn URL"
                            name="linkedin_url"
                            value={formData.linkedin_url}
                            onChange={handleChange}
                        />
                    </Grid>
                    {errors.submit && (
                        <Grid item xs={12}>
                            <Typography color="error">{errors.submit}</Typography>
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            fullWidth
                            sx={{ color: "#000000", fontWeight: "bold", padding: "8px 16px" }}
                        >
                            Save
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={onClose}
                            fullWidth
                            sx={{ color: "#000000", fontWeight: "bold", padding: "8px 16px" }}
                        >
                            Cancel
                        </Button>
                    </Grid>
                </Grid>
            </form>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default ProfileForm;