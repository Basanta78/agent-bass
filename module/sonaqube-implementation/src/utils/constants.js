const repoOwner = '';
const repoName = '';
const baseBranch = 'main';
const newBranch = baseBranch+'agent-bass-branch';
const prTitle = 'Your Pull Request Title';
const prBody = 'Your Pull Request Description';
const token = '';
const fileChanges = [];
/**
 * [
 *  { path: 'test.txt', content: 'New content for file 1' },
 *  { path: 'test2.txt', content: 'console.log("File 2 updated");' }
 *  ]
 */
const commitMessage = 'This is a test commit message';

export default {
    repoOwner,
    repoName,
    baseBranch,
    newBranch,
    prTitle,
    prBody,
    token,
    fileChanges,
    commitMessage
}
