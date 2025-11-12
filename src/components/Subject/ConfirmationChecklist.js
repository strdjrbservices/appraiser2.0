import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Alert,
  Grid,
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

const CHECKLIST_PROMPT = `Appraisal Report Confirmation Checklist

Please confirm the appraised value has been changed.

Please confirm if the unadjusted value is bracketed with the appraised value.

Please confirm if the adjusted value is bracketed with the appraised value.

Please confirm the Aerial Map, Location Map, UAD Dataset Pages, and 1004MC are present, and that there are no changes from the old report.

Please confirm the GLA, total room count, bath count, and bed count from the Improvements section match the Sales Grid, Photos, and Sketch.

Please confirm if the 1007 form is present in the new report.

For each item in the checklist, provide a 'yes' or 'no' answer in the 'final_output' field. The response should be a JSON object with a 'details' array. Each object in the array should have 'sr_no', 'description', 'old_pdf', 'new_pdf', and 'final_output' keys.
`;

const ConfirmationChecklist = () => {
  const [oldPdfFile, setOldPdfFile] = useState(null);
  const [newPdfFile, setNewPdfFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (error) playSound('error');
  }, [error]);

  useEffect(() => {
    if (response) playSound('success');
  }, [response]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleFileChange = (setter) => (event) => {
    setter(event.target.files[0]);
    setError('');
    setResponse(null);
    if (event.target.files[0]) playSound('upload');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!oldPdfFile || !newPdfFile) {
      setError('Please provide both PDF files.');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);
    setTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);

    const formData = new FormData();
    formData.append('old_pdf_file', oldPdfFile);
    formData.append('new_pdf_file', newPdfFile);
    formData.append('revision_request', CHECKLIST_PROMPT);

    try {
      const res = await fetch('http://localhost:8000/compare-pdfs', {
        method: 'POST',
        body: formData,
      });

      const rawText = await res.text();
      if (!res.ok) {
        throw new Error(rawText || `HTTP error! status: ${res.status}`);
      }

      const result = JSON.parse(rawText);
      setResponse(result);
    } catch (e) {
      const errorMessage = e.message.includes('Failed to fetch') ? 'Could not connect to the server. Please ensure it is running.' : e.message;
      setError(errorMessage);
    } finally {
      setLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const renderResponse = (data) => {
    if (!data || !data.details || data.details.length === 0) return null;

    return (
      <Paper elevation={1} sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Confirmation Checklist Results</Typography>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="confirmation table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Sr No</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Old PDF</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>New PDF</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Final Output</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.details.map((item, index) => (
                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{item.sr_no}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.old_pdf}</TableCell>
                  <TableCell>{item.new_pdf}</TableCell>
                  <TableCell>{item.final_output}</TableCell>
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
      <Typography variant="h5" gutterBottom>Appraisal Report Confirmation</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Button variant="outlined" component="label" fullWidth>Upload Old PDF<input type="file" hidden accept=".pdf" onChange={handleFileChange(setOldPdfFile)} /></Button>
            {oldPdfFile && <Typography variant="body2" noWrap>Selected: {oldPdfFile.name}</Typography>}
          </Grid>
          <Grid item xs={12} md={6}>
            <Button variant="outlined" component="label" fullWidth>Upload New PDF<input type="file" hidden accept=".pdf" onChange={handleFileChange(setNewPdfFile)} /></Button>
            {newPdfFile && <Typography variant="body2" noWrap>Selected: {newPdfFile.name}</Typography>}
          </Grid>
        </Grid>
        <Box sx={{ position: 'relative', mt: 2 }}>
          <Button type="submit" variant="contained" color="primary" disabled={loading || !oldPdfFile || !newPdfFile} fullWidth>
            {loading ? <CircularProgress size={24} /> : 'Run Confirmation Check'}
          </Button>
          {loading && <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>Elapsed Time: {timer}s</Typography>}
        </Box>
      </form>
      {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
      {response && renderResponse(response)}
    </Paper>
  );
};

export default ConfirmationChecklist;
