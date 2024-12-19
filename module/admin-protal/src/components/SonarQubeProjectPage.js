import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, CircularProgress, Grid, Alert } from '@mui/material';
import axios from 'axios';
import IssueCard from './IssueCard';  // Import the IssueCard component
import { ToastContainer, toast } from 'react-toastify';
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
    <Container>
      <ToastContainer position="top-right" autoClose={3000} />
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
