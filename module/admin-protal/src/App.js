import React from 'react';
import { Card, CardContent, Typography, Button, Divider, Chip } from '@mui/material';

function IssueCard({ issue, onCreateMR }) {
  const handleCreateMR = () => {
    onCreateMR(issue);
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

        <Button
          variant="contained"
          color="secondary"
          onClick={handleCreateMR}
          fullWidth
          sx={{ mt: 2 }}
        >
          Create Merge Request
        </Button>
      </CardContent>
    </Card>
  );
}

export default IssueCard;
