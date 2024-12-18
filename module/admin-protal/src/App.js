// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Grid, Typography, Container, CircularProgress, Alert } from '@mui/material';
import IssueCard from './components/IssueCard';

function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch issues from backend API
  useEffect(() => {
    fetch('http://localhost:5000/api/sonarqube/issues')
      .then((response) => response.json())
      .then((data) => {
        setIssues(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load issues.');
        setLoading(false);
      });
  }, []);

  const handleFixIssue = (issue) => {
    // Simulate fixing the issue
    console.log('Fixing issue:', issue);
    // Here, you can add an API call or logic to apply the fix to the codebase
  };

  return (
    <Container className="app-container">
      <Typography variant="h4" className="header">
        BASS Admin Portal - Dashboard
      </Typography>

      {/* Display loading spinner or error message */}
      <div className="loading-container">
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && (
          <Grid container spacing={3}>
            {issues.map((issue) => (
              <Grid item xs={12} sm={6} md={4} key={issue.id}>
                <IssueCard issue={issue} onFixIssue={handleFixIssue} />
              </Grid>
            ))}
          </Grid>
        )}
      </div>
    </Container>
  );
}

export default Dashboard;
