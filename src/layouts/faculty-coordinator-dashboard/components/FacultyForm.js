import { useState } from "react";
import { Box, TextField, Button } from "@mui/material";

function FacultyForm({ onClose, onSubmit, newFaculty, setNewFaculty }) {
    const handleChange = (e) => {
        setNewFaculty({ ...newFaculty, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
    };

    return (
        <Box sx={{ p: 3, bgcolor: "white", borderRadius: 2, width: "400px" }}>
            <h2 className="text-xl font-bold mb-4">Add New Faculty</h2>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={newFaculty.name}
                    onChange={handleChange}
                    required
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={newFaculty.email}
                    onChange={handleChange}
                    required
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Department"
                    name="department"
                    value={newFaculty.department}
                    onChange={handleChange}
                    required
                    margin="normal"
                />
                <Box mt={2}>
                    <Button variant="contained" color="primary" type="submit">
                        Add
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={onClose} sx={{ ml: 2 }}>
                        Cancel
                    </Button>
                </Box>
            </form>
        </Box>
    );
}

export default FacultyForm;