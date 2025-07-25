import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Modal from "@mui/material/Modal";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import ProfileForm from "layouts/profile/form/ProfileForm";
import { supabase } from "utils/supabase";
import Icon from "@mui/material/Icon";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        verified: 0,
        scopusIndexed: 0,
        ugcCare: 0,
    });
    const [openModal, setOpenModal] = useState(false);

    // Fetch profile and publications
    const fetchData = async () => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                throw new Error("User not authenticated");
            }

            // Fetch profile
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();
            if (profileError && profileError.code !== "PGRST116") {
                throw new Error(`Error fetching profile: ${profileError.message}`);
            }
            setProfile(profileData || { id: user.id, email: user.email });

            // Fetch publications for stats
            const { data: publications, error: pubError } = await supabase
                .from("publications")
                .select("*")
                .eq("profile_id", user.id);
            if (pubError) {
                throw new Error(`Error fetching publications: ${pubError.message}`);
            }
            const total = publications.length;
            const verified = publications.filter((pub) => pub.verification_status === "verified").length;
            const scopusIndexed = publications.filter((pub) => pub.is_scopus_indexed).length;
            const ugcCare = publications.filter((pub) => pub.is_ugc_care).length;
            setStats({ total, verified, scopusIndexed, ugcCare });
        } catch (err) {
            console.error("Error fetching data:", err.message);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleSubmitSuccess = () => {
        fetchData();
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
                    <Grid item xs={12} md={4}>
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
                            <MDBox mb={2}>
                                <MDTypography variant="body2" color="text">
                                    <strong>Name:</strong> {profile?.name || "Not set"}
                                </MDTypography>
                            </MDBox>
                            <MDBox mb={2}>
                                <MDTypography variant="body2" color="text">
                                    <strong>Email:</strong> {profile?.email || "Not set"}
                                </MDTypography>
                            </MDBox>
                            <MDBox mb={2}>
                                <MDTypography variant="body2" color="text">
                                    <strong>Institution:</strong> {profile?.institution || "Not set"}
                                </MDTypography>
                            </MDBox>
                            <MDBox mb={2}>
                                <MDTypography variant="body2" color="text">
                                    <strong>Department:</strong> {profile?.department || "Not set"}
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
                    <Grid item xs={12} md={4}>
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
                    <Grid item xs={12} md={4}>
                        <MDBox
                            p={3}
                            bgColor="white"
                            borderRadius="lg"
                            shadow="lg"
                            sx={{ height: "100%", minHeight: "400px" }}
                        >
                            <MDTypography variant="h5" color="dark" mb={2}>
                                Research Metrics
                            </MDTypography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <ComplexStatisticsCard
                                        color="dark"
                                        icon="library_books"
                                        title="Total Publications"
                                        count={stats.total}
                                        percentage={{
                                            color: "success",
                                            amount: "+10%",
                                            label: "than last year",
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <ComplexStatisticsCard
                                        icon="verified"
                                        title="Verified Submissions"
                                        count={stats.verified}
                                        percentage={{
                                            color: "success",
                                            amount: "+3%",
                                            label: "than last year",
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <ComplexStatisticsCard
                                        color="info"
                                        icon="school"
                                        title="Scopus Indexed"
                                        count={stats.scopusIndexed}
                                        percentage={{
                                            color: "success",
                                            amount: "+5%",
                                            label: "than last year",
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <ComplexStatisticsCard
                                        color="warning"
                                        icon="verified_user"
                                        title="UGC-CARE Listed"
                                        count={stats.ugcCare}
                                        percentage={{
                                            color: "success",
                                            amount: "+2%",
                                            label: "than last year",
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </MDBox>
                    </Grid>
                </Grid>
            </MDBox>
        </DashboardLayout>
    );
}

export default Profile;