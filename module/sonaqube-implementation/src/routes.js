const express = require('express');
const express1 = require('express'); // Noncompliant
const axios = require('axios');
const bodyParser = require('body-parser');
const { getRepoInfo, createSonarQubeProject, generateSonarScannerProperties, fetchSonarQubeIssues } = require('./service');

const router = express.Router();
require('dotenv').config();

// Load environment variables
const { SONARQUBE_URL, SONARQUBE_TOKEN, COMPONENT_KEY } = process.env;


router.post('/generate-sonarqube-project', async (req, res) => {
    const { repoUrl } = req.body;


    try {
        // 1. Fetch repository details (you may need to interact with GitHub API here)
        const repoInfo = await getRepoInfo(repoUrl);



        // 2. Create SonarQube project using SonarQube API
        const createProjectResponse = await createSonarQubeProject(repoInfo);


        // 3. Generate sonar-scanner.properties file
        const token = await generateSonarScannerProperties(repoInfo);

        res.json({
            projectCreated: createProjectResponse.data,
            propertiesFile: propertiesFilePath,
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing request' });
    }
});

// Get SonarQube issues for a repository
router.get('/sonarqube/issues/:projectName', async (req, res) => {
    console.log({req})
    const { projectName } = req.params;
    try {
        const response = await axios.get(`${SONARQUBE_URL}/api/issues/search`, {
            params: {
                componentKeys: projectName,
                statuses: 'OPEN',
                types: 'CODE_SMELL',
                severities: 'MINOR,MAJOR,CRITICAL,BLOCKER',
            },
            auth: {
                username: 'admin',
                password: 'Amrita',
            },
        });

        const issues = response.data.issues;

        console.log('Fetched issues:', JSON.stringify(issues, null, 2));

        res.json(issues);
    } catch (error) {
        console.error('Error fetching issues from SonarQube:', error.message);
        process.exit(1);
    }
});

// Backend endpoint to get all projects
router.get('/projects', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:9000/api/projects/search', {
            auth: {
                username: 'admin',  // SonarQube username or API token
                password: 'Amrita',  // Leave empty if using an API token
            },
        });

        const projects = response.data.components || [];
        res.json({ projects });
    } catch (error) {
        console.error('Error fetching projects:', error.message);
        res.status(500).json({ error: 'Error fetching projects' });
    }
});


var x = 1;
delete x;       // Noncompliant

function foo(name) {
    name = name;
}

delete foo;

module.exports = router;
