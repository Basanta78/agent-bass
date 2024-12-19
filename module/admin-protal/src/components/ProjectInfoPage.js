import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Box, CircularProgress, Alert, Fade, AppBar, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProjectInfoPage.css'; // Ensure you style for this layout

function ProjectInfoPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/projects'); // Adjust your endpoint
        setProjects(response.data.projects || []);
        setLoading(false);
      } catch (err) {
        setError('Error fetching projects. Please try again.');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleViewIssuesClick = (projectName) => {
    navigate(`/sonarqube-project/${projectName}`);
  };

  const handleAddProjectClick = () => {
    navigate('/add-project');
  };

  return (
    <Box className="root-container">
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: '#1976d2', mb: 2 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Bug Fix Agent Dashboard
          </Typography>
          <Button color="inherit" href="/">
            Home
          </Button>
          <Button color="inherit" href="/add-project">
            Add Repository
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box className="scrollable-content">
        <Container maxWidth="lg" sx={{ marginTop: 5 }}>
          <Fade in={true} timeout={1000}>
            <Typography
              variant="h3"
              align="center"
              color="primary"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                fontSize: '3rem',
                letterSpacing: 1.5,
                textShadow: '3px 3px 10px rgba(0, 0, 0, 0.2)',
                background: 'linear-gradient(90deg, rgba(33,150,243,1) 0%, rgba(0,184,255,1) 100%)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                marginTop: '50px',
              }}
            >
              Projects Dashboard
            </Typography>
          </Fade>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Fade in={true} timeout={1500}>
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            </Fade>
          ) : projects.length === 0 ? (
            <Fade in={true} timeout={1500}>
              <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                {/* No Projects Found Card */}
                <Card sx={{ maxWidth: 500, textAlign: 'center', boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                      No Projects Found
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                      It seems like you haven't added any projects yet. Start by adding a new project.
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      onClick={handleAddProjectClick}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontWeight: 'bold',
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: '#1976d2',
                          color: 'white',
                        },
                      }}
                    >
                      Add New Project
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          ) : (
            <Grid container spacing={3} justifyContent="center">
              {projects.map((project) => (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                  <Fade in={true} timeout={2000}>
                    <Card variant="outlined" sx={{ textAlign: 'center', height: '100%', boxShadow: 3, borderRadius: 2 }}>
                      <CardContent sx={{ background: '#FFFFFF', padding: 3 }}>
                        <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                          {project.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          {project.description || 'This project is a part of our SonarQube system, designed to ensure code quality and maintainability with ease.'}
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={() => handleViewIssuesClick(project.name)}
                          sx={{
                            '&:hover': {
                              backgroundColor: '#1976D2',
                              boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)',
                            },
                            fontWeight: 'bold',
                            padding: '10px 0',
                            transition: 'all 0.3s ease-in-out',
                          }}
                        >
                          View Project Issues
                        </Button>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Add Project Button */}
          <Fade in={true} timeout={2500}>
            <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleAddProjectClick}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 3,
                  borderColor: '#2196F3',
                  color: '#2196F3',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#2196F3',
                    color: 'white',
                    borderColor: '#2196F3',
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                Add New Project
              </Button>
            </Box>
          </Fade>
        </Container>
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

export default ProjectInfoPage;
