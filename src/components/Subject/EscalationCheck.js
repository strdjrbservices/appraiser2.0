import React, { useCallback } from 'react';
import {
  Button,
  CircularProgress,
  Paper,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
} from '@mui/material';

export const ESCALATION_CHECK_PROMPT = `Analyze the appraisal report based on the following escalation rules. Your output must be a single, clean JSON object with a "summary" (a one to two-line overview of findings) and a "details" array. Each object in the "details" array should have "requirement", "status" ('Needs Escalation' or 'OK'), and "value_or_comment" keys.

Escalation Rules (Please advise on below point:):
1. Assignment Type Mismatch: If order form indicates ‘Purchase’ but report is marked ‘Refinance’, or vice-versa.
2. Appraisal Type Mismatch: If order form shows '1004+1007' but report is '1025'.
3. Appraiser Mismatch: If order form appraiser name differs from the completing appraiser in the report.
4. Repairs vs. As-Is: If photos or comments show multiple repairs but the report is made 'As-is'.
5. Supervisory Appraiser Signature: If the appraiser on the order form signs as the supervisory appraiser.
6. Missing Revisions: If latest revision requests are not reflected in the report.
7. Lender/Client Name Change: If the lender/client name is changed in the report (e.g., from “Easy Street Capital” to “National Loan Funder”).
8. Appraiser Fee Mismatch: If the appraiser’s fee in the report does not match the engagement letter.
9. Neighborhood Condition Comment: If the Neighborhood section comment contains potentially negative words like "*average* condition".
10. Value vs. Price: If the final value is higher than list price, purchase price, and prior sale price.
11. 1004D Mismatch: If order form shows ‘1004D Final Inspection/Appraisal Update’ but report is only one of them, or vice-versa.
12. Loan/Appraisal Type Conflict: If order form loan type (e.g., USDA) conflicts with appraisal type (e.g., 1004 FHA).
13. Illegal Use: If the property is marked as 'Illegal'.
14. Multiple Kitchens: If a 1004 report shows 3+ kitchens, check for comments on whether they are permitted.
15. Inspection/Effective Date Mismatch: If inspection date from records differs from the report's effective date.
16. Value vs. Unadjusted Sales Price: If final value is more than 10% higher than the unadjusted sales price.
17. Drastic Grid Adjustments: If sales grid adjustments are drastic.
18. Commercial Location in Sales Grid: If a comparable's location is marked "Commercial".
19. Value Higher than Purchase Price: If appraised value is higher than the purchase price.
20. Value Increase Since Prior Sale: If there's an increase in value since the subject's prior sale.
21. Duplicate Addresses: If the subject address is the same as any comparable sale or rental comparable.
22. Highest and Best Use 'NO': If 'Highest and best use' is marked 'NO'.
23. Physical Deficiencies 'YES' but 'As-Is': If 'Physical deficiencies' is marked 'YES' but the report is made 'as-is'.
`;

const EscalationCheck = ({ onPromptSubmit, loading, response, error }) => {
  const handleCheck = () => {
    onPromptSubmit(ESCALATION_CHECK_PROMPT);
  };

  const renderResponse = useCallback(() => {
    if (!response) return null;

    let data = response;
    if (typeof response === 'string') {
      try {
        data = JSON.parse(response);
      } catch (e) {
        return <pre>{response}</pre>;
      }
    }

    const summary = data?.summary ?? 'No summary available.';
    const details = Array.isArray(data?.details) ? data.details : [];

    return (
      <Stack spacing={3} sx={{ mt: 3 }}>
        <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant="h6" gutterBottom component="div" color="primary.main">Summary</Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{summary}</Typography>
        </Paper>
        {details.length > 0 && (
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom component="div" color="primary.main">Details</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Sr. No.</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Requirement</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Value / Comment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {details.map((item, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        backgroundColor: item.status === 'Needs Escalation' ? 'error.light' : 'inherit',
                      }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.requirement}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>{item.value_or_comment}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Stack>
    );
  }, [response]);

  return (
    <div id="escalation-check-section" className="card shadow mb-4">
      <div className="card-header CAR1 bg-danger text-white">
        <strong>Escalation Check</strong>
      </div>
      <div className="card-body">
        <Stack spacing={2}>
          <Button
            onClick={handleCheck}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Run Escalation Check'}
          </Button>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {response && renderResponse()}
        </Stack>
      </div>
    </div>
  );
};

export default EscalationCheck;