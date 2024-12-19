import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, CircularProgress, Grid, Alert, Box, Fade, AppBar, Toolbar, Button, Card, CardContent } from '@mui/material';
import axios from 'axios';
import './SonarQubeProjectPage.css'; // Import the custom CSS for styles
import IssueCard from './IssueCard';  // Import the IssueCard component
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function SonarQubeProjectPage() {
  const { projectName } = useParams(); // Extract project name from the URL
  const [issues, setIssues] = useState([]); // Store issues
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/sonarqube/issues/${projectName}`);
        setIssues(response.data); // Assuming response contains issues array
        setLoading(false);
      } catch (err) {
        setError('Error fetching project details');
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectName]);

  const handleFixIssue = async (issue) => {
    // Logic to handle fixing the issue
    toast.info('PR creation in progress!!');
    try {
      const url = 'http://localhost:5000/api/fixissue'; // Replace with your API endpoint
      const data = {
        "key": issue.key,
        "component": issue.component,
        "line": issue.line,
        "message": issue.message,
        "repoName": issue.project
      }

      const response = await axios.post(url, data);
      console.log('Response:', response.data);
      toast.success('PR created successfully!!');
      const updatedIssues = issues.map((i) =>
        i.key === issue.key ? { ...i, pr: response.data.prurl } : i
      );

      setIssues(updatedIssues);
    } catch (error) {
      toast.error('Failed to create PR. Please try again!');
    }
    // You can implement the logic for fixing the issue here, such as sending it to an API
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
        <Container maxWidth="lg">
          <Box sx={{ marginBottom: 4 }}>
            <Fade in={true} timeout={1000}>
              <Typography
                variant="h3"
                gutterBottom
                sx={{ fontWeight: 'bold', textAlign: 'center', letterSpacing: '1px' }}
              >
                Project Issue Tracker: {projectName}
              </Typography>
            </Fade>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
              <CircularProgress size={60} color="primary" />
            </Box>
          ) : error ? (
            <Fade in={true} timeout={1500}>
              <Alert severity="error" sx={{ marginTop: 2 }}>
                {error}
              </Alert>
            </Fade>
          ) : issues.length === 0 ? (
            <Fade in={true} timeout={1500}>
              <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                {/* No Issues Found Card */}
                <Card sx={{ maxWidth: 500, textAlign: 'center', boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                      No Issues Found for this Project
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                      Your code is clean and free from any issues.
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      href="/add-project"
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
            <Grid container spacing={3}>
              {issues.map((issue) => (
                <Grid item xs={12} sm={6} md={4} key={issue.key}>
                  <Fade in={true} timeout={2000}>
                    <Box>
                      <IssueCard issue={issue} onFixIssue={handleFixIssue} />
                    </Box>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          )}
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

export default SonarQubeProjectPage;
