import { useState } from "react";
import { supabase } from "utils/supabase";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

export default function PublicationForm({ onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    publication_type: "",
    publication_name: "",
    issn_isbn: "",
    publication_year: "",
    doi_link: "",
    document_url: "",
    is_scopus_indexed: false,
    is_ugc_care: false,
    verification_status: "pending",
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    } else {
      setFile(null);
      setError("Please select a valid PDF file.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError("");

    try {
      // Verify authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated. Please sign in again.");
      }
      console.log("Authenticated user ID:", user.id);

      let documentUrl = formData.document_url;

      // Upload PDF to Supabase Storage if a file is selected
      if (file) {
        // Use user ID as folder, append timestamp and sanitized filename
        const fileName = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        console.log("Uploading file:", fileName, "Size:", file.size, "Type:", file.type);

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from("publication-documents")
          .upload(fileName, file, {
            upsert: false,
            metadata: { owner: user.id },
          });

        if (uploadError) {
          console.error("Upload error details:", uploadError);
          throw new Error(`Error uploading PDF: ${uploadError.message}`);
        }
        console.log("Upload successful:", uploadData);

        // Get the public URL for the uploaded file
        const { data: urlData } = supabase.storage
          .from("publication-documents")
          .getPublicUrl(fileName);
        if (!urlData?.publicUrl) {
          throw new Error("Failed to retrieve public URL for uploaded file");
        }
        documentUrl = urlData.publicUrl;
        console.log("Public file URL:", documentUrl);
      }

      // Insert publication data into Supabase
      const publicationData = {
        ...formData,
        profile_id: user.id,
        publication_year: formData.publication_year ? parseInt(formData.publication_year) : null,
        document_url: documentUrl,
      };
      console.log("Inserting publication data:", publicationData);

      const { error: insertError } = await supabase.from("publications").insert(publicationData);

      if (insertError) {
        throw new Error(`Error adding publication: ${insertError.message}`);
      }

      console.log("Publication added successfully");
      alert("Publication added successfully!");
      setFormData({
        title: "",
        publication_type: "",
        publication_name: "",
        issn_isbn: "",
        publication_year: "",
        doi_link: "",
        document_url: "",
        is_scopus_indexed: false,
        is_ugc_care: false,
        verification_status: "pending",
      });
      setFile(null);
      onClose();
    } catch (error) {
      console.error("Submission error:", error.message);
      setError(error.message);
    } finally {
      setUploading(false);
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
        Add New Publication
      </MDTypography>
      {error && (
        <MDTypography variant="body2" color="error" mb={2}>
          {error}
        </MDTypography>
      )}
      <MDBox mb={2}>
        <MDInput
          type="text"
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          fullWidth
          required
        />
      </MDBox>
      <MDBox mb={2}>
        <FormControl fullWidth>
          <MDTypography variant="button" color="text" sx={{ mb: 0.5 }}>
            Publication Type
          </MDTypography>
          <Select
            name="publication_type"
            value={formData.publication_type}
            onChange={handleChange}
            required
            sx={{ height: "44px" }}
          >
            <MenuItem value="Journal Paper">Journal Paper</MenuItem>
            <MenuItem value="Conference Paper">Conference Paper</MenuItem>
            <MenuItem value="Patent">Patent</MenuItem>
            <MenuItem value="Book Chapter">Book Chapter</MenuItem>
          </Select>
        </FormControl>
      </MDBox>
      <MDBox mb={2}>
        <MDInput
          type="text"
          label="Publication Name"
          name="publication_name"
          value={formData.publication_name}
          onChange={handleChange}
          fullWidth
        />
      </MDBox>
      <MDBox mb={2}>
        <MDInput
          type="text"
          label="ISSN/ISBN"
          name="issn_isbn"
          value={formData.issn_isbn}
          onChange={handleChange}
          fullWidth
        />
      </MDBox>
      <MDBox mb={2}>
        <MDInput
          type="number"
          label="Publication Year"
          name="publication_year"
          value={formData.publication_year}
          onChange={handleChange}
          fullWidth
        />
      </MDBox>
      <MDBox mb={2}>
        <MDInput
          type="text"
          label="DOI Link"
          name="doi_link"
          value={formData.doi_link}
          onChange={handleChange}
          fullWidth
        />
      </MDBox>
      <MDBox mb={2}>
        <FormControl fullWidth>
          <InputLabel
            shrink
            sx={{
              fontSize: "0.875rem",
              fontWeight: 400,
              color: "#344767",
              transform: "translate(0, -4px) scale(0.75)",
              transformOrigin: "top left",
              "&.Mui-focused": {
                color: "#3c8039",
              },
            }}
          >
            Upload PDF
          </InputLabel>
          <MDBox
            sx={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #d2d6da",
              borderRadius: "4px",
              padding: "8px",
              backgroundColor: "#ffffff",
              "&:hover": {
                borderColor: "#3c8039",
              },
              mt: 2,
            }}
          >
            <input
              type="file"
              name="pdf"
              accept="application/pdf"
              onChange={handleFileChange}
              style={{
                flex: 1,
                padding: "8px",
                fontSize: "0.875rem",
                border: "none",
                outline: "none",
                background: "transparent",
              }}
            />
            {file && (
              <MDTypography variant="caption" color="text">
                {file.name}
              </MDTypography>
            )}
          </MDBox>
        </FormControl>
      </MDBox>
      <MDBox mb={2}>
        <FormControlLabel
          control={
            <Checkbox
              name="is_scopus_indexed"
              checked={formData.is_scopus_indexed}
              onChange={handleChange}
            />
          }
          label="Scopus Indexed"
        />
      </MDBox>
      <MDBox mb={2}>
        <FormControlLabel
          control={
            <Checkbox
              name="is_ugc_care"
              checked={formData.is_ugc_care}
              onChange={handleChange}
            />
          }
          label="UGC-CARE Listed"
        />
      </MDBox>
      <MDBox display="flex" justifyContent="space-between">
        <MDButton
          type="submit"
          variant="gradient"
          color="info"
          disabled={uploading}
        >
          {uploading ? "Submitting..." : "Submit"}
        </MDButton>
        <MDButton variant="outlined" color="dark" onClick={onClose}>
          Cancel
        </MDButton>
      </MDBox>
    </MDBox>
  );
}