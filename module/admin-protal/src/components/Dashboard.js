import React, { useState } from 'react';
import { Button, CircularProgress, Alert, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [repoUrl, setRepoUrl] = useState('');
    const [accessLevel, setAccessLevel] = useState('read');
    const [processing, setProcessing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false); // To track if the project is being generated
    const [responseMessage, setResponseMessage] = useState(null); // To store backend response message
    const [successMessage, setSuccessMessage] = useState(null); // Success message from project creation
    const [backendData, setBackendData] = useState(null); // To store the response data from the backend
    const navigate = useNavigate();

    const handleRepoSubmit = async () => {
        setProcessing(true);
        setSuccessMessage(null);
        setResponseMessage(null); // Clear previous response
        setIsGenerating(true); // Set generating flag to true

        try {
            // Send repo info to the backend to generate the SonarQube project
            const response = await fetch('http://localhost:5000/api/generate-sonarqube-project', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    repoUrl,
                    accessLevel,
                }),
            });

            // Wait for the response to be processed
            const result = await response.json();

            if (response.ok) {
                const { message, projectDetails, data } = result;

                setResponseMessage(message || 'SonarQube project created successfully!');
                setSuccessMessage(projectDetails || 'Project details not available');
                setBackendData(data); // Store the response data
            } else {
                throw new Error(result.message || 'Error generating SonarQube project.');
            }
        } catch (err) {
            setResponseMessage('Your data has been added, and we will fetch all issues shortly.');
        } finally {
            setIsGenerating(false);
            setProcessing(false);

            setTimeout(() => {
                navigate('/');
            }, 2000);
        }
    };

    return (
        <div className="app-container">
            <h2>AGENT_BASS Admin Portal - Dashboard</h2>

            {/* Repo URL and Access Form */}
            <div style={{ marginBottom: '20px' }}>
                <TextField
                    label="GitHub Repository URL"
                    variant="outlined"
                    fullWidth
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="Enter GitHub Repo URL"
                />

                <FormControl fullWidth style={{ marginTop: '10px' }}>
                    <InputLabel>Access Level</InputLabel>
                    <Select
                        value={accessLevel}
                        onChange={(e) => setAccessLevel(e.target.value)}
                        label="Access Level"
                    >
                        <MenuItem value="read">Read</MenuItem>
                        <MenuItem value="write">Write</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                </FormControl>

                {/* Show a loading spinner while the project is being generated */}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleRepoSubmit}
                    disabled={processing || !repoUrl || isGenerating} // Disable while generating or missing URL
                    style={{ marginTop: '20px' }}
                >
                    {isGenerating ? (
                        <>
                            <CircularProgress size={24} style={{ color: 'white', marginRight: '10px' }} />
                            Creating SonarQube Project...
                        </>
                    ) : (
                        'Generate SonarQube Project'
                    )}
                </Button>

                {/* Display the response message from the backend */}
                {responseMessage && <Alert severity={responseMessage.includes('Error') ? 'error' : 'success'} style={{ marginTop: '20px' }}>{responseMessage}</Alert>}

                {/* Optionally, show project details if available */}
                {successMessage && <Alert severity="info" style={{ marginTop: '20px' }}>Project Details: {JSON.stringify(successMessage)}</Alert>}

                {/* Display backend response data */}
                {backendData && <Alert severity="info" style={{ marginTop: '20px' }}>Backend Data: {JSON.stringify(backendData)}</Alert>}
            </div>
        </div>
    );
}

export default Dashboard;
