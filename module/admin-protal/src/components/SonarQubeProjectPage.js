import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  CircularProgress,
  Grid,
  Alert,
  Box,
  Fade,
  AppBar,
  Toolbar,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import axios from 'axios';
import './SonarQubeProjectPage.css';
import IssueCard from './IssueCard';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SonarQubeProjectPage() {
  const { projectName } = useParams();
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL'); 
  const [processingIssues, setProcessingIssues] = useState({});
  const [fetchingIssues, setFetchingIssues] = useState(true); // New state for "Fetching Issues"

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setFetchingIssues(true); // Set fetching state to true

        // Simulate a delay (2 seconds) for fetching issues
        const response = await axios.get(`http://localhost:5000/api/sonarqube/issues/${projectName}`);
        
        // Simulating a delay before setting the issues
        setTimeout(() => {
          const issuesWithFixStatus = response.data.map((issue) => {
            const isFixed = localStorage.getItem(`issue_${issue.key}_fixed`) === 'true';
            const prLink = localStorage.getItem(`issue_${issue.key}_pr`) || null;
            return { ...issue, isFixed, pr: prLink };
          });

          setIssues(issuesWithFixStatus);
          setFilteredIssues(issuesWithFixStatus);
          setLoading(false);
          setFetchingIssues(false); // Set fetching state to false after issues are fetched
        }, 2000); // Delay of 2 seconds to simulate the fetching process
      } catch (err) {
        setError('Error fetching project details');
        setLoading(false);
        setFetchingIssues(false); // Stop fetching state on error
      }
    };

    fetchProjectDetails();
  }, [projectName]);

  const handleFixIssue = async (issue) => {
    setProcessingIssues((prev) => ({
      ...prev,
      [issue.key]: true,
    }));

    toast.info('PR creation in progress!!');
    try {
      const url = 'http://localhost:5000/api/fixissue';
      const data = {
        key: issue.key,
        component: issue.component,
        line: issue.line,
        message: issue.message,
        repoName: issue.project,
      };

      const response = await axios.post(url, data);
      toast.success('PR created successfully!!');

      const updatedIssues = issues.map((i) =>
        i.key === issue.key ? { ...i, pr: response.data.prurl, isFixed: true } : i
      );

      setIssues(updatedIssues);
      applyFilter(severityFilter, typeFilter, updatedIssues);

      localStorage.setItem(`issue_${issue.key}_fixed`, 'true');
      localStorage.setItem(`issue_${issue.key}_pr`, response.data.prurl);
    } catch (error) {
      toast.error('Failed to create PR. Please try again!');
    } finally {
      setProcessingIssues((prev) => ({
        ...prev,
        [issue.key]: false,
      }));
    }
  };

  const applyFilter = (severity, type, issueList = issues) => {
    let filtered = issueList;

    if (severity !== 'ALL') {
      filtered = filtered.filter((issue) => issue.severity === severity);
    }

    if (type !== 'ALL') {
      filtered = filtered.filter((issue) => issue.type === type);
    }

    setFilteredIssues(filtered);
  };

  const handleFilterChange = (event, filterType) => {
    const value = event.target.value;
    if (filterType === 'severity') {
      setSeverityFilter(value);
      applyFilter(value, typeFilter);
    } else if (filterType === 'type') {
      setTypeFilter(value);
      applyFilter(severityFilter, value);
    }
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

          {/* Filter Dropdowns */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <FormControl size="small" sx={{ minWidth: 150, marginRight: 2 }}>
              <InputLabel>Severity</InputLabel>
              <Select
                value={severityFilter}
                onChange={(e) => handleFilterChange(e, 'severity')}
                label="Severity"
              >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="BLOCKER">Blocker</MenuItem>
                <MenuItem value="CRITICAL">Critical</MenuItem>
                <MenuItem value="MAJOR">Major</MenuItem>
                <MenuItem value="MINOR">Minor</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => handleFilterChange(e, 'type')}
                label="Type"
              >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="BUG">Bug</MenuItem>
                <MenuItem value="VULNERABILITY">Vulnerability</MenuItem>
                <MenuItem value="CODE_SMELL">Code Smell</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Showing the "Fetching Issues" or the actual issues */}
          {fetchingIssues ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
              <Typography variant="h6">Fetching Issues...</Typography>
              <CircularProgress size={60} color="primary" sx={{ ml: 2 }} />
            </Box>
          ) : loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
              <CircularProgress size={60} color="primary" />
            </Box>
          ) : error ? (
            <Fade in={true} timeout={1500}>
              <Alert severity="error" sx={{ marginTop: 2 }}>
                {error}
              </Alert>
            </Fade>
          ) : filteredIssues.length === 0 ? (
            <Fade in={true} timeout={1500}>
              <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                <Card sx={{ maxWidth: 500, textAlign: 'center', boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                      No Issues Found for the Selected Filters
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                      Try changing the filters or check back later.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          ) : (
            <Grid container spacing={3}>
              {filteredIssues.map((issue) => (
                <Grid item xs={12} sm={6} md={4} key={issue.key}>
                  <Fade in={true} timeout={2000}>
                    <Box>
                      <IssueCard
                        issue={issue}
                        onFixIssue={handleFixIssue}
                        isProcessing={processingIssues[issue.key]} // Pass individual processing state
                      />
                    </Box>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  );
}

export default SonarQubeProjectPage;
