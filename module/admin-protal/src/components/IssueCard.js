import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, Divider, Chip } from '@mui/material';

import CustomModal from './Modal';
import CodeDiffViewer from './CodeDiffViewerDialog';

function IssueCard({ issue, onFixIssue }) {

  //code sample
  const codeVersion1 = `// Initial code version
    function sayHello() {
        console.log("Hello, world!");
    }`;

  const codeVersion2 = `// Updated code version
    function sayHello(name) {
        console.log("Hello, " + name + "!");
    }`;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleFixIssue = () => {
    onFixIssue(issue);
  };

  return (
    <Card className="issue-card">
      <CardContent>
        <Typography variant="h6" color="primary" fontWeight="bold">
          {issue.message}
        </Typography>
        <Divider className="divider" />
        <Typography color="textSecondary" gutterBottom>
          <strong>File:</strong> {issue.component} (Line: {issue.line})
        </Typography>
        <Typography color="textSecondary">
          <strong>Rule:</strong> {issue.rule}
        </Typography>

        <Chip
          label={issue.severity}
          color={issue.severity === 'MAJOR' ? 'error' : 'warning'}
          size="small"
          className="severity-chip"
        />
        {issue.pr && (
          <>
          <Typography color="textSecondary">
            <strong>PR:</strong> 
          </Typography>
          <Typography color="textSecondary">
            <strong>{issue.pr}</strong>
          </Typography>
          </>
        )}

         <Button
          variant="outlined"
          color="primary"
          onClick={toggleModal}
          fullWidth
          sx={{ mt: 2 }}
        >
          Show Preview
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleFixIssue}
          fullWidth
          sx={{ mt: 2 }}
        >
          Fix Issue
        </Button>

        <CustomModal isOpen={isModalOpen} onClose={toggleModal}>
          <CodeDiffViewer code1={codeVersion1} code2={codeVersion2} />
        </CustomModal>
      </CardContent>
    </Card>
  );
}

export default IssueCard;
