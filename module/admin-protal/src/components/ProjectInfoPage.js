import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Box, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
    <Container>
      <Typography variant="h4" align="center" color="primary" gutterBottom>
        SonarQube Projects Dashboard
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : projects.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No projects found. Start by adding a new project.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card variant="outlined" sx={{ textAlign: 'center', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {project.description || 'No description available.'}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => handleViewIssuesClick(project.name)}
                  >
                    View Project Issues
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Project Button */}
      <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleAddProjectClick}
          sx={{ px: 3, py: 1 }}
        >
          Add New Project
        </Button>
      </Box>
    </Container>
  );
}

export default ProjectInfoPage;
