import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { doGithubPRProcess } from "../utils/github-pr-process";

dotenv.config();

const router = express.Router();

router.get("/issues", async (req, res) => {
  try {
    const response = await axios.get(`https://api.github.com/repos/${process.env.GITHUB_REPO}/issues`, { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } });

    const issues = response.data;

    res.json(issues);
  } catch (error) {
    console.error("Error fetching issues from GitHub:", error.message);
    process.exit(1);
  }
});

router.post("/issues", async (req, res) => {
  try {
    const response = await axios.post(`https://api.github.com/repos/${process.env.GITHUB_REPO}/issues`, req.body, { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } });

    const issue = response.data;

    res.json(issue);
  } catch (error) {
    console.error("Error creating issue in GitHub:", error.message);
    process.exit(1);
  }
});

router.get("/issues/:id", async (req, res) => {
  try {
    const response = await axios.get(`https://api.github.com/repos/${process.env.GITHUB_REPO}/issues/${req.params.id}`, { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } });

    const issue = response.data;

    res.json(issue);
  } catch (error) {
    console.error("Error fetching issue from GitHub:", error.message);
    process.exit(1);
  }
});

router.put("/issues/:id", async (req, res) => {
  try {
    const response = await axios.put(`https://api.github.com/repos/${process.env.GITHUB_REPO}/issues/${req.params.id}`, req.body, { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } });

    const issue = response.data;

    res.json(issue);
  } catch (error) {
    console.error("Error updating issue in GitHub:", error.message);
    process.exit(1);
  }
});

router.delete("/issues/:id", async (req, res) => {
  try {
    const response = await axios.delete(`https://api.github.com/repos/${process.env.GITHUB_REPO}/issues/${req.params.id}`, { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } });

    const issue = response.data;

    res.json(issue);
  } catch (error) {
    console.error("Error deleting issue from GitHub:", error.message);
    process.exit(1);
  }
});

export default router;