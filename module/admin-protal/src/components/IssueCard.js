import { Card, CardContent, Typography, Button, Divider, Chip, Box } from '@mui/material';
import React, { useState } from 'react';
import CustomModal from './Modal';
import CodeDiffViewer from './CodeDiffViewerDialog';

function IssueCard({ issue, onFixIssue, isProcessing }) {

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

        {/* Severity and Type Labels - Show below the buttons */}
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 1 }}>
          {issue.severity && (
            <Chip
              label={issue.severity}
              color={issue.severity === 'CRITICAL' ? 'error' : 'warning'}
              size="small"
              sx={{ alignSelf: 'flex-start' }}
            />
          )}
          {issue.type && (
            <Chip
              label={issue.type}
              color="default"
              size="small"
              sx={{
                alignSelf: 'flex-start',
                backgroundColor: '#FFCC00',
                color: '#000',
              }}
            />
          )}
        </Box>

        {/* Fix Issue Button */}
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
          color={issue.isFixed ? 'success' : 'secondary'}
          onClick={handleFixIssue}
          fullWidth
          sx={{ mt: 2 }}
          disabled={issue.isFixed || isProcessing} // Disable if issue is fixed or processing
        >
          {isProcessing ? 'Processing...' : issue.isFixed ? 'Fixed' : 'Fix Issue'}
        </Button>

        {/* PR Link Button */}
        {issue.pr && (
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 2 }}
            href={issue.pr}
            target="_blank"
            fullWidth
          >
            View MR
          </Button>
        )}
        <CustomModal isOpen={isModalOpen} onClose={toggleModal}>
          <CodeDiffViewer code1={codeVersion1} code2={codeVersion2} />
        </CustomModal>
      </CardContent>
    </Card>
  );
}

export default IssueCard;
