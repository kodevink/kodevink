import { useEffect, useState, useRef } from "react";
import Grid from "@mui/material/Grid";
import Modal from "@mui/material/Modal";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ProfileForm from "layouts/profile/form/ProfileForm";
import { supabase } from "utils/supabase";
import Icon from "@mui/material/Icon";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);

    // Fetch profile with department and college details
    const fetchData = async () => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                throw new Error("User not authenticated");
            }

            // Fetch profile with joined department and college
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select(`
          *,
          department:departments (
            dname,
            college:colleges (
              college_name
            )
          )
        `)
                .eq("id", user.id)
                .single();

            if (profileError && profileError.code !== "PGRST116") {
                throw new Error(`Error fetching profile: ${profileError.message}`);
            }
            console.log("Fetching Profile data:", profileData);
            // Merge user.email with profileData
            setProfile(profileData ? { ...profileData, email: user.email } : { id: user.id, email: user.email });
        } catch (err) {
            console.error("Error fetching data:", err.message);
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = () => {
        console.log("Opening Edit Profile modal");
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        console.log("Closing Edit Profile modal");
        setOpenModal(false);
    };

    const handleSubmitSuccess = () => {
        console.log("Profile updated successfully, refreshing data");
        fetchData();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            console.log("No file selected");
            return;
        }

        // Validate file type and size
        const validTypes = ["image/jpeg", "image/png"];
        if (!validTypes.includes(file.type)) {
            console.error("Invalid file type:", file.type);
            setError("Please upload a JPG or PNG file.");
            return;
        }
        if (file.size > 1 * 1024 * 1024) {
            console.error("File size exceeds 1MB:", file.size);
            setError("File size must be less than 1MB.");
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error("User not authenticated");
            }

            // Generate unique filename
            const fileExt = file.name.split(".").pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            console.log("Uploading profile picture:", fileName);

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from("profiles")
                .upload(fileName, file, {
                    cacheControl: "3600",
                    upsert: true,
                });
            if (uploadError) {
                throw new Error(`Error uploading profile picture: ${uploadError.message}`);
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from("profiles")
                .getPublicUrl(fileName);
            if (!urlData?.publicUrl) {
                throw new Error("Failed to retrieve public URL");
            }
            console.log("Profile picture uploaded, public URL:", urlData.publicUrl);

            // Update profile with new URL
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ profile_picture_url: urlData.publicUrl })
                .eq("id", user.id);
            if (updateError) {
                throw new Error(`Error updating profile: ${updateError.message}`);
            }

            // Refresh profile data
            await fetchData();
            setError("");
            alert("Profile picture updated successfully!");
        } catch (err) {
            console.error("Error handling file upload:", err.message);
            setError(err.message);
        }
    };

    const triggerFileInput = () => {
        console.log("Triggering file input click");
        fileInputRef.current.click();
    };

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox py={3}>
                <MDBox mb={3} display="flex" justifyContent="flex-end">
                    <MDButton variant="gradient" color="info" onClick={handleOpenModal}>
                        Edit Profile
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
                        backgroundColor: "rgba(0, 0,0, 0.6)",
                    }}
                >
                    <ProfileForm
                        profile={profile}
                        onClose={handleCloseModal}
                        onSuccess={handleSubmitSuccess}
                    />
                </Modal>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <MDBox
                            p={3}
                            bgColor="white"
                            borderRadius="lg"
                            shadow="lg"
                            sx={{ height: "100%", minHeight: "400px" }}
                        >
                            <MDTypography variant="h5" color="dark" mb={2}>
                                Profile Details
                            </MDTypography>
                            <MDBox mb={2} display="flex" justifyContent="center">
                                <img
                                    src={profile?.profile_picture_url || "https://static.vecteezy.com/system/resources/previews/026/175/089/non_2x/professor-avatar-round-flat-icon-vector.jpg"}
                                    alt="Profile"
                                    style={{
                                        width: "150px",
                                        height: "150px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        marginBottom: "16px",
                                    }}
                                />
                            </MDBox>
                            <MDBox mb={2} display="flex" justifyContent="center">
                                <MDButton
                                    variant="outlined"
                                    color="info"
                                    size="small"
                                    onClick={triggerFileInput}
                                >
                                    Upload Profile Picture
                                </MDButton>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png"
                                    style={{ display: "none" }}
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />
                            </MDBox>
                            {error && (
                                <MDBox mb={2}>
                                    <MDTypography variant="body2" color="error">
                                        {error}
                                    </MDTypography>
                                </MDBox>
                            )}
                            <MDBox mb={2}>
                                <MDTypography variant="body2" color="text">
                                    <strong>Email:</strong> {profile?.email || "Not set"}
                                </MDTypography>
                            </MDBox>
                            <MDBox mb={2}>
                                <MDTypography variant="body2" color="text">
                                    <strong>Name:</strong> {profile?.full_name || "Not set"}
                                </MDTypography>
                            </MDBox>
                            <MDBox mb={2}>
                                <MDTypography variant="body2" color="text">
                                    <strong>College Name:</strong> {profile?.department?.college?.college_name || "Not set"}
                                </MDTypography>
                            </MDBox>
                            <MDBox mb={2}>
                                <MDTypography variant="body2" color="text">
                                    <strong>Department Name:</strong> {profile?.department?.dname || "Not set"}
                                </MDTypography>
                            </MDBox>
                            <MDBox mb={2}>
                                <MDTypography variant="body2" color="text">
                                    <strong>ORCID ID:</strong> {profile?.orcid_id || "Not set"}
                                </MDTypography>
                            </MDBox>
                            <MDBox mb={2}>
                                <MDTypography variant="body2" color="text">
                                    <strong>Bio:</strong> {profile?.bio || "Not set"}
                                </MDTypography>
                            </MDBox>
                        </MDBox>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <MDBox
                            p={3}
                            bgColor="white"
                            borderRadius="lg"
                            shadow="lg"
                            sx={{ height: "100%", minHeight: "400px" }}
                        >
                            <MDTypography variant="h5" color="dark" mb={2}>
                                Academic Profiles
                            </MDTypography>
                            <MDBox mb={2} display="flex" alignItems="center">
                                <Icon color="info" sx={{ mr: 1 }}>school</Icon>
                                <MDTypography
                                    variant="body2"
                                    color="info"
                                    component="a"
                                    href={profile?.google_scholar_url || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Google Scholar
                                </MDTypography>
                            </MDBox>
                            <MDBox mb={2} display="flex" alignItems="center">
                                <Icon color="info" sx={{ mr: 1 }}>article</Icon>
                                <MDTypography
                                    variant="body2"
                                    color="info"
                                    component="a"
                                    href={profile?.scopus_url || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Scopus
                                </MDTypography>
                            </MDBox>
                            <MDBox mb={2} display="flex" alignItems="center">
                                <Icon color="info" sx={{ mr: 1 }}>groups</Icon>
                                <MDTypography
                                    variant="body2"
                                    color="info"
                                    component="a"
                                    href={profile?.researchgate_url || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    ResearchGate
                                </MDTypography>
                            </MDBox>
                            <MDBox mb={2} display="flex" alignItems="center">
                                <Icon color="info" sx={{ mr: 1 }}>linkedin</Icon>
                                <MDTypography
                                    variant="body2"
                                    color="info"
                                    component="a"
                                    href={profile?.linkedin_url || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    LinkedIn
                                </MDTypography>
                            </MDBox>
                        </MDBox>
                    </Grid>
                </Grid>
            </MDBox>
        </DashboardLayout>
    );
}

export default Profile;