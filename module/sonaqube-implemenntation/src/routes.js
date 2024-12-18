import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { getChangesData } from "./utils/ai.js";
import { doGithubPRProcess } from "./utils/prCreaterModule.js";
import {
  getRepoInfo,
  createSonarQubeProject,
  generateSonarScannerProperties,
} from "./service.cjs";

dotenv.config();

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
    const path = component.split(":")[1];
    console.log("path", path);

    const issueDetails = {
      message,
      path: "./src/routes.js",
      line,
    };

    const changesData = await getChangesData([issueDetails]);
    console.log("changesData", changesData);

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
