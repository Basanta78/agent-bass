//convert to js after package is added
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();



const { GITHUB_TOKEN, REPO_OWNER, BASE_BRANCH } = process.env;


async function createBranch(repoOwner, repoName, newBranch, baseBranch, token) {
  try {
    try {
      // Step 1: Check if the branch exists
      const { data: existingBranchData } = await axios.get(
        `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/${newBranch}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      // If the branch exists, delete it
      if (existingBranchData) {
        console.log(`Branch '${newBranch}' exists. Deleting it...`);
        await axios.delete(
          `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/${newBranch}`,
          {
            headers: {
              Authorization: `token ${token}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );
        console.log(`Branch '${newBranch}' deleted.`);
      }
    } catch (e) {
      console.log(e);
    }

    // Step 2: Get the base branch SHA
    console.log(`Getting SHA of the base branch '${baseBranch}'...`);
    const { data: baseBranchData } = await axios.get(
      `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/${baseBranch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    const baseBranchSHA = baseBranchData.object.sha;

    // Step 3: Create the new branch
    console.log(`Creating branch '${newBranch}'...`);
    const response = await axios.post(
      `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs`,
      {
        ref: `refs/heads/${newBranch}`,
        sha: baseBranchSHA,
      },
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    console.log("Branch created:", response.data.url);
    return response.data;
  } catch (error) {
    console.error("Error creating branch:", error.message);
    throw error;
  }
}

async function commitChanges(
  repoOwner,
  repoName,
  branchName,
  fileChanges,
  commitMessage,
  token
) {
  try {
    // Get the SHA of the latest commit on the branch
    const { data: branchData } = await axios.get(
      `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/${branchName}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    const commitSHA = branchData.object.sha;

    // Get the tree SHA of the latest commit
    const { data: commitData } = await axios.get(
      `https://api.github.com/repos/${repoOwner}/${repoName}/git/commits/${commitSHA}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    const treeSHA = commitData.tree.sha;

    // Create a new blob (file content)
    const blobData = await Promise.all(
      fileChanges.map(async ({ path, content }) => {
        const { data: blobData } = await axios.post(
          `https://api.github.com/repos/${repoOwner}/${repoName}/git/blobs`,
          {
            content: content,
            encoding: "utf-8",
          },
          {
            headers: {
              Authorization: `token ${token}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );
        return { sha: blobData.sha, path };
      })
    );
    // const { data: blobData } = await axios.post(`https://api.github.com/repos/${repoOwner}/${repoName}/git/blobs`, {
    //     content: content,
    //     encoding: 'utf-8',
    // }, {
    //     headers: {
    //         'Authorization': `token ${token}`,
    //         'Accept': 'application/vnd.github.v3+json',
    //     },
    // });

    // const blobSHA = blobData.sha;

    // Create a new tree with the updated file
    const { data: newTreeData } = await axios.post(
      `https://api.github.com/repos/${repoOwner}/${repoName}/git/trees`,
      {
        base_tree: treeSHA,
        tree: blobData.map((data) => ({
          path: data.path,
          mode: "100644", // regular file
          type: "blob",
          sha: data.sha,
        })),
      },
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    const newTreeSHA = newTreeData.sha;

    // Create a new commit with the new tree
    const { data: newCommitData } = await axios.post(
      `https://api.github.com/repos/${repoOwner}/${repoName}/git/commits`,
      {
        message: commitMessage,
        tree: newTreeSHA,
        parents: [commitSHA],
      },
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    const newCommitSHA = newCommitData.sha;

    // Update the branch reference to point to the new commit
    await axios.patch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/${branchName}`,
      {
        sha: newCommitSHA,
      },
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    console.log("Changes committed:", newCommitData.html_url);
    return newCommitData;
  } catch (error) {
    console.error("Error committing changes:", error.message);
    throw error;
  }
}

async function createPullRequest(
  repoOwner,
  repoName,
  headBranch,
  baseBranch,
  prTitle,
  prBody,
  token
) {
  try {
    const response = await axios.post(
      `https://api.github.com/repos/${repoOwner}/${repoName}/pulls`,
      {
        title: prTitle,
        head: headBranch,
        base: baseBranch,
        body: prBody,
      },
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    console.log("Pull Request Created:", response.data.html_url);
    return response.data;
  } catch (error) {
    console.error("Error creating Pull Request:", error.message);
    throw error;
  }
}

/*
    const fileChanges = 
        [
        { path: 'test.txt', content: 'New content for file 1' },
        { path: 'test2.txt', content: 'console.log("File 2 updated");' }
        ]
 */

export const doGithubPRProcess = async (fileChanges = [], repoName, newBranch, issue) => {
  try {
    // Create a new branch

    console.log("-----------------------------------------");
    await createBranch(REPO_OWNER, repoName, newBranch, BASE_BRANCH, GITHUB_TOKEN);
    console.log(`Branch ${newBranch} created successfully`);
    const commitMessage = `fix: ${issue}`;
    // Commit changes to the new branch
    await commitChanges(
      REPO_OWNER,
      repoName,
      newBranch,
      fileChanges,
      commitMessage,
      GITHUB_TOKEN
    );
    console.log(`Changes committed to ${newBranch}`);

    // Create the pull request
    const prTitle = `FIX: ${issue}`;
    const prBody = `Fix for ${issue}`;
    const pr = await createPullRequest(
      REPO_OWNER,
      repoName,
      newBranch,
      BASE_BRANCH,
      prTitle,
      prBody,
      GITHUB_TOKEN
    );
    console.log("Pull Request Details:", pr);
    return pr;

    // pr.url will be the link for the created PR
    // return pr; // Optionally return PR details for further use
  } catch (err) {
    console.error("Error during GitHub PR process:", err);
    // throw err; // Re-throwing error in case the calling function needs to handle it
  }
};

// module.exports = {
//   doGithubPRProcess,
// };
