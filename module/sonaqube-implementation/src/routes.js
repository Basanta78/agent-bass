import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { getChangesData } from "./utils/ai.js";
import { doGithubPRProcess } from "./utils/prCreaterModule.js";
import { promises as fs } from 'fs';
import {
  getRepoInfo,
  createSonarQubeProject,
  generateSonarScannerProperties,
} from "./service.cjs";
import { fileURLToPath } from 'url'
dotenv.config();
import path from "path";

const router = express.Router();

const { SONARQUBE_URL, username, password } = process.env;

router.post("/generate-sonarqube-project", async (req, res) => {
  const { repoUrl } = req.body;

  try {
    const repoInfo = await getRepoInfo(repoUrl);

    const createProjectResponse = await createSonarQubeProject(repoInfo);

    const token = await generateSonarScannerProperties(repoInfo);

    res.json({
      projectCreated: createProjectResponse.data,
      propertiesFile: propertiesFilePath,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing request" });
  }
});

router.get("/sonarqube/issues/:projectName", async (req, res) => {
  console.log({ req });
  const { projectName } = req.params;
  try {
    const response = await axios.get(`${SONARQUBE_URL}/api/issues/search`, {
      params: {
        componentKeys: projectName,
        statuses: "OPEN",
        types: "CODE_SMELL",
        severities: "MINOR,MAJOR,CRITICAL,BLOCKER",
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

router.get("/projects", async (req, res) => {
  try {
    const response = await axios.get(
      "http://localhost:9000/api/components/search_projects",
      {
        auth: {
          username: username,
          password: password,
        },
      }
    );

    const projects = response.data.components || [];
    res.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error.message);
    res.status(500).json({ error: "Error fetching projects" });
  }
});

router.post("/fixissue", async (req, res) => {
  try {
    const { key, line, message, component } = req.body;
    const issueFilePath = component.split(":")[0]+'/'+component.split(":")[1]
    // const parentDir = path.dirname();
    // Get the current file's URL and convert it to a file path
const __filename = fileURLToPath(import.meta.url);

// Get the directory of the current file
const __dirname = path.dirname(__filename);

// Get the parent directory
    const parentDirectory = path.dirname(__dirname);

    
    const newPath =  path.join(parentDirectory, '/repository')

    const localRepoDir = path.join(newPath, issueFilePath);
    console.log("path", localRepoDir);

    const issueDetails = {
      message,
      path: localRepoDir,
      line,
    };

    const changesData = await getChangesData([issueDetails]);

    changesData.forEach((issue) => {
      issue.path = component.split(":")[1];
    });
    console.log("changesData", changesData);
  
    const prDetails = await doGithubPRProcess(changesData, component.split(":")[0],key, message);

    res.json({"message": "PR created sucessfully", "prurl": prDetails.html_url});
  } catch (error) {
    console.error("Error fetching issues from SonarQube:", error.message);
    process.exit(1);
  }
});

router.post("/previewfix", async (req, res) => {
  try {
    const { key, line, message, component } = req.body;
    const issueFilePath = component.split(":")[0]+'/'+component.split(":")[1]
    // const parentDir = path.dirname();
    // Get the current file's URL and convert it to a file path
const __filename = fileURLToPath(import.meta.url);

// Get the directory of the current file
const __dirname = path.dirname(__filename);

// Get the parent directory
    const parentDirectory = path.dirname(__dirname);

    
    const newPath =  path.join(parentDirectory, '/repository')

    const localRepoDir = path.join(newPath, issueFilePath);
    console.log("path", localRepoDir);

    const issueDetails = {
      message,
      path: localRepoDir,
      line,
    };

    const oldContent = await fs.readFile(localRepoDir, 'utf8');

    const changesData = await getChangesData([issueDetails]);

    changesData.forEach((issue) => {
      issue.path = component.split(":")[1];
    });
    console.log("changesData", changesData);


    res.json({"message": "Preview Generated Succressfully", "newData": changesData, "data": oldContent});
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
