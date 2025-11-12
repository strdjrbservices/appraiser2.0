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

export const STATE_REQUIREMENTS_PROMPT = `
Based on the property's state, verify the following state-specific appraisal requirements from the document.
For each requirement, indicate if it is "Fulfilled", "Not Fulfilled", or "Not Applicable". Provide the extracted value or a brief comment.
The output must be a JSON object with a "summary" (a one to two-line overview) and a "details" array. Each object in the "details" array should have "requirement", "status", and "value_or_comment" keys.

State-Specific Requirements:
- Appraiser’s fee disclosed: Required for AZ, CO, CT, GA, IL, LA, NJ, NV, NM, ND, OH, UT, VA, VT, WV.
- AMC License # included: Required for GA, IL, MT, NJ, OH, VT.
- AMC License # and expiration date: Required for IL (e.g., "558000312, Exp: 12/31/2026").
- AMC fee included: Required for NV, NM, UT.
- Smoke/CO detectors & double-strapped water heater comment: Required for CA.
- CO detector comment for properties built after 2008: Required for CA.
- Appraiser’s fee & AMC License # required: Required for GA.
- Illinois specific requirements:
  1. AMC License # 558000312 and Expiration 12/31/2026.
  2. Appraiser must disclose fee.
  3. Include Illinois Administrative Code 1455.245 statement in the addendum.
  4. Comment on Carbon Monoxide detector presence and provide photos.
- Utah specific requirements:
  1. Comment on double-strapped water heaters.
  2. AMC fee must be included.
  3. Appraiser’s fee must be disclosed.
- Virginia specific requirements: Confirm if smoke and CO detectors are installed.
- Wisconsin specific requirements:
  1. Attach a copy of the invoice.
  2. Confirm CO detector installation per Wis. Stat. Ann. § 101.647.
- New York specific requirements: Invoice copy should be included (except for Plaza Home Mortgage).
`;

const StateRequirementCheck = ({ onPromptSubmit, loading, response, error }) => {
  const handleCheckRequirements = () => {
    onPromptSubmit(STATE_REQUIREMENTS_PROMPT);
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

    const { summary, details } = data;

    return (
      <Stack spacing={3} sx={{ mt: 3 }}>
        {/* Summary Section */}
        {summary && (
          <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom component="div" color="primary.main">
              Summary
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {summary}
            </Typography>
          </Paper>
        )}

        {/* Details Table */}
        {details && Array.isArray(details) && (
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom component="div" color="primary.main">
              Details
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Requirement</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Value / Comment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {details.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.requirement}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>
                        {/* ✅ Handle both string and object safely */}
                        {typeof item.value_or_comment === 'object' && item.value_or_comment !== null ? (
                          <>
                            {item.value_or_comment.value && (
                              <Typography variant="body2">{item.value_or_comment.value}</Typography>
                            )}
                            {item.value_or_comment.page_no && (
                              <Typography variant="caption" color="text.secondary">
                                Page: {item.value_or_comment.page_no}
                              </Typography>
                            )}
                          </>
                        ) : (
                          item.value_or_comment
                        )}
                      </TableCell>
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
    <div id="state-requirement-section" className="card shadow mb-4">
      <div className="card-header CAR1 bg-primary text-white">
        <strong>State Requirement Check</strong>
      </div>
      <div className="card-body">
        <Stack spacing={2}>
          <Button
            onClick={handleCheckRequirements}
            variant="contained"
            color="secondary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Check State Requirements'}
          </Button>

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {response && renderResponse()}
        </Stack>
      </div>
    </div>
  );
};

export default StateRequirementCheck;
