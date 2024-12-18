const repoOwner = "Basanta78";
const repoName = "agent-bass";
const baseBranch = "main";
const newBranch = "agent-bass-branch";
const prTitle = newBranch + " Bot-generated Fix for Sonar Code Quality Issue";
const prBody =
  "This pull request is bot-generated and automatically addresses and resolves the selected issue, implementing a fix to ensure proper functionality.";
const token = "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"; //agent-bass-bot token
const commitMessage =
  newBranch + " Bot-generated fix for Sonar code quality issue";

export default {
  repoOwner,
  repoName,
  baseBranch,
  newBranch,
  prTitle,
  prBody,
  token,
  commitMessage,
};
