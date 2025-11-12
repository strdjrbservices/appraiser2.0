import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Paper,
  Alert,
  Stack,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import uploadSoundFile from '../../Assets/upload.mp3';
import successSoundFile from '../../Assets/success.mp3';
import errorSoundFile from '../../Assets/error.mp3';

const playSound = (soundType) => {
  let soundFile;
  if (soundType === 'success') {
    soundFile = successSoundFile;
  } else if (soundType === 'error') {
    soundFile = errorSoundFile;
  } else if (soundType === 'upload') {
    soundFile = uploadSoundFile;
  } else {
    return;
  }

  try {
    const audio = new Audio(soundFile);
    audio.play().catch(e => console.error("Error playing sound:", e));
  } catch (e) {
    console.error("Error playing sound:", e);
  }
};

// Local EditableField component for the Compare page to avoid dependency on complex validation logic.
const SimpleEditableField = ({ fieldPath, value, onDataChange, editingField, setEditingField, isEditable }) => {
  const isEditing = isEditable && editingField && JSON.stringify(editingField) === JSON.stringify(fieldPath);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setEditingField(null);
    }
  };

  if (isEditing) {
    return (
      <TextField
        value={value || ''}
        onChange={(e) => onDataChange(fieldPath, e.target.value)}
        onBlur={() => setEditingField(null)}
        onKeyDown={handleKeyDown}
        autoFocus
        fullWidth
        size="small"
        variant="standard"
      />
    );
  }

  return (
    <Box onClick={() => isEditable && setEditingField(fieldPath)} sx={{ minHeight: '24px', cursor: isEditable ? 'pointer' : 'default' }}>
      {value}
    </Box>
  );
};

// Helper function to normalize currency values for accurate comparison
const normalizeCurrencyValue = (value) => {
  if (typeof value !== 'string' || value === 'Not Found') {
    return NaN; // Return NaN for non-strings or 'Not Found' to indicate it's not a comparable number
  }
  // Remove currency symbols, commas, and any non-numeric characters except for the decimal point and a leading minus sign
  const cleanedValue = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleanedValue);
};
const Compare = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [htmlFile, setHtmlFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [comparisonMode, setComparisonMode] = useState('pdf-html'); // 'pdf-html' or 'pdf-pdf'
  const [oldPdfFile, setOldPdfFile] = useState(null);
  const [newPdfFile, setNewPdfFile] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
  const [oldPdfPageCount, setOldPdfPageCount] = useState(null);
  const [newPdfPageCount, setNewPdfPageCount] = useState(null);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (response && response.comparison_results) {
      setComparisonData(response.comparison_results);
    } else {
      setComparisonData([]);
    }
  }, [response]);

  useEffect(() => {
    if (error) {
      playSound('error');
    }
  }, [error]);

  useEffect(() => {
    if (response) {
      playSound('success');
    }
  }, [response]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handlePdfFileChange = (event) => {
    setPdfFile(event.target.files[0]);
    setError('');
    setResponse(null);
    setOldPdfPageCount(null);
    setNewPdfPageCount(null);
  };

  const handleOldPdfFileChange = (event) => {
    setOldPdfFile(event.target.files[0]);
    setError('');
    setResponse(null);
    setOldPdfPageCount(null);
    setNewPdfPageCount(null);
  };

  const handleNewPdfFileChange = (event) => {
    setNewPdfFile(event.target.files[0]);
    setError('');
    setResponse(null);
    setOldPdfPageCount(null);
    setNewPdfPageCount(null);
  };

  const handleHtmlFileChange = (event) => {
    setHtmlFile(event.target.files[0]);
    setError('');
    setResponse(null);
    setOldPdfPageCount(null);
    setNewPdfPageCount(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);
    setTimer(0); // Reset timer
    if (timerRef.current) { // Clear any existing timer
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => { // Start new timer
      setTimer(prev => prev + 1);
    }, 1000);

    const formData = new FormData();
    let endpoint = '';

    if (comparisonMode === 'pdf-html') {
      if (!pdfFile || !htmlFile) {
        setError('Both PDF and HTML files must be provided for this comparison.');
        setLoading(false);
        return;
      }
      formData.append('pdf_file', pdfFile);
      formData.append('html_file', htmlFile);
      endpoint = 'http://localhost:8000/compare';
    } else { // pdf-pdf
      if (!oldPdfFile || !newPdfFile) {
        setError('Both Old and New PDF files must be provided for this comparison.');
        setLoading(false);
        return;
      }
      formData.append('old_pdf_file', oldPdfFile);
      formData.append('new_pdf_file', newPdfFile);
      endpoint = 'http://localhost:8000/compare-pdfs';
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      // Defensive parsing: get text first, then parse.
      const rawText = await res.text();

      if (!res.ok) {
        // Try to parse error from text, fallback to status.
        let errorDetail = `HTTP error! status: ${res.status}`;
        try {
          const errorJson = JSON.parse(rawText);
          errorDetail = errorJson.detail || errorDetail;
        } catch (parseError) {
          // If parsing fails, the raw text might be the error message
          errorDetail = rawText || errorDetail;
        }
        throw new Error(errorDetail);
      }

      const result = JSON.parse(rawText);
      setResponse(result);
      if (comparisonMode === 'pdf-pdf' && result) {
        setOldPdfPageCount(result.old_pdf_page_count);
        setNewPdfPageCount(result.new_pdf_page_count);
      }

    } catch (e) {
      // If the error is a generic network error, show a generic message.
      // Otherwise, show the specific error message from the backend.
      const errorMessage = e.message.includes('Failed to fetch') ? 'Could not connect to the server. Please ensure it is running.' : e.message;
      console.error('Comparison failed:', e);
    } finally {
      setLoading(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setComparisonMode(newMode);
      setResponse(null);
      setError('');
      setPdfFile(null);
      setHtmlFile(null);
      setOldPdfFile(null);
      setNewPdfFile(null);
      setOldPdfPageCount(null);
      setNewPdfPageCount(null);
    }
  };

  const renderPdfToPdfResponse = (data) => {
    if (!data) return null;

    const comparisonSummary = data?.comparison_summary || [];
    const summaryText = data?.summary || '';

    // Helper function to safely extract the market value
    const oldMarketValueRaw = data.old_market_value || 'Not Found';
    const newMarketValueRaw = data.new_market_value || 'Not Found';

    // Normalize values for comparison
    const normalizedOldMarketValue = normalizeCurrencyValue(oldMarketValueRaw);
    const normalizedNewMarketValue = normalizeCurrencyValue(newMarketValueRaw);

    // Determine if market values match, considering 'Not Found' as a match if both are 'Not Found'
    const areMarketValuesMatching = (oldMarketValueRaw === 'Not Found' && newMarketValueRaw === 'Not Found') ||
      (!isNaN(normalizedOldMarketValue) && !isNaN(normalizedNewMarketValue) &&
        normalizedOldMarketValue === normalizedNewMarketValue);

    if (comparisonSummary.length === 0) {
      return (
        <Alert severity="success" sx={{ mt: 3 }}>
          No differences were found between the two PDF documents.
        </Alert>
      );
    }

    return (
      <Paper elevation={1} sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Verification Results</Typography>
        {summaryText && (
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderLeft: 5, borderColor: 'primary.main', bgcolor: 'action.hover' }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
              {summaryText}
            </Typography>
          </Paper>
        )}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Old PDF Page Count</Typography>
              <Typography variant="h6">{oldPdfPageCount || 'N/A'}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">New PDF Page Count</Typography>
              <Typography variant="h6">{newPdfPageCount || 'N/A'}</Typography>
            </Paper>
          </Grid>
        </Grid>
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: areMarketValuesMatching ? 'success.light' : 'error.light' }}>
          <Typography variant="h6" gutterBottom>Opinion of Market Value Comparison</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography>Old Value: <strong>{oldMarketValueRaw}</strong></Typography>
            <Divider orientation="vertical" flexItem />
            <Typography>New Value: <strong>{newMarketValueRaw}</strong></Typography>
            {areMarketValuesMatching ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
          </Stack>
        </Paper>

        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="comparison table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Field Changed</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Original Value</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Revised Value</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Comment</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Page</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comparisonSummary.map((change, index) => (
                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">{change.field}</TableCell>
                  <TableCell>{change.original_value}</TableCell>
                  <TableCell>{change.revised_value}</TableCell>
                  <TableCell>{change.comment}</TableCell>
                  <TableCell align="right">{change.page_no}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  return (
    <Paper elevation={3} sx={{ p: 4, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        File Comparison
      </Typography>
      <ToggleButtonGroup
        color="primary"
        value={comparisonMode}
        exclusive
        onChange={handleModeChange}
        aria-label="Comparison Mode"
        sx={{ mb: 3 }}
      >
        <ToggleButton value="pdf-html">PDF/HTML</ToggleButton>
        <ToggleButton value="pdf-pdf">PDF/PDF</ToggleButton>
      </ToggleButtonGroup>

      <form onSubmit={handleSubmit}>
        {comparisonMode === 'pdf-html' && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>PDF Version</Typography>
              <Stack spacing={2}>
                <Button variant="outlined" component="label">
                  Upload PDF File
                  <input type="file" hidden accept=".pdf,application/pdf" onChange={handlePdfFileChange} />
                </Button>
                {pdfFile && <Typography variant="body2">Selected: {pdfFile.name}</Typography>}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>HTML Version</Typography>
              <Stack spacing={2}>
                <Button variant="outlined" component="label">
                  Upload HTML File
                  <input type="file" hidden accept=".html,text/html" onChange={handleHtmlFileChange} />
                </Button>
                {htmlFile && <Typography variant="body2">Selected: {htmlFile.name}</Typography>}
              </Stack>
            </Grid>
          </Grid>
        )}

        {comparisonMode === 'pdf-pdf' && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Old PDF Version</Typography>
              <Stack spacing={2}>
                <Button variant="outlined" component="label">
                  Upload Old PDF
                  <input type="file" hidden accept=".pdf,application/pdf" onChange={handleOldPdfFileChange} />
                </Button>
                {oldPdfFile && <Typography variant="body2">Selected: {oldPdfFile.name}</Typography>}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>New PDF Version</Typography>
              <Stack spacing={2}>
                <Button variant="outlined" component="label">
                  Upload Revised PDF
                  <input type="file" hidden accept=".pdf,application/pdf" onChange={handleNewPdfFileChange} />
                </Button>
                {newPdfFile && <Typography variant="body2">Selected: {newPdfFile.name}</Typography>}
              </Stack>
            </Grid>
          </Grid>
        )}

        <Box sx={{ position: 'relative', mt: 2 }}>
          <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth>
            {loading ? <CircularProgress size={24} /> : 'Compare'}
          </Button>
          {loading && (
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
              Elapsed Time: {timer}s
            </Typography>
          )}
        </Box>
      </form>

      {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

      {response && comparisonMode === 'pdf-pdf' && renderPdfToPdfResponse(response)}

      {response && comparisonMode === 'pdf-html' && (
        <>
          {response.comparison_results && (
            <Paper elevation={1} sx={{ p: 2, mt: 3, bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom>Comparison Result</Typography>
              {response.comparison_results.length > 0 ? (
                <TableContainer>
                  <Table stickyHeader aria-label="comparison results table">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Field</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Value from HTML</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Value from PDF</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {comparisonData.map((item, index) => {
                        // Ensure we are working with strings, defaulting null/undefined to empty string.
                        const htmlValue = (item.html_value === null || item.html_value === undefined) ? '' : String(item.html_value);
                        const pdfValue = (item.pdf_value === null || item.pdf_value === undefined) ? '' : String(item.pdf_value);

                        // Start with the status from the backend.
                        let isMatch = item.status === 'Match';

                        // Normalize strings for robust comparison.
                        const normalize = (str) => {
                          if (typeof str !== 'string') {
                            return '';
                          }

                          let normalizedStr = str.toLowerCase();

                          // 1. Unicode normalization (e.g., to handle accented characters)
                          // Convert to NFD (Canonical Decomposition) and remove diacritics
                          normalizedStr = normalizedStr.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                          // 2. Replace common address abbreviations using word boundaries
                          const abbreviations = {
                            'ave': 'avenue', 'st': 'street', 'rd': 'road', 'dr': 'drive',
                            'blvd': 'boulevard', 'ln': 'lane', 'pl': 'place',
                            'cir': 'circle', 'pkwy': 'parkway', 'ter': 'terrace',
                            // State abbreviations
                            'al': 'alabama', 'ak': 'alaska', 'az': 'arizona', 'ar': 'arkansas', 'ca': 'california',
                            'co': 'colorado', 'ct': 'connecticut', 'de': 'delaware', 'fl': 'florida', 'ga': 'georgia',
                            'hi': 'hawaii', 'id': 'idaho', 'il': 'illinois', 'in': 'indiana', 'ia': 'iowa',
                            'ks': 'kansas', 'ky': 'kentucky', 'la': 'louisiana', 'me': 'maine', 'md': 'maryland',
                            'ma': 'massachusetts', 'mi': 'michigan', 'mn': 'minnesota', 'ms': 'mississippi',
                            'mo': 'missouri', 'mt': 'montana', 'ne': 'nebraska', 'nv': 'nevada', 'nh': 'newhampshire',
                            'nj': 'newjersey', 'nm': 'newmexico', 'ny': 'newyork', 'nc': 'northcarolina',
                            'nd': 'northdakota', 'oh': 'ohio', 'ok': 'oklahoma', 'or': 'oregon', 'pa': 'pennsylvania',
                            'ri': 'rhodeisland', 'sc': 'southcarolina', 'sd': 'southdakota', 'tn': 'tennessee',
                            'tx': 'texas', 'ut': 'utah', 'vt': 'vermont', 'va': 'virginia', 'wa': 'washington',
                            'wv': 'westvirginia', 'wi': 'wisconsin', 'wy': 'wyoming',
                            // Other common terms
                            'apt': 'apartment', 'bldg': 'building', 'dept': 'department', 'fl': 'floor',
                            'ste': 'suite', 'unit': 'unit'
                          };
                          // Replace abbreviations using word boundaries to avoid replacing parts of words
                          for (const [abbr, full] of Object.entries(abbreviations)) {
                            normalizedStr = normalizedStr.replace(new RegExp(`\\b${abbr}\\b`, 'g'), full);
                          }
                          // Remove all spaces and non-alphanumeric characters
                          return normalizedStr.replace(/[\s\W_]/g, '');
                        };

                        const normalizedHtml = normalize(htmlValue);
                        const normalizedPdf = normalize(pdfValue);

                        if (item.field === 'Property Address') {
                          // Special check for Property Address: match if the first word/number is the same.
                          const getFirstWord = (str) => (str || '').toLowerCase().replace(/[^\w\s]/g, '').trim().split(/\s+/)[0] || '';
                          const htmlFirstWord = getFirstWord(htmlValue);
                          const pdfFirstWord = getFirstWord(pdfValue);
                          // Match if both have a first word and they are identical.
                          isMatch = htmlFirstWord && pdfFirstWord && htmlFirstWord === pdfFirstWord;
                        } else {
                          // For other fields, check for an exact match or if one contains the other.
                          isMatch = normalizedHtml === normalizedPdf || normalizedHtml.includes(normalizedPdf) || normalizedPdf.includes(normalizedHtml);
                        }

                        const handleDataChange = (path, newValue) => {
                          setComparisonData(prevData => {
                            const newData = [...prevData];
                            newData[path[0]][path[1]] = newValue;
                            return newData;
                          });
                        };

                        return (
                          <TableRow key={index} hover>
                            <TableCell><SimpleEditableField fieldPath={[index, 'field']} value={item.field} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={true} /></TableCell>
                            <TableCell><SimpleEditableField fieldPath={[index, 'html_value']} value={item.html_value} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={true} /></TableCell>
                            <TableCell><SimpleEditableField fieldPath={[index, 'pdf_value']} value={item.pdf_value} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={true} /></TableCell>
                            <TableCell align="center">
                              {isMatch ? (
                                <Chip icon={<CheckCircleIcon />} label="Match" color="success" size="small" />
                              ) : (
                                <Chip icon={<CancelIcon />} label="Mismatch" color="error" size="small" />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="success" sx={{ mt: 2 }}>
                  No differences found between the two documents.
                </Alert>
              )}
            </Paper>)}
        </>
      )}
      {/* {response && !response.comparison_results && (
        <Paper elevation={1} sx={{ p: 2, mt: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" gutterBottom>Comparison Result</Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            The comparison result was not in the expected format. Raw response:
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </Alert>
        </Paper>
      )} */}
    </Paper>
  );
};

export default Compare;
