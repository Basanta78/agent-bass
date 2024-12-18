import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, CircularProgress, Grid, Alert } from '@mui/material';
import axios from 'axios';
import IssueCard from './IssueCard';  // Import the IssueCard component

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

  const handleFixIssue = (issue) => {
    // Logic to handle fixing the issue
    console.log(`Fixing issue: ${issue.message}`);
    // You can implement the logic for fixing the issue here, such as sending it to an API
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        SonarQube Project: {projectName}
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={3}>
          {issues.map((issue) => (
            <Grid item xs={12} sm={6} md={4} key={issue.key}>
              <IssueCard issue={issue} onFixIssue={handleFixIssue} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default SonarQubeProjectPage;
