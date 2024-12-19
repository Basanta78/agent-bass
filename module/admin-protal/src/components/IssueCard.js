import { Card, CardContent, Typography, Button, Divider, Chip } from '@mui/material';

function IssueCard({ issue, onFixIssue }) {
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
          variant="contained"
          color="secondary"
          onClick={handleFixIssue}
          fullWidth
          sx={{ mt: 2 }}
        >
          Fix Issue
        </Button>
      </CardContent>
    </Card>
  );
}

export default IssueCard;
