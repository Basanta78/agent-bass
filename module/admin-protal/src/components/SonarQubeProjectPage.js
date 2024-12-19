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
  const [fetchingIssues, setFetchingIssues] = useState(true);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setFetchingIssues(true);

        const response = await axios.get(`http://localhost:5000/api/sonarqube/issues/${projectName}`);

        console.log({response})

        setTimeout(() => {
          const issuesWithFixStatus = response.data.map((issue = {}) => ({
            ...issue,
            isFixed: Boolean(issue.pr), 
            pr: issue?.pr || null,    
          }));

          setIssues(issuesWithFixStatus);
          setFilteredIssues(issuesWithFixStatus);
          setLoading(false);
          setFetchingIssues(false);
        }, 2000);
      } catch (err) {
        setError('Error fetching project details');
        setLoading(false);
        setFetchingIssues(false);
      }
    };

    fetchProjectDetails();
  }, [projectName]);

  const handleFixIssue = async (issue = {}) => {
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

      const updatedIssues = issues.map((i = {}) =>
        i.key === issue.key ? { ...i, pr: response.data.prurl, isFixed: true } : i
      );

      setIssues(updatedIssues);
      applyFilter(severityFilter, typeFilter, updatedIssues);

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

  // Reload handler function
  const handleReload = () => {
    window.location.reload(); // Reload the page
  };

  return (
    <Box className="root-container">
      {/* Header with Reload Button */}
      <AppBar position="static" sx={{ backgroundColor: '#1976d2', mb: 2 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'white' }}>
            Bug Fix Agent Dashboard
          </Typography>
          <Button color="inherit" href="/">
            Home
          </Button>
          <Button color="inherit" href="/add-project">
            Add Repository
          </Button>

          {/* Reload Button */}
          <Button
            variant="contained" // Using contained variant for better visibility
            color="secondary"
            sx={{
              marginLeft: 2,
              textTransform: 'none',
              padding: '6px 16px', // Adding padding for better size
              fontWeight: 'bold',
            }}
            onClick={handleReload}
          >
            Reload
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box className="scrollable-content">
        <Container maxWidth="lg">

          {/* Filter Dropdowns and Header in One Line */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                textAlign: 'left',
                letterSpacing: '1px',
                marginRight: 4,
              }}
            >
              Project Issue Tracker: {projectName}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
              {filteredIssues.map((issue = {}) => (
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
