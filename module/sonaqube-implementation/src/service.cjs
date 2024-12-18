require('dotenv').config();
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const qs = require('qs');
const scanner = require('sonarqube-scanner').default;
const simpleGit = require('simple-git');

const { SONARQUBE_URL, SONARQUBE_API_CREATE_PROJECT, username, password, GITHUB_TOKEN } = process.env;

const getRepoInfo = async (repoUrl) => {
    try {
        const match = /https:\/\/github\.com\/([^/]+)\/([^/]+)/.exec(repoUrl);
        if (!match) {
            throw new Error('Invalid GitHub URL');
        }
        const owner = match[1];
        const repo = match[2];


        // GitHub API endpoint to fetch repo details
        const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}`;

        // Fetch repository info using GitHub API (use authentication if needed)
        const response = await axios.get(githubApiUrl, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
            },
        });

        // Extract relevant info from the response
        const repoInfo = {
            name: response.data.name,
            owner: response.data.owner.login,
            description: response.data.description,
            url: response.data.html_url,
            stars: response.data.stargazers_count,
            forks: response.data.forks_count,
            issues_url: response.data.issues_url.replace('{/number}', ''), // GitHub issues API URL
        };

        return repoInfo;
    } catch (error) {
        console.error('Error fetching repository info:', error);
        throw new Error('Failed to fetch repository information');
    }
};

const createSonarQubeProject = async (repoInfo) => {
    try {

        // Format data as application/x-www-form-urlencoded
        const data = qs.stringify({
            project: repoInfo.name,
            name: repoInfo.name,
            visibility: 'private',
        });

        // Perform the POST request with basic authentication
        const response = await axios.post(
            `${SONARQUBE_URL}${SONARQUBE_API_CREATE_PROJECT}`,
            data,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                auth: {
                    username: username, // SonarQube username
                    password: password, // SonarQube password
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error creating project:', error.response?.data || error.message);
        throw new Error('Failed to create SonarQube project');
    }
};

const generateSonarScannerProperties = async (repoInfo) => {

    const token = await generateSonarQubeToken(repoInfo.name);
    await runSonarScanner(token, repoInfo.name, repoInfo.url);
    return token;

};

const generateSonarQubeToken = async (tokenName) => {
    try {
        const currentDate = new Date();
        const expirationDate = new Date(currentDate.setDate(currentDate.getDate() + 7))
            .toISOString()
            .split('T')[0];
        // Prepare the data to be sent in form-urlencoded format
        const data = qs.stringify({
            name: tokenName, // Name for the new token
            type: 'PROJECT_ANALYSIS_TOKEN',
            projectKey: tokenName,
            expirationDate: expirationDate
        });

        // Perform the POST request with Basic Authentication
        const response = await axios.post(
            'http://localhost:9000/api/user_tokens/generate',
            data,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                auth: {
                    username: username, // SonarQube username
                    password: password, // SonarQube password
                },
            }
        );

        console.log('Token generated successfully:', response.data.token);
        return response.data.token; // Return the generated token
    } catch (error) {
        console.error('Error generating token:', error.response?.data || error.message);
        throw new Error('Failed to generate SonarQube token');
    }
};


// Function to fetch SonarQube issues
const fetchSonarQubeIssues = async (projectName, token) => {
    const response = await axios.get(`${SONARQUBE_URL}/api/issues/search`, {
        params: {
            componentKeys: projectName,
            statuses: 'OPEN',
            types: 'CODE_SMELL',
            severities: 'MINOR,MAJOR,CRITICAL,BLOCKER',
        },
        auth: {
            username: username, // SonarQube username
            password: password, // SonarQube password
        },
    });
    return response.data;
};

const runSonarScanner = async (token, projectKey, repoUrl) => {
    try {

        const parentDir = path.dirname(__dirname);

        const newPath =  path.join(parentDir, '/repository')

        const localRepoDir = path.join(newPath, projectKey);



        if (fs.existsSync(localRepoDir)) {
            console.log(`Directory ${localRepoDir} already exists. Skipping clone.`);
        } else {
            const git = simpleGit();
            await git.clone(repoUrl, localRepoDir);
            console.log(`Successfully cloned the repository into: ${localRepoDir}`);
        }

        process.chdir(localRepoDir);

        scanner({
            serverUrl: 'http://localhost:9000',
            token: token,
            options: {
                'sonar.projectName': projectKey,
                'sonar.projectKey': projectKey,
                'sonar.projectVersion': '0.0.1',
                'sonar.sources': localRepoDir,
                'sonar.sourceEncoding': 'UTF-8',
                'sonar.login': token,
                'sonar.cpd.minLines': '1',
            }
        }, function (error) {
            if (error) {
                console.error('Error during SonarQube scan:', error);
            } else {
                console.log('SonarQube scan completed successfully!');
            }
        });

    } catch (error) {
        console.error('Error during repository cloning or SonarQube scan:', error);
    }
};

module.exports = {
    getRepoInfo,
    createSonarQubeProject,
    generateSonarScannerProperties,
    fetchSonarQubeIssues,
};
