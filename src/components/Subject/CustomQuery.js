import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Paper,
  Alert,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
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

const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
  const timeout = 60000; // 60 seconds timeout
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);

      if (res.status < 500) {
        return res;
      }
      console.warn(`Attempt ${i + 1}: Server error ${res.status}. Retrying in ${delay / 1000}s...`);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn(`Attempt ${i + 1}: Request timed out. Retrying in ${delay / 1000}s...`);
      } else {
        console.warn(`Attempt ${i + 1}: Network error. Retrying in ${delay / 1000}s...`, error);
      }
    }
    if (i < retries - 1) {
      await new Promise(resolve => setTimeout(resolve));
      delay *= 2; // Exponential backoff
    }
  }
  throw new Error(`Failed to fetch from ${url} after ${retries} attempts.`);
};

const CustomQuery = () => {
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState('');
  const [formType, ] = useState('1004'); // Default form type
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setError('');
    setResponse(null);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Please upload a PDF file.');
      return;
    }
    if (!comment.trim()) {
      setError('Please enter a query or comment.');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('form_type', formType);
    formData.append('comment', comment);

    try {
      const res = await fetchWithRetry('http://localhost:8000/extract/', {
        method: 'POST',
        body: formData,
      });

      const text = await res.text(); // res can be undefined if all retries fail

      if (!res.ok) {
        throw new Error(text || `HTTP error! status: ${res.status}`);
      }

      // Try to parse server reply as JSON. If it fails, treat it as plain text.
      try {
        const parsedJson = JSON.parse(text);
        setResponse(parsedJson);
      } catch (err) {
        // If it's not JSON, wrap it in a format that can be rendered.
        setResponse({ rawText: text });
      }
    } catch (e) {
      setError(e.message || 'An unexpected error occurred.');
      console.error('Extraction failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const renderResponse = () => {
    if (!response) return null;

    // Handle raw text response
    if (response.rawText) {
      return (
        <Paper elevation={1} sx={{ p: 2, mt: 3, whiteSpace: 'pre-wrap', bgcolor: 'grey.100' }}>
          <Typography variant="body1">{response.rawText}</Typography>
        </Paper>
      );
    }

    // Determine the data to be rendered in the table
    let dataToRender = [];
    let summary = null;

    if (Array.isArray(response)) {
      dataToRender = response;
    } else if (response.details && Array.isArray(response.details)) {
      dataToRender = response.details;
      summary = response.summary;
    } else if (response.fields && typeof response.fields === 'object') {
      summary = response.fields.summary;
      dataToRender = Object.entries(response.fields)
        .filter(([key]) => key !== 'summary')
        .map(([key, val], index) => ({
          'sr_no': index + 1,
          'description': key.replace(/_/g, ' '),
          'final_output': typeof val === 'object' && val !== null ? val.value : val,
        }));
    }

    if (dataToRender.length > 0) {
      return (
        <Paper elevation={1} sx={{ p: 2, mt: 3 }}>
          {summary && (
            <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: 'action.hover' }}>
              <Typography variant="h6" gutterBottom>Summary</Typography>
              <Typography variant="body1">{summary}</Typography>
            </Paper>
          )}
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="custom query response table">
              <TableHead>
                <TableRow>
                  {Object.keys(dataToRender[0]).map((key) => (
                    <TableCell key={key} sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                      {key.replace(/_/g, ' ')}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {dataToRender.map((item, index) => (
                  <TableRow key={index}>
                    {Object.values(item).map((value, cellIndex) => (
                      <TableCell key={cellIndex}>{value || 'N/A'}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      );
    }

    // Fallback for other object structures
    return (
      <Paper elevation={1} sx={{ p: 2, mt: 3, whiteSpace: 'pre-wrap', bgcolor: 'grey.100' }}>
        <pre>{JSON.stringify(response, null, 2)}</pre>
      </Paper>
    );
  };

  return (
    <Paper elevation={3} sx={{ p: 4, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        Custom PDF Query
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Button
            variant="contained"
            component="label"
          >
            Upload Revised / Updated PDF
            <input
              type="file"
              hidden
              accept=".pdf"
              onChange={handleFileChange}
            />
          </Button>
          {file && <Typography variant="body2">Selected: {file.name}</Typography>}

          {/* <FormControl fullWidth>
            <InputLabel id="form-type-label">Form Type</InputLabel>
            <Select
              labelId="form-type-label"
              value={formType}
              label="Form Type"
              onChange={handleFormTypeChange}
            >
              <MenuItem value="1004">1004</MenuItem>
              <MenuItem value="1073">1073</MenuItem>
              <MenuItem value="1007">1007</MenuItem>
            </Select>
          </FormControl> */}

          <TextField
            label="Enter your query or comment"
            multiline
            rows={4}
            value={comment}
            onChange={handleCommentChange}
            variant="outlined"
            fullWidth
            required
          />

          <Box sx={{ position: 'relative' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !file}
              fullWidth
            >
              Extract Information
            </Button>
            {loading && (
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </Box>
        </Stack>
      </form>

      {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

      {response && renderResponse()}
    </Paper>
  );
};

export default CustomQuery;
