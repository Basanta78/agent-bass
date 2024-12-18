import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { getChangesData } from "./utils/ai.js";

dotenv.config();

const router = express.Router();

// Load environment variables
const { SONARQUBE_URL, SONARQUBE_TOKEN, COMPONENT_KEY } = process.env;

// Get SonarQube issues for a repository
router.get("/sonarqube/issues", async (req, res) => {
  try {
    const response = await axios.get(`${SONARQUBE_URL}/api/issues/search`, {
      params: {
        componentKeys: COMPONENT_KEY,
        statuses: "OPEN",
        types: "CODE_SMELL",
        severities: "MINOR,MAJOR,CRITICAL,BLOCKER",
      },
      auth: {
        username: SONARQUBE_TOKEN,
        password: "",
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
