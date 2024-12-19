import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { getChangesData } from "./utils/ai.js";
import { doGithubPRProcess } from "./utils/prCreaterModule.js";
import { copyFileSync, promises as fs } from 'fs';
import {
  getRepoInfo,
  createSonarQubeProject,
  generateSonarScannerProperties,
} from "./service.cjs";
import { fileURLToPath } from 'url'
dotenv.config();
import path from "path";
import sqlite3 from "sqlite3";


const router = express.Router();

const { SONARQUBE_URL, username, password } = process.env;
const db = new sqlite3.Database('./issues.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Open the database
  

   db.run(`
    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY ,
      project TEXT,
      message TEXT NOT NULL,
      rule TEXT,
      severity TEXT,
      component TEXT,
      line INTEGER,
      type TEXT,
      status TEXT,
      pr TEXT,
      original_content TEXT,
      solution_content TEXT,
      changes TEXT
    )
  `);


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
  const { projectName } = req.params;
  try {
    const response = await axios.get(`${SONARQUBE_URL}/api/issues/search`, {
      params: {
        componentKeys: projectName,
        statuses: "OPEN",
        severities: "MINOR,MAJOR,CRITICAL,BLOCKER",
      },
      auth: {
        username: username,
        password: password,
      },
    });

    const issues = response.data.issues;
    const insertQuery = 'INSERT OR IGNORE INTO issues (id, project, message, rule,severity,component, line, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';


    issues.forEach((item) => {
      db.run(
        insertQuery,
        [
          item.key,
          item.project,
          item.message,
          item.rule,
          item.severity,
          item.component,
          item.line,
          item.type,
        ],
      )
      })
  let updatedData = await Promise.all(
    issues.map(async (item) => {
      const row = await getPrAndId(db, item.key);
      if (row) {
        return { ...item, pr: row.pr, id: row.id };
      }}))
    res.json(updatedData);
  } catch (error) {
    console.error("Error fetching issues from SonarQube:", error.message);
    process.exit(1);
  }
});

const getPrAndId = (db, id) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT id, pr
      FROM issues
      WHERE id = ?
    `;

    db.get(query, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row || null); // Return `null` if no row is found
      }
    });
  });
};

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

    const solution = await checkPreview(db, key);
    let changesData = []
    if (solution) {
      console.log("solution", solution)
      changesData = JSON.parse(solution.changes)
    }
    else{
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

     changesData = await getChangesData([issueDetails]);

    const updateChangesQuery = `
    UPDATE issues
    SET changes = ?
    WHERE id = ?
  `;
  db.run(updateChangesQuery, [JSON.stringify(changesData), key]);
    }
console.log("changesData", changesData);
    changesData.forEach((issue) => {
      issue.path = component.split(":")[1];
    });
  
    const prDetails = await doGithubPRProcess(changesData, component.split(":")[0],key, message);
    const updateQuery = `
    UPDATE issues
    SET pr = ?
    WHERE id = ?
  `;
  db.run(updateQuery, [prDetails.html_url, key]);

    res.json({"message": "PR created sucessfully", "prurl": prDetails.html_url});
  } catch (error) {
    console.error("Error fetching issues from SonarQube:", error.message);
    process.exit(1);
  }
});

function formatCodeToString(inputCode) {
  // Replace each tab with '\\t' and each newline with '\\n'
  return inputCode
    .replace(/\t/g, '\\t')   // Convert tabs to literal '\t'
    .replace(/\n/g, '\\n')    // Convert line breaks to literal '\n'
    .split('\n')              // Split the code into an array of lines
    .map(line => '\t' + line) // Add leading tab to each line
    .join(' + \n');           // Join all lines with ' + \n'
}
const checkPreview = (db, id) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT original_content, solution_content, changes
      FROM issues
      WHERE id = ? AND original_content IS NOT NULL AND original_content!= '' 
      AND solution_content IS NOT NULL AND  solution_content!= ''
    `;

    db.get(query, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row||null); // Return true if a row is found, false otherwise
      }
    });
  });
};


router.post("/previewfix", async (req, res) => {
  try {
    const { key, line, message, component } = req.body;
    const solution = await checkPreview(db, key);
    if (solution) {
      res.json({"message": "Preview Generated Succressfully", "newData": solution.solution_content, "data": solution.original_content});
      return;
    }

    // console.log("preview", preview);

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

    let oldContent = await fs.readFile(localRepoDir, 'utf8');

    const changesData = await getChangesData([issueDetails]);

    changesData.forEach((issue) => {
      issue.path = component.split(":")[1];
    });

    const updateQuery = `
    UPDATE issues
    SET original_content = ?, solution_content = ?, changes = ?
    WHERE id = ?
  `;
  db.run(updateQuery, [oldContent, changesData[0].content, JSON.stringify(changesData), key]);


    res.json({"message": "Preview Generated Succressfully", "newData": changesData[0].content, "data": oldContent});
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
