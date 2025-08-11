import { useState, useEffect } from "react";
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

export default function PublicationForm({ onClose, onSubmitSuccess, editPublication }) {
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
  const [existingFileUrl, setExistingFileUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  console.log("PublicationForm rendering with props:", { editPublication, formData });

  useEffect(() => {
    console.log("PublicationForm useEffect - editPublication:", editPublication);
    try {
      if (editPublication && typeof editPublication === "object" && editPublication !== null) {
        const prefilledData = {
          title: editPublication.title ?? "",
          publication_type: editPublication.publication_type ?? "",
          publication_name: editPublication.publication_name ?? "",
          issn_isbn: editPublication.issn_isbn ?? "",
          publication_year: editPublication.publication_year ? String(editPublication.publication_year) : "",
          doi_link: editPublication.doi_link ?? "",
          document_url: editPublication.document_url ?? "",
          is_scopus_indexed: !!editPublication.is_scopus_indexed,
          is_ugc_care: !!editPublication.is_ugc_care,
          verification_status: editPublication.verification_status ?? "pending",
        };
        console.log("Setting formData to:", prefilledData);
        setFormData(prefilledData);
        setExistingFileUrl(editPublication.document_url ?? "");
      } else {
        console.log("No valid editPublication, resetting formData");
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
        setExistingFileUrl("");
      }
    } catch (error) {
      console.error("Error in PublicationForm useEffect:", error);
    }
  }, [editPublication]);

  // Minimal render to isolate TypeError
  if (!formData) {
    console.error("formData is undefined");
    return (
      <MDBox p={3} sx={{ backgroundColor: "#ffffff", borderRadius: "12px" }}>
        <MDTypography variant="h6">Error: Form data not initialized</MDTypography>
        <MDButton onClick={onClose}>Cancel</MDButton>
      </MDBox>
    );
  }

  const validateForm = () => {
    const newErrors = {};
    const currentYear = new Date().getFullYear();

    if (!formData.title?.trim()) newErrors.title = "Title is required";
    if (!formData.publication_type) newErrors.publication_type = "Publication type is required";
    if (!formData.publication_year) {
      newErrors.publication_year = "Publication year is required";
    } else if (
      !Number.isInteger(Number(formData.publication_year)) ||
      Number(formData.publication_year) < 1900 ||
      Number(formData.publication_year) > currentYear
    ) {
      newErrors.publication_year = `Year must be between 1900 and ${currentYear}`;
    }

    switch (formData.publication_type) {
      case "Journal Paper":
        if (!formData.publication_name?.trim()) newErrors.publication_name = "Journal name is required";
        if (!formData.issn_isbn?.trim()) newErrors.issn_isbn = "ISSN is required";
        break;
      case "Conference Paper":
        if (!formData.publication_name?.trim()) newErrors.publication_name = "Conference name is required";
        if (!formData.doi_link?.trim()) newErrors.doi_link = "DOI link is required";
        break;
      case "Patent":
        if (!formData.issn_isbn?.trim()) newErrors.issn_isbn = "Patent number is required";
        if (!formData.doi_link?.trim()) newErrors.doi_link = "DOI or registration link is required";
        break;
      case "Book Chapter":
        if (!formData.publication_name?.trim()) newErrors.publication_name = "Book title is required";
        if (!formData.issn_isbn?.trim()) newErrors.issn_isbn = "ISBN is required";
        break;
      default:
        break;
    }

    if (formData.doi_link && !/^https?:\/\/.+/i.test(formData.doi_link)) {
      newErrors.doi_link = "Invalid DOI URL";
    }

    if (file && file.type !== "application/pdf") {
      newErrors.pdf = "Please select a valid PDF file";
    }
    if (file && file.size > 10 * 1024 * 1024) {
      newErrors.pdf = "File size exceeds 10MB limit";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log("handleChange:", { name, value, type, checked });
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log("handleFileChange:", { selectedFile });
    if (selectedFile) {
      if (selectedFile.type === "application/pdf" && selectedFile.size <= 10 * 1024 * 1024) {
        setFile(selectedFile);
        setErrors((prev) => ({ ...prev, pdf: null }));
      } else {
        setFile(null);
        setErrors((prev) => ({
          ...prev,
          pdf: selectedFile.type !== "application/pdf"
            ? "Please select a valid PDF file"
            : "File size exceeds 10MB limit",
        }));
      }
    } else {
      setFile(null);
      setErrors((prev) => ({ ...prev, pdf: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit called with formData:", formData);
    if (!validateForm()) {
      return;
    }

    setUploading(true);

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

      // Prepare publication data
      const publicationData = {
        ...formData,
        profile_id: user.id,
        publication_year: formData.publication_year ? parseInt(formData.publication_year) : null,
        document_url: documentUrl,
      };
      console.log("Submitting publication data:", publicationData);

      let error;
      if (editPublication && typeof editPublication === "object" && editPublication.id) {
        console.log("Updating publication with data:", publicationData);
        ({ error } = await supabase
          .from("publications")
          .update(publicationData)
          .eq("id", editPublication.id));
      } else {
        console.log("Inserting publication with data:", publicationData);
        ({ error } = await supabase.from("publications").insert(publicationData));
      }

      if (error) {
        throw new Error(`Error ${editPublication ? "updating" : "adding"} publication: ${error.message}`);
      }

      console.log("Publication added/updated successfully");
      alert(`Publication ${editPublication ? "updated" : "added"} successfully`);
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
      setExistingFileUrl("");
      setErrors({});
      onClose();
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error) {
      console.error("Submission error:", error.message);
      setErrors({ submit: error.message });
    } finally {
      setUploading(false);
    }
  };

  console.log("Rendering form elements with formData:", formData, "errors:", errors);

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
      {console.log("Rendering MDBox container")}
      <MDTypography variant="h6" mb={2} color="dark">
        {editPublication && editPublication?.id ? "Edit Publication" : "Add New Publication"}
      </MDTypography>
      {console.log("Rendering submit error", { submitError: errors.submit })}
      {errors.submit && (
        <MDTypography variant="body2" color="error" mb={2}>
          {errors.submit}
        </MDTypography>
      )}
      {console.log("Rendering title input")}
      <MDBox mb={2}>
        <MDInput
          type="text"
          label="Title"
          name="title"
          value={formData.title ?? ""}
          onChange={handleChange}
          fullWidth
          required
          error={!!errors.title}
          helperText={errors.title}
        />
      </MDBox>
      {console.log("Rendering publication type select")}
      <MDBox mb={2}>
        <FormControl fullWidth error={!!errors.publication_type}>
          <MDTypography variant="button" color="text" sx={{ mb: 0.5 }}>
            Publication Type
          </MDTypography>
          <Select
            name="publication_type"
            value={formData.publication_type ?? ""}
            onChange={handleChange}
            required
            sx={{ height: "44px" }}
            displayEmpty
          >
            <MenuItem value="">Select Type</MenuItem>
            <MenuItem value="Journal Paper">Journal Paper</MenuItem>
            <MenuItem value="Conference Paper">Conference Paper</MenuItem>
            <MenuItem value="Patent">Patent</MenuItem>
            <MenuItem value="Book Chapter">Book Chapter</MenuItem>
          </Select>
          {errors.publication_type && (
            <MDTypography variant="caption" color="error">
              {errors.publication_type}
            </MDTypography>
          )}
        </FormControl>
      </MDBox>
      {console.log("Rendering publication name input")}
      <MDBox mb={2}>
        <MDInput
          type="text"
          label="Publication Name"
          name="publication_name"
          value={formData.publication_name ?? ""}
          onChange={handleChange}
          fullWidth
          required={["Journal Paper", "Conference Paper", "Book Chapter"].includes(formData.publication_type)}
          error={!!errors.publication_name}
          helperText={errors.publication_name}
        />
      </MDBox>
      {console.log("Rendering ISSN/ISBN input")}
      <MDBox mb={2}>
        <MDInput
          type="text"
          label="ISSN/ISBN/Patent Number"
          name="issn_isbn"
          value={formData.issn_isbn ?? ""}
          onChange={handleChange}
          fullWidth
          required={["Journal Paper", "Patent", "Book Chapter"].includes(formData.publication_type)}
          error={!!errors.issn_isbn}
          helperText={errors.issn_isbn}
        />
      </MDBox>
      {console.log("Rendering publication year input")}
      <MDBox mb={2}>
        <MDInput
          type="number"
          label="Publication Year"
          name="publication_year"
          value={formData.publication_year ?? ""}
          onChange={handleChange}
          fullWidth
          required
          error={!!errors.publication_year}
          helperText={errors.publication_year}
        />
      </MDBox>
      {console.log("Rendering DOI link input")}
      <MDBox mb={2}>
        <MDInput
          type="text"
          label="DOI Link"
          name="doi_link"
          value={formData.doi_link ?? ""}
          onChange={handleChange}
          fullWidth
          required={["Conference Paper", "Patent"].includes(formData.publication_type)}
          error={!!errors.doi_link}
          helperText={errors.doi_link}
        />
      </MDBox>
      {console.log("Rendering file upload input")}
      <MDBox mb={2}>
        <FormControl fullWidth error={!!errors.pdf}>
          <InputLabel
            shrink
            sx={{
              fontSize: "0.875rem",
              fontWeight: 400,
              color: "#344767",
              transform: "translate(0, -9px) scale(0.75)",
              transformOrigin: "top left",
              "&.Mui-focused": { color: "#3c8039" },
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
              "&:hover": { borderColor: "#3c8039" },
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
              <MDTypography
                variant="caption"
                color="text"
                sx={{ maxWidth: "200px", textOverflow: "ellipsis", overflow: "hidden" }}
              >
                {file.name}
              </MDTypography>
            )}
          </MDBox>
          {existingFileUrl && !file && (
            <MDTypography variant="caption" color="info" mt={1}>
              Current: <a href={existingFileUrl} target="_blank" rel="noopener noreferrer">View PDF</a>
            </MDTypography>
          )}
          {errors.pdf && (
            <MDTypography variant="caption" color="error">
              {errors.pdf}
            </MDTypography>
          )}
        </FormControl>
      </MDBox>
      {console.log("Rendering Scopus Indexed checkbox")}
      <MDBox mb={2}>
        <FormControlLabel
          control={
            <Checkbox
              name="is_scopus_indexed"
              checked={formData.is_scopus_indexed ?? false}
              onChange={handleChange}
            />
          }
          label="Scopus Indexed"
        />
      </MDBox>
      {console.log("Rendering UGC-CARE checkbox")}
      <MDBox mb={2}>
        <FormControlLabel
          control={
            <Checkbox
              name="is_ugc_care"
              checked={formData.is_ugc_care ?? false}
              onChange={handleChange}
            />
          }
          label="UGC-CARE Listed"
        />
      </MDBox>
      {console.log("Rendering submit and cancel buttons")}
      <MDBox display="flex" justifyContent="space-between">
        <MDButton type="submit" variant="gradient" color="info" disabled={uploading}>
          {uploading ? "Submitting..." : editPublication && editPublication?.id ? "Update" : "Submit"}
        </MDButton>
        <MDButton variant="outlined" color="dark" onClick={onClose}>
          Cancel
        </MDButton>
      </MDBox>
    </MDBox>
  );
}