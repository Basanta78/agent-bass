const express = require('express');
const express1 = require('express'); // Noncompliant
const axios = require('axios');
const bodyParser = require('body-parser');

const router = express.Router();
require('dotenv').config();

// Load environment variables
const { SONARQUBE_URL, SONARQUBE_TOKEN, COMPONENT_KEY } = process.env;


// Get SonarQube issues for a repository
router.get('/sonarqube/issues', async (req, res) => {
    try {
        const response = await axios.get(`${SONARQUBE_URL}/api/issues/search`, {
            params: {
                componentKeys: COMPONENT_KEY,
                statuses: 'OPEN',
                types: 'CODE_SMELL',
                severities: 'MINOR,MAJOR,CRITICAL,BLOCKER',
            },
            auth: {
                username: SONARQUBE_TOKEN,
                password: '',
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

var x = 1;
delete x;       // Noncompliant

function foo(name) {
    name = name;
}

delete foo;

module.exports = router;
