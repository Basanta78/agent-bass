import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, CardContent, Typography, Button, Divider, Chip, Box } from '@mui/material';

import CustomModal from './Modal';
import CodeDiffViewer from './CodeDiffViewerDialog';

function IssueCard({ issue, onFixIssue, isProcessing }) {

  // Code sample
  const [codeVersion1, setCodeVersion1] = useState(`// Initial code version
    function sayHello() {
        console.log("Hello, world!");
    }`);

  const [codeVersion2, setCodeVersion2] = useState(`// Updated code version
    function sayHello(name) {
        console.log("Hello, " + name + "!");
    }`);

  const [file, setFile] = useState('file');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Processing states
  const [previewProcessing, setPreviewProcessing] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleFixIssue = () => {
    onFixIssue(issue);
  };

  const handleShowPreview = async () => {
    setPreviewProcessing(true); // Start processing
    toast.info('PR creation in progress!!');
    try {
      const url = 'http://localhost:5000/api/previewfix'; // Replace with your API endpoint
      const data = {
        "key": issue.key,
        "component": issue.component,
        "line": issue.line,
        "message": issue.message,
        "repoName": issue.project
      }

      const { data: response } = await axios.post(url, data);
      console.log('Response:', response);
      toast.success('Preview generated successfully!!');
      setCodeVersion1(response.data?.contentPreview ?? '');
      setCodeVersion2(response.newData);
      setFile(response.data?.path ?? 'file');
      toggleModal();
    } catch (error) {
      toast.error('Failed to create Preview. Please try again!');
    } finally {
      setPreviewProcessing(false); // Stop processing
    }
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

        <Button
          variant="outlined"
          color="primary"
          onClick={handleShowPreview}
          fullWidth
          sx={{ mt: 2 }}
          disabled={previewProcessing} // Disable if processing
        >
          {previewProcessing ? 'Processing Preview...' : 'Show Preview'}
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
