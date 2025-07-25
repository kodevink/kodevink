
import { useState, useEffect } from "react";
import { supabase } from "utils/supabase";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

export default function ProfileForm({ profile, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        institution: "",
        department: "",
        orcid_id: "",
        google_scholar_url: "",
        scopus_url: "",
        researchgate_url: "",
        linkedin_url: "",
        bio: "",
    });
    const [errors, setErrors] = useState({});

    // Prefill form with profile data
    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || "",
                email: profile.email || "",
                institution: profile.institution || "",
                department: profile.department || "",
                orcid_id: profile.orcid_id || "",
                google_scholar_url: profile.google_scholar_url || "",
                scopus_url: profile.scopus_url || "",
                researchgate_url: profile.researchgate_url || "",
                linkedin_url: profile.linkedin_url || "",
                bio: profile.bio || "",
            });
        }
    }, [profile]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }
        if (formData.google_scholar_url && !/^https?:\/\/.+/i.test(formData.google_scholar_url)) {
            newErrors.google_scholar_url = "Invalid Google Scholar URL";
        }
        if (formData.scopus_url && !/^https?:\/\/.+/i.test(formData.scopus_url)) {
            newErrors.scopus_url = "Invalid Scopus URL";
        }
        if (formData.researchgate_url && !/^https?:\/\/.+/i.test(formData.researchgate_url)) {
            newErrors.researchgate_url = "Invalid ResearchGate URL";
        }
        if (formData.linkedin_url && !/^https?:\/\/.+/i.test(formData.linkedin_url)) {
            newErrors.linkedin_url = "Invalid LinkedIn URL";
        }
        if (formData.orcid_id && !/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(formData.orcid_id)) {
            newErrors.orcid_id = "Invalid ORCID ID format (e.g., 0000-0001-2345-678X)";
        }
        if (formData.bio.length > 500) {
            newErrors.bio = "Bio cannot exceed 500 characters";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                throw new Error("User not authenticated");
            }

            const profileData = {
                ...formData,
                id: user.id,
                updated_at: new Date().toISOString(),
            };

            // Upsert profile
            const { error } = await supabase
                .from("profiles")
                .upsert(profileData, { onConflict: "id" });

            if (error) {
                throw new Error(`Error updating profile: ${error.message}`);
            }

            alert("Profile updated successfully!");
            setErrors({});
            onClose();
            if (onSuccess) onSuccess();
        } catch (err) {
            setErrors({ submit: err.message });
        }
    };

    return (
        <MDBox
            p={3}
            component="form"
            onSubmit={handleSubmit}
            sx={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                maxWidth: "500px",
                width: "100%",
                mx: "auto",
                position: "relative",
            }}
        >
            <MDTypography variant="h6" mb={2} color="dark">
                Edit Profile
            </MDTypography>
            {errors.submit && (
                <MDTypography variant="body2" color="error" mb={2}>
                    {errors.submit}
                </MDTypography>
            )}
            <MDBox mb={2}>
                <MDInput
                    type="text"
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.name}
                    helperText={errors.name}
                />
            </MDBox>
            <MDBox mb={2}>
                <MDInput
                    type="email"
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.email}
                    helperText={errors.email}
                />
            </MDBox>
            <MDBox mb={2}>
                <MDInput
                    type="text"
                    label="Institution"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.institution}
                    helperText={errors.institution}
                />
            </MDBox>
            <MDBox mb={2}>
                <MDInput
                    type="text"
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.department}
                    helperText={errors.department}
                />
            </MDBox>
            <MDBox mb={2}>
                <MDInput
                    type="text"
                    label="ORCID ID"
                    name="orcid_id"
                    value={formData.orcid_id}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.orcid_id}
                    helperText={errors.orcid_id}
                />
            </MDBox>
            <MDBox mb={2}>
                <MDInput
                    type="text"
                    label="Google Scholar URL"
                    name="google_scholar_url"
                    value={formData.google_scholar_url}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.google_scholar_url}
                    helperText={errors.google_scholar_url}
                />
            </MDBox>
            <MDBox mb={2}>
                <MDInput
                    type="text"
                    label="Scopus URL"
                    name="scopus_url"
                    value={formData.scopus_url}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.scopus_url}
                    helperText={errors.scopus_url}
                />
            </MDBox>
            <MDBox mb={2}>
                <MDInput
                    type="text"
                    label="ResearchGate URL"
                    name="researchgate_url"
                    value={formData.researchgate_url}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.researchgate_url}
                    helperText={errors.researchgate_url}
                />
            </MDBox>
            <MDBox mb={2}>
                <MDInput
                    type="text"
                    label="LinkedIn URL"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.linkedin_url}
                    helperText={errors.linkedin_url}
                />
            </MDBox>
            <MDBox mb={2}>
                <MDInput
                    multiline
                    rows={4}
                    label="Bio (max 500 characters)"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.bio}
                    helperText={errors.bio}
                />
            </MDBox>
            <MDBox display="flex" justifyContent="space-between">
                <MDButton type="submit" variant="gradient" color="info">
                    Save
                </MDButton>
                <MDButton variant="outlined" color="dark" onClick={onClose}>
                    Cancel
                </MDButton>
            </MDBox>
        </MDBox>
    );
}