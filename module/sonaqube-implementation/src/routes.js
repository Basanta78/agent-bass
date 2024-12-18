import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { getChangesData } from "./utils/ai.js";
import { doGithubPRProcess } from "./utils/prCreaterModule.js";
import { getRepoInfo, createSonarQubeProject, generateSonarScannerProperties } from './service.cjs';


dotenv.config();

const router = express.Router();

// Load environment variables
const { SONARQUBE_URL, username, password } = process.env;


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
    console.log({ req })
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
                username: username,
                password: password,
            },
        });

        const issues = response.data.issues;
        console.log("Fetched issues:", JSON.stringify(issues, null, 2));

        res.json(issues);
    } catch (error) {
        console.error("Error fetching issues from SonarQube:", error.message);
        process.exit(1);
    }
});

// Backend endpoint to get all projects
router.get('/projects', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:9000/api/components/search_projects', {
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

router.post("/fixissue", async (req, res) => {
    try {
        const { key, line, message, component } = req.body;
        // Parse component
        const path = component.split(":")[1];
        console.log("path", path);

        const issueDetails = {
            message,
            path,
            line,
        };

        // const changesData = await getChangesData([issueDetails]);

        const changesData = [
            {
                path: "/Users/basantamaharjan/hack/agent-bass/module/sonaqube-implementation/src/routes.js",
                content:
                    'import express from "express";\n' +
                    'import axios from "axios";\n' +
                    'import bodyParser from "body-parser";\n' +
                    'import dotenv from "dotenv";\n' +
                    'import { getChangesData } from "./utils/ai.js";\n' +
                    "\n" +
                    "dotenv.config();\n" +
                    "\n" +
                    "const router = express.Router();\n" +
                    "\n" +
                    "// Load environment variables\n" +
                    "const { SONARQUBE_URL, SONARQUBE_TOKEN, COMPONENT_KEY } = process.env;\n" +
                    "\n" +
                    "// Get SonarQube issues for a repository\n" +
                    'router.get("/sonarqube/issues", async (req, res) => {\n' +
                    "  try {\n" +
                    "    const response = await axios.get(`${SONARQUBE_URL}/api/issues/search`, {\n" +
                    "      params: {\n" +
                    "        componentKeys: COMPONENT_KEY,\n" +
                    '        statuses: "OPEN",\n' +
                    '        types: "CODE_SMELL",\n' +
                    '        severities: "MINOR,MAJOR,CRITICAL,BLOCKER",\n' +
                    "      },\n" +
                    "      auth: {\n" +
                    "        username: SONARQUBE_TOKEN,\n" +
                    '        password: "",\n' +
                    "      },\n" +
                    "    });\n" +
                    "\n" +
                    "    const issues = response.data.issues;\n" +
                    '    console.log("Fetched issues:", JSON.stringify(issues, null, 2));\n' +
                    "\n" +
                    "    res.json(issues);\n" +
                    "  } catch (error) {\n" +
                    '    console.error("Error fetching issues from SonarQube:", error.message);\n' +
                    "    process.exit(1);\n" +
                    "  }\n" +
                    "});\n" +
                    "\n" +
                    'router.post("/fixissue", async (req, res) => {\n' +
                    "  try {\n" +
                    "    const { key, line, message, component } = req.body;\n" +
                    "\n" +
                    "    // Parse component\n" +
                    '    const path = component.split(":")[1];\n' +
                    '    console.log("path", path);\n' +
                    "\n" +
                    "    const issueDetails = {\n" +
                    "      message,\n" +
                    "      path,\n" +
                    "      line,\n" +
                    "    };\n" +
                    "\n" +
                    "    const changesData = await getChangesData([issueDetails]);\n" +
                    '    console.log("changesData", changesData);\n' +
                    "\n" +
                    "    res.json({});\n" +
                    "  } catch (error) {\n" +
                    '    console.error("Error fetching issues from SonarQube:", error.message);\n' +
                    "    process.exit(1);\n" +
                    "  }\n" +
                    "});\n" +
                    "\n" +
                    "let x = 1;\n" +
                    "\n" +
                    "const foo = (name) => {\n" +
                    "  name = name;\n" +
                    "};\n" +
                    "\n" +
                    "export default router;\n",
            },
        ];

        await doGithubPRProcess(changesData);

        // console.log("changesData", changesData);

        res.json({});
    } catch (error) {
        console.error("Error fetching issues from SonarQube:", error.message);
        process.exit(1);
    }
});

let x = 1;

const foo = (name) => {
    name = name;
};

export default router;
