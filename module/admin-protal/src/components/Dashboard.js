import React, { useState } from 'react';
import {
    Button,
    CircularProgress,
    Alert,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Fade,
    Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
    const [repoUrl, setRepoUrl] = useState('');
    const [accessLevel, setAccessLevel] = useState('read');
    const [processing, setProcessing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [responseMessage, setResponseMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [backendData, setBackendData] = useState(null);
    const navigate = useNavigate();

    const handleRepoSubmit = async () => {
        setProcessing(true);
        setSuccessMessage(null);
        setResponseMessage(null);
        setIsGenerating(true);

        try {
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

            const result = await response.json();

            if (response.ok) {
                const { message, projectDetails, data } = result;

                setResponseMessage(message || 'SonarQube project created successfully!');
                setSuccessMessage(projectDetails || 'Project details not available');
                setBackendData(data);
            } else {
                throw new Error(result.message || 'Error generating SonarQube project.');
            }
        } catch (err) {
            setResponseMessage('There was an issue processing your request.');
        } finally {
            setIsGenerating(false);
            setProcessing(false);
            setTimeout(() => {
                navigate('/');
            }, 2000);
        }
    };

    return (
        <Box className="dashboard-root">
            {/* Enhanced Header */}
            <Fade in={true} timeout={1000}>
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 4,
                        background: 'linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)',
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                        borderRadius: '8px',
                        mb: 4,
                        position: 'relative', // For absolute positioning of the button
                    }}
                >
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 'bold',
                            fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' },
                            color: 'white',
                            letterSpacing: '1.5px',
                            textShadow: '2px 2px 6px rgba(0, 0, 0, 0.3)',
                        }}
                    >
                        Add New GitHub Repository
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            mt: 1,
                            fontSize: { xs: '1rem', sm: '1.2rem' },
                        }}
                    >
                        Seamlessly integrate your GitHub repositories into SonarQube for better code quality.
                    </Typography>
                    {/* Go to Home Button */}
                    <Button
                        variant="outlined"
                        sx={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            color: 'white',
                            borderColor: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                borderColor: 'white',
                            },
                        }}
                        onClick={() => navigate('/')}
                    >
                        Go to Home
                    </Button>
                </Box>
            </Fade>

            {/* Form Section */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 'calc(100vh - 300px)', // Adjust for header and footer
                }}
            >
                <Box className="form-container" sx={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
                    <Fade in={true} timeout={1500}>
                        <div className="input-field-container">
                            <TextField
                                label="GitHub Repository URL"
                                variant="outlined"
                                fullWidth
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                placeholder="Enter GitHub Repo URL"
                                className="input-field"
                                sx={{ mb: 3 }}
                            />
                        </div>
                    </Fade>

                    <Fade in={true} timeout={2000}>
                        <FormControl fullWidth sx={{ mb: 3 }} className="input-field">
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
                    </Fade>

                    <Fade in={true} timeout={2500}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleRepoSubmit}
                            disabled={processing || !repoUrl || isGenerating}
                            className="submit-button"
                            sx={{
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem',
                                textTransform: 'none',
                                fontWeight: 'bold',
                            }}
                        >
                            {isGenerating ? (
                                <>
                                    <CircularProgress size={24} sx={{ color: 'white', mr: 2 }} />
                                    Creating SonarQube Project...
                                </>
                            ) : (
                                'Generate SonarQube Project'
                            )}
                        </Button>
                    </Fade>

                    {/* Response Messages */}
                    {responseMessage && (
                        <Fade in={true} timeout={3000}>
                            <Alert severity={responseMessage.includes('Error') ? 'error' : 'success'} className="response-message" sx={{ mt: 3 }}>
                                {responseMessage}
                            </Alert>
                        </Fade>
                    )}

                    {successMessage && (
                        <Fade in={true} timeout={3500}>
                            <Alert severity="info" className="project-details" sx={{ mt: 3 }}>
                                Project Details: {JSON.stringify(successMessage)}
                            </Alert>
                        </Fade>
                    )}

                    {backendData && (
                        <Fade in={true} timeout={4000}>
                            <Alert severity="info" className="backend-data" sx={{ mt: 3 }}>
                                Backend Data: {JSON.stringify(backendData)}
                            </Alert>
                        </Fade>
                    )}
                </Box>
            </Box>

            {/* Fixed Footer */}
            <Box className="fixed-footer">
                <Fade in={true} timeout={3000}>
                    <Box textAlign="center" sx={{ py: 3, backgroundColor: '#f5f5f5' }}>
                        <Typography variant="h5" color="textPrimary" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Team
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                        Building smarter tools—this Bug Fix Agent simplifies debugging for effortless development.
                        </Typography>
                        <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
                            <Typography variant="body2" color="primary">
                                Contributor 1: Basanta Maharjan
                            </Typography>
                            <Typography variant="body2" color="primary">
                                Contributor 2: Amrita
                            </Typography>
                            <Typography variant="body2" color="primary">
                                Contributor 3: Susan Koju
                            </Typography>
                            <Typography variant="body2" color="primary">
                                Contributor 4: Samir Shrestha
                            </Typography>
                        </Box>
                    </Box>
                </Fade>
            </Box>
        </Box>
    );
}

export default Dashboard;
