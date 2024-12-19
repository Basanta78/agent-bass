import React, { useEffect, useState } from 'react';
import { Diff } from 'diff';
import Diff2Html from 'diff2html';
import 'diff2html/bundles/css/diff2html.min.css';

const CodeDiffViewer = ({ code1, code2 }) => {
  const [diffHtml, setDiffHtml] = useState('');

  useEffect(() => {
    // Compute the diff between the two code versions
    const diff = Diff.createTwoFilesPatch('Version 1', 'Version 2', code1, code2);

    // Convert the diff to HTML using diff2html
    const html = Diff2Html.html(diff, {
      drawFileList: false, // Hide file list
      matching: 'words',   // Word matching for more accurate diffs
      outputFormat: 'side-by-side', // Side-by-side format
    });

    // Set the HTML diff content
    setDiffHtml(html);
  }, [code1, code2]);

  return (
    <div>
      <h1>Code Diff Viewer</h1>
      <div className="code" style={codeStyle}>
        <h3>Code Version 1:</h3>
        <pre>{code1}</pre>
      </div>
      <div className="code" style={codeStyle}>
        <h3>Code Version 2:</h3>
        <pre>{code2}</pre>
      </div>
      <div id="diff-container" style={diffContainerStyle}>
        <h3>Code Diff:</h3>
        <div id="diff-output" dangerouslySetInnerHTML={{ __html: diffHtml }} />
      </div>
    </div>
  );
};

// Inline styles for basic layout
const codeStyle = {
  backgroundColor: '#f0f0f0',
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #ddd',
  fontFamily: 'Courier New, Courier, monospace',
  fontSize: '14px',
  marginBottom: '20px',
};

const diffContainerStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  maxWidth: '800px',
  margin: '20px auto',
};

export default CodeDiffViewer;
