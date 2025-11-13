import React, { useEffect, useRef, useState } from 'react';
import './Subject.css';
import { GlobalStyles } from '@mui/system';
import InfoIcon from '@mui/icons-material/Info';
import { Button, Stack, List, ListItem, ListItemButton, ListItemText, FormControl, InputLabel, Select, MenuItem, IconButton, Tooltip, Paper, Box, Typography, LinearProgress, Alert, Snackbar, Fade, CircularProgress, ThemeProvider, CssBaseline, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid } from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Form1004 from './1004';
import Form1007 from './1007';
import Form1073 from './1073';
import { EditableField } from './FormComponents';
import StateRequirementCheck, { STATE_REQUIREMENTS_PROMPT } from './StateRequirementCheck';
import UnpaidOkCheck, { UNPAID_OK_PROMPT } from './UnpaidOkCheck';
import ClientRequirementCheck, { CLIENT_REQUIREMENT_PROMPT } from './ClientRequirementCheck';
import EscalationCheck, { ESCALATION_CHECK_PROMPT } from './EscalationCheck';
import FhaCheck, { FHA_REQUIREMENTS_PROMPT } from './FhaCheck';
import WarningIcon from '@mui/icons-material/Warning';
import { lightTheme, darkTheme } from '../../theme';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import uploadSoundFile from '../../Assets/upload.mp3';
import successSoundFile from '../../Assets/success.mp3';
import errorSoundFile from '../../Assets/error.mp3';

const TooltipStyles = () => (
  <GlobalStyles styles={{
    '.editable-field-container[style*="--tooltip-message"]': {
      position: 'relative',
      cursor: 'pointer',
    },
    '.editable-field-container[style*="--tooltip-message"]:hover::after': {
      content: 'var(--tooltip-message)',
      position: 'absolute',
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#864242ff',
      color: 'white',
      padding: '5px 10px',

      borderRadius: '4px',
      fontSize: '0.8rem',
      whiteSpace: 'nowrap',
      zIndex: 1000,
      marginBottom: '5px',
    }
  }} />
);

const Sidebar = ({ sections, isOpen, isLocked, onLockToggle, onMouseEnter, onMouseLeave, onSectionClick, onThemeToggle, currentTheme, activeSection }) => (
  <div className={`sidebar ${isOpen ? 'open' : 'closed'}`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
    <div className="sidebar-header">
      <img src={process.env.PUBLIC_URL + '/logo.png'} alt="logo" className="sidebar-logo" />
      <h5 className="sidebar-title">DJRB</h5>
      <Tooltip title={isLocked ? "Unpin Sidebar" : "Pin Sidebar"} placement="right">
        <IconButton onClick={onLockToggle} size="small" className="sidebar-toggle-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isLocked ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </IconButton>
      </Tooltip>
      <Tooltip title="Toggle Dark/Light Theme" placement="right">
        <IconButton onClick={onThemeToggle} size="small" sx={{ color: 'var(--primary-color)', ml: 1 }}>
          {currentTheme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Tooltip>
    </div>
    <List dense>
      {sections.map((section) => (
        <ListItem key={section.id} disablePadding>
          <ListItemButton component="a" href={`#${section.id}`} className={`sidebar-link ${activeSection === section.id ? 'active' : ''}`} onClick={() => onSectionClick(section)}>
            <ListItemText primary={section.title} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
    <div className="sidebar-footer">
      Appraisal Extractor
    </div>
  </div>
);


export const ComparableAddressConsistency = ({ data, comparableSales, extractionAttempted, onDataChange, editingField, setEditingField, isEditable }) => {
  return (
    <div id="comparable-address-consistency-section" style={{}} className="card shadow ">
      <div className="card-header CAR1 bg-dark text-white" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <strong style={{ flexGrow: 1, textAlign: 'center' }}>Comparable Address Consistency Check</strong>
        </div>
      </div>
      <div className="card-body p-0 table-container">
        <table className="table table-hover table-striped mb-0">
          <thead className="table-light">
            <tr>
              <th>Comparable Sale #</th>
              <th>Sales Comparison Approach Address</th>
              <th>Location Map Address</th>
              <th>Photo Section Address</th>
              <th>is label correct?</th>
              <th>duplicate photo?</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {comparableSales.map((sale, index) => {
              const compNum = index + 1;
              const salesGridAddress = data[sale]?.Address || '';
              const locationMapAddress = data[`Location Map Address ${compNum}`] || '';
              const photoAddress = data[`Comparable Photo Address ${compNum}`] || '';
              const matchingPhoto = data[`is label correct? ${compNum}`] || '';
              const duplicatePhoto = data[`duplicate photo? ${compNum}`] || '';

              const getFirstThreeWords = (str) => str.split(/\s+/).slice(0, 3).join(' ').toLowerCase();

              const allAddresses = [salesGridAddress, locationMapAddress, photoAddress];
              const validAddresses = allAddresses.filter(Boolean);

              let isConsistent = false;
              if (validAddresses.length < 2) {
                isConsistent = true;
              } else {
                const shortAddresses = validAddresses.map(getFirstThreeWords);
                const uniqueShortAddresses = new Set(shortAddresses);
                if (uniqueShortAddresses.size < shortAddresses.length) {
                  isConsistent = true;
                }
              }

              const isMissingSalesGrid = extractionAttempted && !salesGridAddress;
              const isMissingLocationMap = extractionAttempted && !locationMapAddress;
              const isMissingPhoto = extractionAttempted && !photoAddress;

              return (
                <tr key={sale}>
                  <td style={{ fontWeight: 'bold' }}>{`Comparable Sale #${compNum}`}</td>
                  <td style={isMissingSalesGrid ? { border: '2px solid red' } : {}}>
                    <EditableField
                      fieldPath={[sale, 'Address']}
                      value={salesGridAddress}
                      onDataChange={onDataChange}
                      editingField={editingField}
                      setEditingField={setEditingField}
                      isMissing={isMissingSalesGrid} isEditable={isEditable}
                    // isEditable={true}
                    />
                  </td>
                  <td style={isMissingLocationMap ? { border: '2px solid red' } : {}}>
                    <EditableField
                      fieldPath={[`Location Map Address ${compNum}`]}
                      value={locationMapAddress}
                      onDataChange={onDataChange}
                      editingField={editingField}
                      setEditingField={setEditingField}
                      isMissing={isMissingLocationMap}
                      isEditable={isEditable}
                    />
                  </td>
                  <td style={isMissingPhoto ? { border: '2px solid red' } : {}}>
                    <EditableField
                      fieldPath={[`Comparable Photo Address ${compNum}`]}
                      value={photoAddress}
                      onDataChange={onDataChange}
                      editingField={editingField}
                      setEditingField={setEditingField}
                      isMissing={isMissingPhoto}
                      isEditable={isEditable}
                    />
                  </td>
                  <td>
                    <EditableField
                      fieldPath={[`is label correct? ${compNum}`]}
                      value={matchingPhoto}
                      onDataChange={onDataChange}
                      editingField={editingField}
                      setEditingField={setEditingField}
                      isEditable={isEditable} />
                  </td>
                  <td>
                    <EditableField
                      fieldPath={[`duplicate photo? ${compNum}`]}
                      value={duplicatePhoto}
                      onDataChange={onDataChange}
                      editingField={editingField}
                      setEditingField={setEditingField}
                      isEditable={isEditable} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {validAddresses.length > 0 && (isConsistent ? <CheckCircleOutlineIcon style={{ color: 'green' }} /> : <ErrorOutlineIcon style={{ color: 'red' }} />)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const MarketConditionsTable = ({ data, marketConditionsRows, marketConditionsFields, extractionAttempted, onDataChange, editingField, setEditingField, isEditable }) => {
  const timeframes = ["Prior 7-12 Months", "Prior 4-6 Months", "Current-3 Months", "Overall Trend"];

  const getTableValue = (fullLabel, timeframe) => {
    const marketData = data?.MARKET_CONDITIONS ?? {};
    const key = `${fullLabel} (${timeframe})`;
    return marketData[key] ?? marketData[fullLabel] ?? '';
  };

  return (
    <TableContainer component={Paper} sx={{ marginTop: '20px', marginBottom: '20px' }}>
      {/* <div className="card-header CAR1 bg-warning text-dark" style={{ position: 'sticky', top: 0, zIndex: 10 }}><strong>Market Conditions Addendum</strong></div> */}
      <Table className="table mb-20" style={{ marginTop: '20px' }} size="small" aria-label="market-conditions-table">
        <TableHead style={{}}>
          <TableRow>
            <TableCell>Inventory Analysis</TableCell>
            {timeframes.map(tf => <TableCell key={tf} align="center">{tf}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {marketConditionsRows.map(row => (
            <TableRow key={row.label}>
              <TableCell component="th" scope="row">
                {row.label}
              </TableCell>
              {timeframes.map(tf => {
                const value = getTableValue(row.fullLabel, tf) || getTableValue(row.label, tf);
                const style = {};
                if (extractionAttempted && !value) {
                  style.border = '2px solid red';
                }
                return <TableCell key={tf} align="center" style={style}>{value}</TableCell>
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box sx={{ p: 2 }}>
        {marketConditionsFields.map(field => {
          // Render only fields that are not part of the table
          if (marketConditionsRows.some(row => row.fullLabel.includes(field) || field.includes(row.fullLabel))) return null;

          return (
            <Box key={field} sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {field}
              </Typography>
              <EditableField
                fieldPath={['MARKET_CONDITIONS', field]}
                value={data?.MARKET_CONDITIONS?.[field] || ''}
                onDataChange={onDataChange}
                editingField={editingField}
                setEditingField={setEditingField}
                isEditable={isEditable}
              />
            </Box>
          );
        })}
      </Box>
    </TableContainer>
  );
};

export const CondoCoopProjectsTable = ({ id, title, data, onDataChange, editingField, setEditingField, isEditable, condoCoopProjectsRows, condoCoopProjectsFields, extractionAttempted }) => {
  const timeframes = ["Prior 7–12 Months", "Prior 4–6 Months", "Current – 3 Months", "Overall Trend"];

  const getTableValue = (fullLabel, timeframe) => {
    const projectData = data?.CONDO_COOP_PROJECTS ?? data ?? {};
    const key = `${fullLabel} (${timeframe})`;
    return projectData[key] ?? '';
  };

  return (
    <div id={id} className="card shadow mb-4">
      <div className="card-header CAR1 bg-primary text-white" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <strong>{title}</strong>
      </div>
      <div className="card-body p-0 table-container">
        <TableContainer component={Paper}>
          <Table size="small" aria-label="condo-coop-projects-table">
            <TableHead>
              <TableRow>
                <TableCell>Subject Project Data</TableCell>
                {timeframes.map(tf => <TableCell key={tf} align="center">{tf}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {condoCoopProjectsRows.map(row => (
                <TableRow key={row.label}>
                  <TableCell component="th" scope="row">{row.label}</TableCell>
                  {timeframes.map(tf => {
                    const fieldName = `${row.fullLabel} (${tf})`;
                    const value = getTableValue(row.fullLabel, tf);
                    const isMissing = extractionAttempted && !value;
                    return (
                      <TableCell key={tf} align="center" style={isMissing ? { border: '2px solid red' } : {}}>
                        <EditableField fieldPath={['CONDO_COOP_PROJECTS', fieldName]} value={value} onDataChange={onDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} isMissing={isMissing} />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

const SalesComparisonSection = ({ data, salesGridRows, comparableSales, extractionAttempted, handleDataChange, editingField, setEditingField, formType, comparisonData, getComparisonStyle, isEditable, allData }) => {
  const getSubjectValue = (row) => {
    const subjectData = data.Subject || {}; let value = subjectData[row.valueKey] ?? subjectData[row.subjectValueKey] ?? data[row.subjectValueKey] ?? data[row.valueKey] ?? ''; return value;
  };

  return (
    <div id="sales-comparison" className="card shadow mb-4">
      <div className="card-header CAR1 bg-dark text-white" style={{ position: 'sticky', top: 0, zIndex: 10 }}>

      </div>
      <div className="card-body p-0 table-container" style={{ overflowX: 'auto' }}>
        <table className="table table-hover table-striped mb-0 sales-comparison-table">
          <thead className="table-light">
            <tr>
              <th style={{ minWidth: '200px' }}>Feature</th>
              <th style={{ minWidth: '200px' }}>Subject</th>
              {comparableSales.map((sale, index) => (
                <th key={sale} style={{ minWidth: '200px' }}>{`Comparable Sale #${index + 1}`}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {salesGridRows.flatMap((row, rowIndex) => {
              const rows = [];
              const subjectValue = getSubjectValue(row);

              rows.push(
                <tr key={`${row.label}-${rowIndex}`}>
                  <td style={{ fontWeight: 'bold' }}>{row.label}</td>
                  <td>
                    {row.isAdjustmentOnly ? '' : (
                      <EditableField
                        fieldPath={['Subject', row.subjectValueKey || row.valueKey]}
                        value={subjectValue}
                        onDataChange={handleDataChange}
                        isEditable={isEditable} allData={allData}
                      />
                    )}
                  </td>
                  {comparableSales.map((sale, compIndex) => {
                    const compData = data[sale] || {};
                    const value = compData[row.valueKey] || '';
                    const isMissing = extractionAttempted && !value && !row.isAdjustmentOnly;
                    return (
                      <td key={`${sale}-${row.label}`} style={isMissing ? { border: '2px solid red' } : {}}>
                        {row.isAdjustmentOnly ? '' : (
                          <EditableField
                            fieldPath={[sale, row.valueKey]}
                            value={value}
                            onDataChange={handleDataChange}
                            editingField={editingField}
                            setEditingField={setEditingField}
                            isEditable={isEditable} allData={allData} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );

              if (row.adjustmentKey) {
                rows.push(
                  <tr key={`${row.label}-adj-${rowIndex}`} className="adjustment-row">
                    <td style={{ paddingLeft: '2rem' }}>
                      <i>Adjustment</i>
                    </td>
                    <td>
                      {/* Subject adjustment if any - usually none */}
                    </td>
                    {comparableSales.map((sale, compIndex) => {
                      const compData = data[sale] || {};
                      const adjValue = compData[row.adjustmentKey] || '';
                      const isMissing = extractionAttempted && !adjValue;
                      return (
                        <td key={`${sale}-${row.adjustmentKey}`} style={isMissing ? { border: '2px solid red' } : {}}>
                          <EditableField
                            fieldPath={[sale, row.adjustmentKey]}
                            value={adjValue}
                            onDataChange={handleDataChange}
                            editingField={editingField}
                            setEditingField={setEditingField}
                            isEditable={isEditable}
                            allData={allData} />
                        </td>
                      );
                    })}
                  </tr>
                );
              }

              return rows;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};


const PromptAnalysis = ({ onPromptSubmit, loading, response, error, submittedPrompt }) => {
  // const [prompt, setPrompt] = useState('');


  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (prompt.trim()) {
  //     onPromptSubmit(prompt);
  //   }
  // };

  const prompt1 = "Verify that the subject property address is consistent across the Subject section, Sales Grid, Location Map, and Aerial Map.\nAlso please confirm subject street, front and rear photo are present and no duplicates.";
  const prompt2 = "Compare the bedroom and bathroom counts between the Improvements section, Sales Grid, and all available floor plans/ sktech/ building sketch and all photos.";
  const prompt3 = "Check for any discrepancies in the Gross Living Area (GLA) across all sections of the report.";
  const prompt4 = "Match all comparable property addresses between the Sales Grid, photo pages, and the Location Map. Also please confirm no duplicates.";
  const prompt5 = "Verify all Photo labels and no duplicate photos.";
  const prompt6 = "Please check and verify if below revision requests are addressed in the file.&#10;&#10;The date lease begins of rental comp# 3 is noted as Owner, please revise&#10;&#10;If addressed by comments, please verify if particular section is updated.&#10;&#10;If addressed, provide answer as revision and state corrected or not corrected. Keep it short.&#10;&#10;Below are extra points to confirm, don't address or treat as revision, just verify&#10;&#10;Also, please check if any checkboxes, or field are blank, if yes highlight in short&#10;&#10;consider below,&#10;&#10;if assignment type is refinance, then contract section should be blank, even checkboxes.&#10;&#10;If purchase, the appropriate field and checkboxes should be marked.&#10;&#10;In garage, check and validate according to checkboxes marked. &#10;&#10;Check if appraised value is matched at in total 4 locations.&#10;&#10;The signature date should be greater than effective date. Effective date is as of date.&#10;&#10;In signature page Company Name/AMC Name should include Fastapp&#10;&#10;Check for prior services, exposure comment, check is appraiser invoice is attached if yes need to remove.&#10;&#10;Please answer 1 per line not in paragraph";
  const supplementalAddendumPrompt = "Check if the following sections are present in the PDF. For each, only answer 'Present' or 'Not Present': SUPPLEMENTAL ADDENDUM, ADDITIONAL COMMENTS, APPRAISER'S CERTIFICATION:, SUPERVISORY APPRAISER'S CERTIFICATION:, Analysis/Comments, GENERAL INFORMATION ON ANY REQUIRED REPAIRS, UNIFORM APPRAISAL DATASET (UAD) DEFINITIONS ADDENDUM";
  const uniformResidentialAppraisalReportPrompt = "Check if the following sections are present in the PDF. For each, only answer 'Present' or 'Not Present': SCOPE OF WORK:, INTENDED USE:, INTENDED USER:, DEFINITION OF MARKET VALUE:, STATEMENT OF ASSUMPTIONS AND LIMITING CONDITIONS:";
  const appraisalReportIdPrompt = "Check if the following sections are present in the PDF. For each, only answer 'Present' or 'Not Present': This Report is one of the following types:, Comments on Standards Rule 2-3, Reasonable Exposure Time, Comments on Appraisal and Report Identification:";

  const renderResponse = (response) => {
    let data = response;
    if (typeof response === 'string') {
      try {
        const parsed = JSON.parse(response);
        if (typeof parsed === 'object' && parsed !== null) {
          data = parsed;
        }
      } catch (e) {
        // Not a JSON string, treat as plain text
      }
    }

    if (typeof data === 'object' && data !== null) {
      const { summary, ...tableData } = data;
      const hasTableData = Object.keys(tableData).length > 0;

      return (
        <>
          <Stack spacing={3} sx={{ mt: 3 }}>
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
            {/* <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Field</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Page No</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(tableData).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell>{key}</TableCell>
                    <TableCell>{typeof value === 'object' && value !== null ? JSON.stringify(value, null, 2) : String(value)}</TableCell>
                    <TableCell>N/A</TableCell> */}
            {/* <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom component="div" color="primary.main">
                Summary
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {summary}
              </Typography> */}


            {hasTableData && (
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom component="div" color="primary.main">
                  Analysis Details
                </Typography>
                <TableContainer>
                  <Table size="small" aria-label="prompt analysis table">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', borderBottom: 2, borderColor: 'primary.light' }}>Field</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', borderBottom: 2, borderColor: 'primary.light' }}>Value</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', borderBottom: 2, borderColor: 'primary.light' }}>Page No</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(tableData).map(([key, value]) => (
                        <TableRow key={key} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          {/* <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                            {key}
                          </TableCell>
                          <TableCell>
                            {(typeof value === 'object' && value !== null && 'value' in value) 
                              ? String(value.value) 
                              : (typeof value === 'object' ? JSON.stringify(value) : String(value))}
                          </TableCell> */}
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                            {key}
                          </TableCell>
                          <TableCell>
                            {(typeof value === 'object' && value !== null && 'value' in value)
                              ? String(value.value)
                              : (typeof value === 'object' ? JSON.stringify(value) : String(value))}
                          </TableCell>
                          <TableCell>{(typeof value === 'object' && value !== null && 'page_no' in value) ? value.page_no : 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </Stack>
        </>
      );
    }


    return (
      <Paper elevation={1} sx={{ p: 2, mt: 3, bgcolor: 'background.default' }}>
        <Typography variant="h6" gutterBottom component="div" color="primary.main">
          Analysis Result
        </Typography>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'inherit', fontFamily: 'monospace' }}>
          {String(data)}
        </pre>
      </Paper>
    );
  };


  return (
    <div id="prompt-analysis-section" className="card shadow mb-4">
      <div className="card-header CAR1 bg-info text-white" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <strong>Prompt Analysis</strong>
      </div>
      <div className="card-body">
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Button variant="outlined" size="small" onClick={() => onPromptSubmit(prompt1)} disabled={loading}>Verify Subject Address & Photos</Button>
            <Button variant="outlined" size="small" onClick={() => onPromptSubmit(prompt2)} disabled={loading}>Compare Room Counts</Button>
            <Button variant="outlined" size="small" onClick={() => onPromptSubmit(prompt3)} disabled={loading}>Check GLA Discrepancies</Button>
            <Button variant="outlined" size="small" onClick={() => onPromptSubmit(prompt4)} disabled={loading}>Match Comp Addresses</Button>
            <Button variant="outlined" size="small" onClick={() => onPromptSubmit(prompt5)} disabled={loading}>Verify Photo Labels & Duplicates</Button>
            <Button variant="outlined" size="small" onClick={() => onPromptSubmit(prompt6)} disabled={loading}>Revision Requests Check</Button>
            <Button variant="outlined" size="small" onClick={() => onPromptSubmit(supplementalAddendumPrompt)} disabled={loading}>Supplemental Addendum</Button>
            <Button variant="outlined" size="small" onClick={() => onPromptSubmit(uniformResidentialAppraisalReportPrompt)} disabled={loading}>Uniform Residential Appraisal Report</Button>
            <Button variant="outlined" size="small" onClick={() => onPromptSubmit(appraisalReportIdPrompt)} disabled={loading}>Appraisal and Report Identification</Button>
          </Stack>
          {loading && <CircularProgress size={24} />}
        </Stack>

        {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

        {response && (
          <Box sx={{ mt: 3 }}>
            {submittedPrompt && <Paper elevation={1} sx={{ p: 2, mb: 3, borderLeft: 4, borderColor: 'secondary.main', bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom component="div" color="text.primary">
                Given Prompt
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontStyle: 'italic', color: 'text.secondary' }}>
                {submittedPrompt}
              </Typography>
            </Paper>}
            {renderResponse(response)}
          </Box>
        )}
      </div>
    </div>
  );
};
const ComparisonDialog = ({ open, onClose, data, onDataChange }) => {
  const fields = [
    'Property Address', 'City', 'County', 'State', 'Zip Code',
    'Borrower', 'Occupant', 'Address (Lender/Client)', 'Lender/Client'
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Enter Values to Compare</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {fields.map(field => (
            <TextField
              key={field}
              label={field}
              fullWidth
              variant="outlined"
              value={data[field] || ''}
              onChange={(e) => onDataChange(field, e.target.value)}
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const getComparisonStyle = (field, extractedValue, comparisonValue) => {
  if (!comparisonValue) {
    return {};
  }
  const areDifferent = String(extractedValue).trim() !== String(comparisonValue).trim();
  if (areDifferent) {
    return { border: '1px solid red' };
  }
  return {};
};

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

function Subject() {
  const [data, setData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false); const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [timer, setTimer] = useState(0);
  const [selectedFormType, setSelectedFormType] = useState('1004');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [extractionAttempted, setExtractionAttempted] = useState(false);
  const [lastExtractionTime, setLastExtractionTime] = useState(null);
  const timerRef = useRef(null);
  const [isEditable, setIsEditable] = useState(true);
  const fileInputRef = useRef(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [themeMode, setThemeMode] = useState('light');
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [isComparisonDialogOpen, setIsComparisonDialogOpen] = useState(false);
  const [comparisonData, setComparisonData] = useState({

    'Property Address': '',
    'City': '',
    'County': '',
    'State': '',
    'Zip Code': '',
    'Borrower': '',
    'Occupant': '',
    'Address (Lender/Client)': '',
    'Lender/Client': ''
  });
  const [activeSection, setActiveSection] = useState(null);
  const [promptAnalysisLoading, setPromptAnalysisLoading] = useState(false);
  const [promptAnalysisResponse, setPromptAnalysisResponse] = useState(null);
  const [promptAnalysisError, setPromptAnalysisError] = useState('');
  const [submittedPrompt, setSubmittedPrompt] = useState('');
  const [fileUploadTimer, setFileUploadTimer] = useState(0);
  const [stateReqLoading, setStateReqLoading] = useState(false);
  const [stateReqResponse, setStateReqResponse] = useState(null);
  const [stateReqError, setStateReqError] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [unpaidOkLoading, setUnpaidOkLoading] = useState(false);
  const [unpaidOkResponse, setUnpaidOkResponse] = useState(null);
  const [unpaidOkError, setUnpaidOkError] = useState('');
  const [clientReqLoading, setClientReqLoading] = useState(false);
  const [clientReqResponse, setClientReqResponse] = useState(null);
  const [clientReqError, setClientReqError] = useState('');
  const [fhaLoading, setFhaLoading] = useState(false);
  const [fhaResponse, setFhaResponse] = useState(null);
  const [fhaError, setFhaError] = useState('');
  const [escalationLoading, setEscalationLoading] = useState(false);
  const [escalationResponse, setEscalationResponse] = useState(null);
  const [escalationError, setEscalationError] = useState('');

  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [contractExtracted, setContractExtracted] = useState(false);

  const unpaidOkLenders = [
    'PRMG', 'Paramount Residential Mortgage Group',
    'CARDINAL FINANCIAL COMPANY',
    'Ice Lender Holdings LLC',
    'NP Inc', 'NQM Funding, LLC',
    'East Coast Capital',
    'Guaranteed Rate. Inc',
    'Commercial Lender, LLC',
    'LoanDepot.com',
    'Direct Lending Partners',
    'CIVIC',
    'CV3',
    'United Faith Mortgage',
    'Arixa Capital', 'Crosswind Financial', 'Western Alliance Bank',
    'RCN Capital, LLC',
    'Aura Mortgage Advisors, LLC', 'Blue Hub Capital',
    'Nations Direct Mortgage LLC',
    'Sierra Pacific Mortgage Company Inc',
    'Champions Funding LLC'
  ].map(l => l.toLowerCase());

  const isUnpaidOkLender = data['Lender/Client'] && unpaidOkLenders.some(lender => data['Lender/Client'].toLowerCase().includes(lender));


  const fileUploadTimerRef = useRef(null);

  const handleDataChange = (path, value) => {
    setData(prevData => {
      const newData = { ...prevData };
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current[path[i]] = { ...current[path[i]] };
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  const handleComparisonDataChange = (field, value) => {
    setComparisonData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleThemeChange = () => {
    setThemeMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      localStorage.removeItem('fileUploadStartTime');
      localStorage.removeItem('fileUploadName');
      clearInterval(fileUploadTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const startTime = localStorage.getItem('fileUploadStartTime');
    if (startTime) {
      const elapsedSeconds = Math.floor((Date.now() - parseInt(startTime, 10)) / 1000);
      setFileUploadTimer(elapsedSeconds);
      setIsTimerRunning(true);

      const fileName = localStorage.getItem('fileUploadName');
      if (fileName) {
        setSelectedFile({ name: fileName });
      }
    }
  }, []);

  useEffect(() => {
    if (isTimerRunning) {
      fileUploadTimerRef.current = setInterval(() => {
        setFileUploadTimer(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(fileUploadTimerRef.current);
    }

    return () => clearInterval(fileUploadTimerRef.current);
  }, [isTimerRunning]);

  const handleTimerToggle = () => {
    setIsTimerRunning(prev => !prev);
  };


  const subjectFields = [
    // 'FHA Case No.',
    // 'Exposure comment',
    // 'Prior service comment',
    // 'ANSI',
    'Property Address',
    'City',
    'County',
    'State',
    'Zip Code',
    'Borrower',
    'Owner of Public Record',
    'Legal Description',
    "Assessor's Parcel #",
    'Tax Year',
    'R.E. Taxes $',
    'Neighborhood Name',
    'Map Reference',
    'Census Tract',
    'Occupant',
    'Special Assessments $',
    'PUD',
    'HOA $',
    'Property Rights Appraised',
    'Assignment Type',
    'Lender/Client',
    'Address (Lender/Client)',
    'Offered for Sale in Last 12 Months',
    'Report data source(s) used, offering price(s), and date(s)',
  ];

  const statesRequiringAppraiserFee = ['AZ', 'CO', 'CT', 'GA', 'IL', 'LA', 'NJ', 'NV', 'NM', 'ND', 'OH', 'UT', 'VA', 'VT', 'WV'];
  const statesRequiringAmcLicense = ['GA', 'IL', 'MT', 'NJ', 'OH', 'VT'];

  const currentState = data?.State?.toUpperCase();

  if (currentState) {
    if (statesRequiringAppraiserFee.includes(currentState)) {
      const feeIndex = subjectFields.indexOf('State') + 1;
      if (!subjectFields.includes("Appraiser's Fee")) {
        subjectFields.splice(feeIndex, 0, "Appraiser's Fee");
      }
    }
    if (statesRequiringAmcLicense.includes(currentState)) {
      let amcIndex = subjectFields.indexOf('State') + 1;
      if (subjectFields.includes("Appraiser's Fee")) {
        amcIndex++;
      }
      if (!subjectFields.includes('AMC License #')) {
        subjectFields.splice(amcIndex, 0, 'AMC License #');
      }
    }
  }


  const highlightedSubjectFields = [
    'Property Address',
    'City',
    'County',
    'State',
    'Zip Code',
    'Borrower',
    'Occupant',
    'Assignment Type',
    'Lender/Client',
    'Address (Lender/Client)',
  ];
  const stateRequirementFields = ["STATE REQUIREMENT FIELDS"];

  const highlightedContractFields = [
    'Contract Price $',
    'Date of Contract',
  ];

  const highlightedSiteFields = [
    "Area",
    "Shape",
    "View",
    "Is the highest and best use of subject property as improved (or as proposed per plans and specifications) the present use?",
    "FEMA Special Flood Hazard Area",
    "FEMA Flood Zone",
    "FEMA Map #",
    "FEMA Map Date",
  ];


  const contractFields = [
    "I did did not analyze the contract for sale for the subject purchase transaction. Explain the results of the analysis of the contract for sale or why the analysis was not performed.",
    "Contract Price $",
    "Date of Contract",
    "Is property seller owner of public record?",
    "Data Source(s)",
    "Is there any financial assistance (loan charges, sale concessions, gift or downpayment assistance, etc.) to be paid by any party on behalf of the borrower?",
    "If Yes, report the total dollar amount and describe the items to be paid",
  ];

  const neighborhoodFields = [
    "Location", "Built-Up", "Growth", "Property Values", "Demand/Supply",
    "Marketing Time", "One-Unit", "2-4 Unit", "Multi-Family", "Commercial", "Other", "Present Land Use for other",
    "one unit housing price(high,low,pred)", "one unit housing age(high,low,pred)",
    "Neighborhood Boundaries", "Neighborhood Description", "Market Conditions:",
  ];

  const siteFields = [
    "Dimensions",
    "Area",
    "Shape",
    "View",
    "Specific Zoning Classification",
    "Zoning Description",
    "Zoning Compliance",
    "Is the highest and best use of subject property as improved (or as proposed per plans and specifications) the present use?",
    "Electricity",
    "Gas",
    "Water",
    "Sanitary Sewer",
    "Street",
    "Alley",
    "FEMA Special Flood Hazard Area",
    "FEMA Flood Zone",
    "FEMA Map #",
    "FEMA Map Date",
    "Are the utilities and off-site improvements typical for the market area? If No, describe",
    "Are there any adverse site conditions or external factors (easements, encroachments, environmental conditions, land uses, etc.)? If Yes, describe"
  ];

  const improvementsFields = [
    "Units", "One with Accessory Unit", "# of Stories", "Type", "Existing/Proposed/Under Const.",
    "Design (Style)", "Year Built", "Effective Age (Yrs)", "Foundation Type",
    "Basement Area sq.ft.", "Basement Finish %",
    "Evidence of", "Foundation Walls (Material/Condition)",
    "Exterior Walls (Material/Condition)", "Roof Surface (Material/Condition)",
    "Gutters & Downspouts (Material/Condition)", "Window Type (Material/Condition)",
    "Storm Sash/Insulated", "Screens", "Floors (Material/Condition)", "Walls (Material/Condition)",
    "Trim/Finish (Material/Condition)", "Bath Floor (Material/Condition)", "Bath Wainscot (Material/Condition)",
    "Attic", "Heating Type", "Fuel", "Cooling Type",
    "Fireplace(s) #", "Patio/Deck", "Pool", "Woodstove(s) #", "Fence", "Porch", "Other Amenities",
    "Car Storage", "Driveway # of Cars", "Driveway Surface", "Garage # of Cars", "Carport # of Cars",
    "Garage Att./Det./Built-in", "Appliances",
    "Finished area above grade Rooms", "Finished area above grade Bedrooms",
    "Finished area above grade Bath(s)", "Square Feet of Gross Living Area Above Grade",
    "Additional features", "Describe the condition of the property",
    "Are there any physical deficiencies or adverse conditions that affect the livability, soundness, or structural integrity of the property? If Yes, describe",

  ];

  const reconciliationFields = [
    'Indicated Value by: Sales Comparison Approach $',
    'Cost Approach (if developed)',
    'Income Approach (if developed) $',
    'Income Approach (if developed) $ Comment',
    'This appraisal is made "as is", subject to completion per plans and specifications on the basis of a hypothetical condition that the improvements have been completed, subject to the following repairs or alterations on the basis of a hypothetical condition that the repairs or alterations have been completed, or subject to the following required inspection based on the extraordinary assumption that the condition or deficiency does not require alteration or repair:',
    "opinion of the market value, as defined, of the real property that is the subject of this report is $",
    "as of", "final value"
  ];

  const incomeApproachFields = [
    "Estimated Monthly Market Rent $",
    "X Gross Rent Multiplier  = $",
    "Indicated Value by Income Approach",
    "Summary of Income Approach (including support for market rent and GRM) "
  ];

  const costApproachFields = [
    "Estimated",
    "Source of cost data",
    "Quality rating from cost service ",
    "Effective date of cost data ",
    "Comments on Cost Approach (gross living area calculations, depreciation, etc.) ",
    "OPINION OF SITE VALUE = $ ................................................",
    "Dwelling",
    "Garage/Carport ",
    " Total Estimate of Cost-New  = $ ...................",
    "Depreciation ",
    "Depreciated Cost of Improvements......................................................=$ ",
    "“As-is” Value of Site Improvements......................................................=$",
    "Indicated Value By Cost Approach......................................................=$",
  ];

  const pudInformationFields = [
    "PUD Fees $",
    "PUD Fees (per month)",
    "PUD Fees (per year)",
    "Is the developer/builder in control of the Homeowners' Association (HOA)?",
    "Unit type(s)",
    "Provide the following information for PUDs ONLY if the developer/builder is in control of the HOA and the subject property is an attached dwelling unit.",
    "Legal Name of Project",
    "Total number of phases",
    "Total number of units",
    "Total number of units sold",
    "Total number of units rented",
    "Total number of units for sale",
    "Data source(s)",
    "Was the project created by the conversion of existing building(s) into a PUD?",
    " If Yes, date of conversion",
    "Does the project contain any multi-dwelling units? Yes No Data",
    "Are the units, common elements, and recreation facilities complete?",
    "If No, describe the status of completion.",
    "Are the common elements leased to or by the Homeowners' Association?",
    "If Yes, describe the rental terms and options.",
    "Describe common elements and recreational facilities."
  ];

  const appraiserFields = [
    "Signature",
    "Name",
    "Company Name",
    "Company Address",
    "Telephone Number",
    "Email Address",
    "Date of Signature and Report",
    "Effective Date of Appraisal",
    "State Certification #",
    "or State License #",
    "or Other (describe)",
    "State #",
    "State",
    "Expiration Date of Certification or License",
    "ADDRESS OF PROPERTY APPRAISED",
    "APPRAISED VALUE OF SUBJECT PROPERTY $",
    "LENDER/CLIENT Name",
    "Lender/Client Company Name",
    "Lender/Client Company Address",
    "Lender/Client Email Address"
  ];

  const supplementalAddendumFields = [
    "SUPPLEMENTAL ADDENDUM",
    "ADDITIONAL COMMENTS",
    "APPRAISER'S CERTIFICATION:",
    "SUPERVISORY APPRAISER'S CERTIFICATION:",
    "Analysis/Comments",
    "GENERAL INFORMATION ON ANY REQUIRED REPAIRS",
    "UNIFORM APPRAISAL DATASET (UAD) DEFINITIONS ADDENDUM",
  ];

  const uniformResidentialAppraisalReportFields = [
    "SCOPE OF WORK:",
    "INTENDED USE:",
    "INTENDED USER:",
    "DEFINITION OF MARKET VALUE:",
    "STATEMENT OF ASSUMPTIONS AND LIMITING CONDITIONS:",
  ];

  const appraisalAndReportIdentificationFields = [
    "This Report is one of the following types:",
    "Comments on Standards Rule 2-3",
    "Reasonable Exposure Time",
    "Comments on Appraisal and Report Identification"
  ];

  const marketConditionsFields = [
    "Instructions:", "Seller-(developer, builder, etc.)paid financial assistance prevalent?",
    "Explain in detail the seller concessions trends for the past 12 months (e.g., seller contributions increased from 3% to 5%, increasing use of buydowns, closing costs, condo fees, options, etc.).",
    "Are foreclosure sales (REO sales) a factor in the market?", "If yes, explain (including the trends in listings and sales of foreclosed properties).",
    "Cite data sources for above information.", "Summarize the above information as support for your conclusions in the Neighborhood section of the appraisal report form. If you used any additional information, such as an analysis of pending sales and/or expired and withdrawn listings, to formulate your conclusions, provide both an explanation and support for your conclusions."
  ];

  const marketConditionsRows = [
    { label: "Total # of Comparable Sales (Settled)", fullLabel: "Inventory Analysis Total # of Comparable Sales (Settled)" },
    { label: "Absorption Rate (Total Sales/Months)", fullLabel: "Inventory Analysis Absorption Rate (Total Sales/Months)" },
    { label: "Total # of Comparable Active Listings", fullLabel: "Inventory Analysis Total # of Comparable Active Listings" },
    { label: "Months of Housing Supply", fullLabel: "Inventory Analysis Months of Housing Supply (Total Listings/Ab.Rate)" },
    { label: "Median Comparable Sale Price", fullLabel: "Median Sale & List Price, DOM, Sale/List % Median Comparable Sale Price" },
    { label: "Median Comparable Sales Days on Market", fullLabel: "Median Sale & List Price, DOM, Sale/List % Median Comparable Sales Days on Market" },
    { label: "Median Comparable List Price", fullLabel: "Median Sale & List Price, DOM, Sale/List % Median Comparable List Price" },
    { label: "Median Comparable Listings Days on Market", fullLabel: "Median Sale & List Price, DOM, Sale/List % Median Comparable Listings Days on Market" },
    { label: "Median Sale Price as % of List Price", fullLabel: "Median Sale & List Price, DOM, Sale/List % Median Sale Price as % of List Price" }
  ];

  const salesHistoryFields = [
    "Date of Prior Sale/Transfer",
    "Price of Prior Sale/Transfer",
    "Data Source(s) for prior sale",
    "Effective Date of Data Source(s) for prior sale"
  ];

  const salesComparisonAdditionalInfoFields = [

    "I did did not research the sale or transfer history of the subject property and comparable sales. If not, explain",
    "My research did did not reveal any prior sales or transfers of the subject property for the three years prior to the effective date of this appraisal.",
    "Data Source(s) for subject property research",
    "My research did did not reveal any prior sales or transfers of the comparable sales for the year prior to the date of sale of the comparable sale.",
    "Data Source(s) for comparable sales research",
    "Analysis of prior sale or transfer history of the subject property and comparable sales",
    "Summary of Sales Comparison Approach",
    "Indicated Value by Sales Comparison Approach $",

  ];

  const infoOfSalesFields = [
    "There are ____ comparable properties currently offered for sale in the subject neighborhood ranging in price from$ ___to $___",
    "There are ___comparable sales in the subject neighborhoodwithin the past twelvemonths ranging in sale price from$___ to $____"
  ];
  const condoForeclosureFields = [
    "Are foreclosure sales (REO sales) a factor in the project?", "If yes, indicate the number of REO listings and explain the trends in listings and sales of foreclosed properties.", "Summarize the above trends and address the impact on the subject unit and project.",
  ];

  // const highlightedSalesComparisonAdditionalInfoFields = [
  //   "There are ____ comparable properties currently offered for sale in the subject neighborhood ranging in price from$ ___to $___",
  //   "There are ___comparable sales in the subject neighborhoodwithin the past twelvemonths ranging in sale price from$___ to $____",
  // ];


  const condoCoopProjectsRows = [
    { label: "Total # of Comparable Sales (Settled)", fullLabel: "Subject Project Data Total # of Comparable Sales (Settled)" },
    { label: "Absorption Rate (Total Sales/Months)", fullLabel: "Subject Project Data Absorption Rate (Total Sales/Months)" },
    { label: "Total # of Comparable Active Listings", fullLabel: "Subject Project Data Total # of Comparable Active Listings" },
    { label: "Months of Unit Supply (Total Listings/Ab.Rate)", fullLabel: "Subject Project Data Months of Unit Supply (Total Listings/Ab.Rate)" },
  ];
  // const condoCoopProjectsFields = [
  //   "Are foreclosure sales (REO sales) a factor in the project?", "If yes, indicate the number of REO listings and explain the trends in listings and sales of foreclosed properties.", "Summarize the above trends and address the impact on the subject unit and project.",
  // ];

  const imageAnalysisFields = [
    "include bedroom, bed, bathroom, bath, half bath, kitchen, lobby, foyer, living room count with label and photo,please explan and match the floor plan with photo and improvement section, GLA",
    "please match comparable address in sales comparison approach and comparable photos, please make sure comp phto are not same, also find front, rear, street photo and make sure it is not same, capture any additionbal photo for adu according to check mark",
    "please match comparable address in sales comparison approach and comparable photos, please make sure comp phto are not same, also find front, rear, street photo and make sure it is not same, capture any additionbal photo for adu according to check mark, please match the same in location map, areial map should have subject address, please check signature section details of appraiser in appraiser license copy for accuracy"
  ];

  const projectSiteFields = [
    "Topography", "Size", "Density", "View", "Specific Zoning Classification", "Zoning Description",
    "Zoning Compliance", "Is the highest and best use of subject property as improved (or as proposed per plans and specifications) the present use?",
    "Electricity", "Gas", "Water", "Sanitary Sewer", "Street", "Alley", "FEMA Special Flood Hazard Area",
    "FEMA Flood Zone", "FEMA Map #", "FEMA Map Date", "Are the utilities and off-site improvements typical for the market area? If No, describe",
    "Are there any adverse site conditions or external factors (easements, encroachments, environmental conditions, land uses, etc.)? If Yes, describe",
  ];

  const projectInfoFields = [
    "Data source(s) for project information", "Project Description", "# of Stories",
    "# of Elevators", "Existing/Proposed/Under Construction", "Year Built",
    "Effective Age", "Exterior Walls",
    "Roof Surface", "Total # Parking", "Ratio (spaces/units)", "Type", "Guest Parking", "# of Units", "# of Units Completed",
    "# of Units For Sale", "# of Units Sold", "# of Units Rented", "# of Owner Occupied Units",
    "# of Phases", "# of Units", "# of Units for Sale", "# of Units Sold", "# of Units Rented", "# of Owner Occupied Units", "# of Planned Phases",
    "# of Planned Units", "# of Planned Units for Sale", "# of Planned Units Sold", "# of Planned Units Rented", "# of Planned Owner Occupied Units",
    "Project Primary Occupancy", "Is the developer/builder in control of the Homeowners' Association (HOA)?",
    "Management Group", "Does any single entity (the same individual, investor group, corporation, etc.) own more than 10% of the total units in the project?"
    , "Was the project created by the conversion of existing building(s) into a condominium?",
    "If Yes,describe the original use and date of conversion",
    "Are the units, common elements, and recreation facilities complete (including any planned rehabilitation for a condominium conversion)?", "If No, describe",
    "Is there any commercial space in the project?",
    "If Yes, describe and indicate the overall percentage of the commercial space.", "Describe the condition of the project and quality of construction.",
    "Describe the common elements and recreational facilities.", "Are any common elements leased to or by the Homeowners' Association?",
    "If Yes, describe the rental terms and options.", "Is the project subject to a ground rent?",
    "If Yes, $ per year (describe terms and conditions)",
    "Are the parking facilities adequate for the project size and type?", "If No, describe and comment on the effect on value and marketability."
  ];

  const projectAnalysisFields = [
    "I did did not analyze the condominium project budget for the current year. Explain the results of the analysis of the budget (adequacy of fees, reserves, etc.), or why the analysis was not performed.",
    "Are there any other fees (other than regular HOA charges) for the use of the project facilities?",
    "If Yes, report the charges and describe.",
    "Compared to other competitive projects of similar quality and design, the subject unit charge appears",
    "If High or Low, describe",
    "Are there any special or unusual characteristics of the project (based on the condominium documents, HOA meetings, or other information) known to the appraiser?",
    "If Yes, describe and explain the effect on value and marketability.",
  ];

  const unitDescriptionsFields = [
    "Unit Charge$", " per month X 12 = $", "per year",
    "Annual assessment charge per year per square feet of gross living area = $",
    "Utilities included in the unit monthly assessment [None/Heat/Air/Conditioning/Electricity/Gas/Water/Sewer/Cable/Other (describe)]",
    "Floor #",
    "# of Levels",
    "Heating Type/Fuel",
    "Central AC/Individual AC/Other (describe)",
    "Fireplace(s) #/Woodstove(s) #/Deck/Patio/Porch/Balcony/Other",
    "Refrigerator/Range/Oven/Disp Microwave/Dishwasher/Washer/Dryer",
    "Floors", "Walls", "Trim/Finish", "Bath Wainscot", "Doors",
    "None/Garage/Covered/Open", "Assigned/Owned", "# of Cars", "Parking Space #",
    "Finished area above grade contains:", "Rooms", "Bedrooms", "Bath(s)", "Square Feet of Gross Living Area Above Grade",
    "Are the heating and cooling for the individual units separately metered?", "If No, describe and comment on compatibility to other projects in the market area.",
    "Additional features (special energy efficient items, etc.)",
    "Describe the condition of the property (including needed repairs, deterioration, renovations, remodeling, etc.)",
    "Are there any physical deficiencies or adverse conditions that affect the livability, soundness, or structural integrity of the property? ", "If Yes, describe",
    "Does the property generally conform to the neighborhood (functional utility, style, condition, use, construction, etc.)?", "If No, describe"
  ];

  const priorSaleHistoryFields = [
    "Prior Sale History: I did did not research the sale or transfer history of the subject property and comparable sales",
    "Prior Sale History: My research did did not reveal any prior sales or transfers of the subject property for the three years prior to the effective date of this appraisal",
    "Prior Sale History: Data source(s) for subject",
    "Prior Sale History: My research did did not reveal any prior sales or transfers of the comparable sales for the year prior to the date of sale of the comparable sale",
    "Prior Sale History: Data source(s) for comparables",
    "Prior Sale History: Report the results of the research and analysis of the prior sale or transfer history of the subject property and comparable sales",
    "Prior Sale History: Date of Prior Sale/Transfer",
    "Prior Sale History: Price of Prior Sale/Transfer",
    "Prior Sale History: Data Source(s) for prior sale/transfer",
    "Prior Sale History: Effective Date of Data Source(s)",
    "Prior Sale History: Analysis of prior sale or transfer history of the subject property and comparable sales"
  ];
  const dataConsistencyFields = {
    'Bedroom': {
      'Improvements': 'Bedroom Improvements Count',
      'Grid': 'Bedroom Sales Comparison Approach Count',
      'Photo': 'Bedroom Photo Count',
      'Floorplan': 'TOTAL Bedroom Floorplan Count',
    },
    'Bathroom': {
      'Improvements': 'Bathroom Improvements Count',
      'Grid': 'Bathroom Sales Comparison Approach Count',
      'Photo': 'Bathroom Photo Count',
      'Floorplan': 'TOTAL Bathroom Floorplan Count',
    },
    'GLA': { 'Improvements': 'GLA Improvements Count', 'Grid': 'GLA Sales Comparison Approach Count', 'Photo': 'GLA Photo Count', 'Floorplan': 'GLA Floorplan Count' }
  };
  const formTypes = ['1004', '1004C', '1004D', '1025', '1073', '2090', '203k-FHA', '2055', '1075', '2095', '1007', '216'];

  const sections = [
    { id: 'subject-info', title: 'Subject', category: 'SUBJECT' }, // Root level data
    { id: 'contract-section', title: 'Contract', category: 'CONTRACT' },
    { id: 'neighborhood-section', title: 'Neighborhood', category: 'NEIGHBORHOOD' },

    { id: 'project-site-section', title: 'Project Site', category: 'PROJECT_SITE' },
    { id: 'project-info-section', title: 'Project Information', category: 'PROJECT_INFO' },
    { id: 'project-analysis-section', title: 'Project Analysis', category: 'PROJECT_ANALYSIS' },
    { id: 'unit-descriptions-section', title: 'Unit Descriptions', category: 'UNIT_DESCRIPTIONS' },
    { id: 'prior-sale-history-section', title: 'Prior Sale History', category: 'PRIOR_SALE_HISTORY' },
    { id: 'site-section', title: 'Site', category: 'SITE' },
    // { id: 'info-of-sales-section', title: 'Info of Sales', category: 'INFO_OF_SALES'},
    { id: 'improvements-section', title: 'Improvements', category: 'IMPROVEMENTS' },
    { id: 'sales-comparison', title: 'Sales Comparison & History', category: ['SALES_GRID', 'SALES_TRANSFER', 'INFO_OF_SALES'] },
    { id: 'rent-schedule-section', title: 'Comparable Rent Schedule', category: 'RENT_SCHEDULE_GRID' },
    { id: 'reconciliation-section', title: 'Reconciliation', category: 'RECONCILIATION' },
    { id: 'rent-schedule-reconciliation-section', title: 'Rent Schedule Reconciliation', category: 'RENT_SCHEDULE_RECONCILIATION' },
    { id: 'cost-approach-section', title: 'Cost Approach', category: 'COST_APPROACH' },
    { id: 'income-approach-section', title: 'Income Approach', category: 'INCOME_APPROACH' },
    { id: 'pud-info-section', title: 'PUD Information', category: 'PUD_INFO' },
    { id: 'market-conditions-section', title: 'Market Conditions', category: 'MARKET_CONDITIONS' },
    { id: 'condo-coop-section', title: 'Condo/Co-op', category: ['CONDO', 'CONDO_FORECLOSURE'] },
    // { id: 'condo-section', title: 'Condo', category: 'CONDO},
    // { id: 'condo-foreclosure-section', title: 'Condo Foreclosure', category: '' },
    { id: 'appraiser-section', title: 'CERTIFICATION', category: 'CERTIFICATION' }, // This should be condo coop projects
    // { id: 'supplemental-addendum-section', title: 'Supplemental Addendum', category: 'ADDENDUM' },
    // { id: 'uniform-report-section', title: 'Uniform Report', category: 'UNIFORM_REPORT' },
    // { id: 'appraisal-id-section', title: 'Appraisal ID', category: 'APPRAISAL_ID' },
    // { id: 'state-requirement-section', title: 'State Requirement', category: 'STATE_REQUIREMENT_FIELDS' },

    // { id: 'comparable-address-consistency-section', title: 'Comp Address Consistency' },
    { id: 'data-consistency-section', title: 'Data Consistency', category: 'DATA_CONSISTENCY' },
    { id: 'comparable-address-consistency-section', title: 'Comp Address Consistency', category: 'IMAGE_ANALYSIS' },

    { id: 'prompt-analysis-section', title: 'Prompt Analysis' },
    { id: 'raw-output', title: 'Raw Output' },

  ];

  const salesGridRows = [

    { label: "Address", valueKey: "Address", subjectValueKey: "Property Address" },
    { label: "Proximity to Subject", valueKey: "Proximity to Subject", subjectValueKey: "" },
    { label: "Sale Price", valueKey: "Sale Price" },
    { label: "Sale Price/GLA", valueKey: "Sale Price/Gross Liv. Area" },
    { label: "Data Source(s)", valueKey: "Data Source(s)" },
    { label: "Verification Source(s)", valueKey: "Verification Source(s)" },
    { label: "Sale or Financing Concessions", valueKey: "Sale or Financing Concessions", adjustmentKey: "Sale or Financing Concessions Adjustment" },
    { label: "Date of Sale/Time", valueKey: "Date of Sale/Time", adjustmentKey: "Date of Sale/Time Adjustment" },
    { label: "Location", valueKey: "Location", adjustmentKey: "Location Adjustment" },
    { label: "Leasehold/Fee Simple", valueKey: "Leasehold/Fee Simple", adjustmentKey: "Leasehold/Fee Simple Adjustment" },
    { label: "Site", valueKey: "Site", adjustmentKey: "Site Adjustment" },
    { label: "View", valueKey: "View", adjustmentKey: "View Adjustment" },
    { label: "Design (Style)", valueKey: "Design (Style)", adjustmentKey: "Design (Style) Adjustment" },
    { label: "Quality of Construction", valueKey: "Quality of Construction", adjustmentKey: "Quality of Construction Adjustment" },
    { label: "Actual Age", valueKey: "Actual Age", adjustmentKey: "Actual Age Adjustment" },
    { label: "Condition", valueKey: "Condition", adjustmentKey: "Condition Adjustment" },
    { label: "Total Rooms", valueKey: "Total Rooms" },
    { label: "Bedrooms", valueKey: "Bedrooms", adjustmentKey: "Bedrooms Adjustment" },
    { label: "Baths", valueKey: "Baths", adjustmentKey: "Baths Adjustment" },
    // { label: "Above Grade Room Count Adjustment", valueKey: "Above Grade Room Count Adjustment", isAdjustmentOnly: true },
    { label: "Gross Living Area", valueKey: "Gross Living Area", adjustmentKey: "Gross Living Area Adjustment" },
    { label: "Basement & Finished", valueKey: "Basement & Finished Rooms Below Grade", adjustmentKey: "Basement & Finished Rooms Below Grade Adjustment" },
    { label: "Functional Utility", valueKey: "Functional Utility", adjustmentKey: "Functional Utility Adjustment" },
    { label: "Heating/Cooling", valueKey: "Heating/Cooling", adjustmentKey: "Heating/Cooling Adjustment" },
    { label: "Energy Efficient Items", valueKey: "Energy Efficient Items", adjustmentKey: "Energy Efficient Items Adjustment" },
    { label: "Garage/Carport", valueKey: "Garage/Carport", adjustmentKey: "Garage/Carport Adjustment" },
    { label: "Porch/Patio/Deck", valueKey: "Porch/Patio/Deck", adjustmentKey: "Porch/Patio/Deck Adjustment" },
    { label: "Net Adjustment (Total)", valueKey: "Net Adjustment (Total)" },
    { label: "Adjusted Sale Price", valueKey: "Adjusted Sale Price of Comparable" },
  ];

  const rentScheduleReconciliationFields = [
    "Comments on market data, including the range of rents for single family properties, an estimate of vacancy for single family rental properties, the general trend of rents and vacancy, and support for the above adjustments. (Rent concessions should be adjusted to the market, not to the subject property.)",
    "Final Reconciliation of Market Rent:",
    "I (WE) ESTIMATE THE MONTHLY MARKET RENT OF THE SUBJECT AS OF",
    "TO BE $",
  ];

  const RentSchedulesFIELDS2 = [
    "Address",
    "Proximity to Subject",
    "Date Lease Begins",
    "Date Lease Expires",
    "Monthly Rental",
    "Less: Utilities",
    "Furniture",
    "Adjusted Monthly Rent",
    "Data Source",
    "Rent",
    "Concessions",
    "Location/View",
    "Design and Appeal",
    "Age/Condition",
    "Room Count Total",
    "Room Count Bdrms",
    "Room Count Baths",
    "Gross Living Area",
    "Other (e.g., basement, etc.)",
    "Other:",
    "Net Adj. (total)",
    "Indicated Monthly Market Rent",
  ];



  const comparableSales = [
    "COMPARABLE SALE #1",
    "COMPARABLE SALE #2",
    "COMPARABLE SALE #3",
    "COMPARABLE SALE #4",
    "COMPARABLE SALE #5",
    "COMPARABLE SALE #6",
    "COMPARABLE SALE #7",
    "COMPARABLE SALE #8",
    "COMPARABLE SALE #9",

  ];

  const comparableRents = [
    "COMPARABLE RENT #1",
    "COMPARABLE RENT #2",
    "COMPARABLE RENT #3",
    "COMPARABLE RENT #4",
    "COMPARABLE RENT #5",
    "COMPARABLE RENT #6",
    "COMPARABLE RENT #7",
    "COMPARABLE SALE #8",
    "COMPARABLE SALE #9",
  ];

  const onFileChange = (e) => {
    const file = e.target.files && e.target.files[0];

    // Reset all relevant states when a new file is selected
    setData({});
    setExtractionAttempted(false);
    setLastExtractionTime(null);
    setRawGemini('');
    setPromptAnalysisResponse(null);
    setSubmittedPrompt('');
    setStateReqResponse(null);
    setUnpaidOkResponse(null);
    setClientReqResponse(null);
    setFhaResponse(null);
    setActiveSection(null);
    setModalContent(null);
    setContractExtracted(false);

    if (file) {
      setSelectedFile(file);
      localStorage.setItem('fileUploadStartTime', Date.now().toString());
      localStorage.setItem('fileUploadName', file.name);
      setNotification({
        open: true, message: 'File uploaded successfully.', severity: 'success'
      });
      setFileUploadTimer(0);
      setIsTimerRunning(true);
      extractInitialSections(); // Trigger initial extraction
      // We will no longer trigger initial extraction on file change.
      // The user can extract sections via the sidebar.
      // This prevents errors if the API is not ready or if the user
      // changes their mind.
      // If you want to restore this, you can call:
      // extractInitialSections();
    }
  };

  useEffect(() => {

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const [rawGemini, setRawGemini] = useState('');

  const validateInputs = () => {
    if (!selectedFormType) {
      setNotification({ open: true, message: 'Please select a Form Type first.', severity: 'warning' });
      return false;
    }
    if (!selectedFile) {
      setNotification({ open: true, message: 'Please select a file first.', severity: 'warning' });
      return false;
    }
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setNotification({ open: true, message: 'Only PDF files are supported.', severity: 'error' });
      return false;
    }
    return true;
  };

  const startExtractionProcess = () => {
    setLoading(true);
    setExtractionAttempted(true);
    setExtractionProgress(0);
    setTimer(0);
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const callExtractionAPI = async (formType, category, onRetry) => {
    setExtractionProgress(10);
    const retries = 3;
    let progressInterval;
    const delay = 1000;

    for (let i = 0; i < retries; i++) {
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('form_type', formType);
        if (category) {
          formData.append('category', category);
        }

        progressInterval = setInterval(() => {
          setExtractionProgress(prev => (prev < 40 ? prev + 5 : prev));
        }, 500);

        const response = await fetch('/api/extract', {
          method: 'POST', body: formData
        });

        if (!response.ok) {
          let error;
          try {
            const err = await response.json();
            error = new Error(err.error || 'Extraction failed with a non-JSON response.');
          } catch (jsonError) {
            const errorText = await response.text();
            error = new Error(errorText || 'An unknown extraction error occurred.');
          }
          throw error;
        }
        clearInterval(progressInterval);
        setExtractionProgress(90);
        return await response.json();
      } catch (error) {
        if (progressInterval) clearInterval(progressInterval);
        if (i < retries - 1) {
          const currentDelay = delay * Math.pow(2, i);
          onRetry(i + 1, retries);
          await new Promise(res => setTimeout(res, currentDelay));
        } else {
          throw error;
        }
      }
    }
  };

  const processExtractionResult = (result, startTime, category) => {
    const normalizedFields = {};
    const longUtilField = "Utilities included in the unit monthly assessment [None/Heat/Air/Conditioning/Electricity/Gas/Water/Sewer/Cable/Other (describe)]";
    if (result.fields && result.fields[longUtilField]) {
      result.fields["Utilities included in the unit monthly assessment"] = result.fields[longUtilField];
    }

    Object.keys(result.fields || {}).forEach(key => {
      if (key.toUpperCase() === "SUBJECT") {
        normalizedFields["Subject"] = result.fields[key];
      } else {
        normalizedFields[key] = result.fields[key];
      }
    });
    Object.assign(normalizedFields, result.fields);

    setData(prevData => {
      const updatedData = { ...prevData, ...normalizedFields };
      // Ensure nested objects are merged, not replaced
      Object.keys(normalizedFields).forEach(key => {
        if (typeof normalizedFields[key] === 'object' && normalizedFields[key] !== null && !Array.isArray(normalizedFields[key])) {
          updatedData[key] = { ...(prevData[key] || {}), ...normalizedFields[key] };
        }
      });
      return updatedData;
    });
    setRawGemini(result.raw || '');
    const durationInMs = Date.now() - startTime;
    const totalSeconds = Math.floor(durationInMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const sectionName = category ? `${category.replace(/_/g, ' ').toLowerCase()} section` : 'extraction';
    let durationMessage = '';
    if (minutes > 0) {
      durationMessage += `${minutes}m `;
    }
    durationMessage += `${seconds}s`;
    setNotification({
      open: true,
      message: <>Extraction of <strong style={{ color: '#000000' }}>{sectionName}</strong> completed in {durationMessage}.</>,
      severity: 'success'
    });
    setLastExtractionTime(totalSeconds.toFixed(1));
    setExtractionProgress(100);
  };

  const handleExtract = async (category) => {
    setNotification({ open: false, message: '', severity: 'info' });
    if (!validateInputs()) return;
    // If no category is provided, and the user clicks the main extract button,
    // we should probably extract everything. For now, we require a section.
    // This logic can be adjusted based on desired behavior for a "full extract" button.
    if (!category && !selectedFile) {
      setNotification({ open: true, message: 'Please select a section from the sidebar to extract.', severity: 'info' });
      return;
    }

    startExtractionProcess();
    const startTime = Date.now();
    const categories = Array.isArray(category) ? category : [category];

    const extractionPromises = categories.map(cat =>
      callExtractionAPI(selectedFormType, cat, (attempt, maxAttempts) => {
        setNotification({ open: true, message: `Extraction for ${cat} failed. Retrying... (Attempt ${attempt}/${maxAttempts})`, severity: 'warning' });
      }).then(result => ({ category: cat, result }))
    );

    try {
      const results = await Promise.allSettled(extractionPromises);
      results.forEach(p => {
        if (p.status === 'fulfilled') {
          processExtractionResult(p.value.result, startTime, p.value.category);
          if (p.value.category === 'CONTRACT') {
            setContractExtracted(true);
          }
        } else {
          setNotification({ open: true, message: p.reason.message || `An unknown error occurred during extraction.`, severity: 'error' });
        }
      });
    } catch (e) {
      setNotification({ open: true, message: e.message || 'An unexpected error occurred during extraction.', severity: 'error' });
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      setLoading(false);
      if (extractionProgress !== 100) setExtractionProgress(0);
    }
  };

  const extractInitialSections = async () => {
    if (!selectedFile || !selectedFormType) return;
    if (!selectedFile || !selectedFormType) {
      // Do not proceed if there is no file.
      // This prevents sending an empty request on page load.
      return;
    }

    const initialCategories = ['SUBJECT', 'CONTRACT', 'SITE', 'IMPROVEMENTS', 'SALES_GRID'];
    setLoading(true);
    setExtractionAttempted(true);
    setTimer(0);
    timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);

    const extractionPromises = initialCategories.map(category => {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('form_type', selectedFormType);
      formData.append('category', category);
      return fetch('https://strdjrbservices1.pythonanywhere.com/api/extract-by-category/ ', { method: 'POST', body: formData })
        .then(res => res.ok ? res.json() : Promise.reject(`Failed to extract ${category}`))
        .then(result => ({ category, result }));
    });

    const results = await Promise.allSettled(extractionPromises);

    results.forEach(p => {
      if (p.status === 'fulfilled') {
        processExtractionResult(p.value.result, Date.now(), p.value.category);
      } else {
        console.error(p.reason);
      }
    });

    setLoading(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handlePromptAnalysis = async (prompt) => {
    if (!selectedFile) {
      setPromptAnalysisError('Please select a PDF file first.');
      return;
    }

    setPromptAnalysisLoading(true);
    setPromptAnalysisError('');
    setPromptAnalysisResponse(null);
    setModalContent(null);
    setStateReqResponse(null);
    setUnpaidOkResponse(null);
    setClientReqResponse(null);
    setFhaResponse(null);


    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('form_type', selectedFormType);
    formData.append('comment', prompt);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.detail || `HTTP error! status: ${res.status}`);
      }

      setPromptAnalysisResponse(result.fields);
      setSubmittedPrompt(prompt);
    } catch (e) {
      setPromptAnalysisError(e.message || 'An unexpected error occurred.');
    } finally {
      setPromptAnalysisLoading(false);
    }
  };

  // Helper function for API calls with retry logic
  const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
    const timeout = 60000; // 60 seconds timeout
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const res = await fetch(url, { ...options, signal: controller.signal });
        // If response is not a 5xx error, return it
        clearTimeout(id);
        if (res.status < 500) {
          return res;
        }
        // If it is a 5xx error, log and prepare to retry
        console.warn(`Attempt ${i + 1}: Server error ${res.status}. Retrying in ${delay / 1000}s...`);
      } catch (error) {
        // Network or other fetch errors
        console.warn(`Attempt ${i + 1}: Network error. Retrying in ${delay / 1000}s...`, error);
      }
      // Wait for the delay before the next attempt
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve));
        delay *= 2; // Exponential backoff
      }
    }
    throw new Error(`Failed to fetch from ${url} after ${retries} attempts.`);
  };

  const handleStateRequirementCheck = async () => {
    if (!selectedFile) {
      setStateReqError('Please select a PDF file first.');
      return;
    }

    setStateReqLoading(true);
    setStateReqError('');
    setStateReqResponse(null);
    setFhaLoading(true);
    setFhaError('');
    setFhaResponse(null);


    setModalContent({
      title: 'State Requirement Check',
      Component: StateRequirementCheck,
      props: { loading: true }
    });
    setIsCheckModalOpen(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('form_type', selectedFormType);
    formData.append('comment', STATE_REQUIREMENTS_PROMPT);

    try {
      const res = await fetchWithRetry('/api/extract', {
        method: 'POST',
        body: formData,

      }, 3, 1000); // 3 retries, starting with a 1-second delay

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.detail || `HTTP error! status: ${res.status}`);
      }
      const responseData = result.fields;
      setStateReqResponse(responseData);
      setModalContent({
        title: 'State Requirement Check',
        Component: StateRequirementCheck,
        props: { loading: false, response: responseData, error: '' }
      });
    } catch (e) {
      const errorMsg = e.message || 'An unexpected error occurred.';
      setStateReqError(errorMsg);
      setModalContent({
        title: 'State Requirement Check',
        Component: StateRequirementCheck,
        props: { loading: false, response: null, error: errorMsg }
      });
    } finally {
      setStateReqLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setLoading(false);
    }
  };

  const handleUnpaidOkCheck = async () => {
    if (!selectedFile) {
      setUnpaidOkError('Please select a PDF file first.');
      return;
    }

    setUnpaidOkLoading(true);
    setUnpaidOkError('');
    setUnpaidOkResponse(null);

    setModalContent({
      title: 'Unpaid OK Lender Check',
      Component: UnpaidOkCheck,
      props: { loading: true }
    });
    setIsCheckModalOpen(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('form_type', selectedFormType);
    formData.append('comment', UNPAID_OK_PROMPT);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.detail || `HTTP error! status: ${res.status}`);
      }
      const responseData = result.fields;
      setUnpaidOkResponse(responseData);
      setModalContent({
        title: 'Unpaid OK Lender Check',
        Component: UnpaidOkCheck,
        props: { loading: false, response: responseData, error: '' }
      });
    } catch (e) {
      const errorMsg = e.message || 'An unexpected error occurred.';
      setUnpaidOkError(errorMsg);
      setModalContent({
        title: 'Unpaid OK Lender Check',
        Component: UnpaidOkCheck,
        props: { loading: false, response: null, error: errorMsg }
      });
    } finally {
      setUnpaidOkLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setLoading(false);
    }
  };

  const handleClientRequirementCheck = async () => {
    if (!selectedFile) {
      setClientReqError('Please select a PDF file first.');
      return;
    }

    setClientReqLoading(true);
    setClientReqError('');
    setClientReqResponse(null);

    setModalContent({
      title: 'Client Requirement Check',
      Component: ClientRequirementCheck,
      props: { loading: true }
    });
    setIsCheckModalOpen(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('form_type', selectedFormType);
    formData.append('comment', CLIENT_REQUIREMENT_PROMPT);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.detail || `HTTP error! status: ${res.status}`);
      }
      const responseData = result.fields;
      setClientReqResponse(responseData);
      setModalContent({
        title: 'Client Requirement Check',
        Component: ClientRequirementCheck,
        props: { loading: false, response: responseData, error: '' }
      });
    } catch (e) {
      const errorMsg = e.message || 'An unexpected error occurred.';
      setClientReqError(errorMsg);
      setModalContent({
        title: 'Client Requirement Check',
        Component: ClientRequirementCheck,
        props: { loading: false, response: null, error: errorMsg }
      });
    } finally {
      setClientReqLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setLoading(false);
    }
  };

  const handleFhaCheck = async () => {
    if (!selectedFile) {
      setFhaError('Please select a PDF file first.');
      return;
    }

    setFhaLoading(true);
    setFhaError('');
    setFhaResponse(null);

    setModalContent({
      title: 'FHA Requirement Check',
      Component: FhaCheck,
      props: { loading: true }
    });
    setIsCheckModalOpen(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('form_type', selectedFormType);
    formData.append('comment', FHA_REQUIREMENTS_PROMPT);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.detail || `HTTP error! status: ${res.status}`);
      }
      const responseData = result.fields;
      setFhaResponse(responseData);
      setModalContent({
        title: 'FHA Requirement Check',
        Component: FhaCheck,
        props: { loading: false, response: responseData, error: '' }
      });
    } catch (e) {
      const errorMsg = e.message || 'An unexpected error occurred.';
      setFhaError(errorMsg);
      setModalContent({
        title: 'FHA Requirement Check',
        Component: FhaCheck,
        props: { loading: false, response: null, error: errorMsg }
      });
    } finally {
      setFhaLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setLoading(false);
    }
  };

  const handleEscalationCheck = async () => {
    if (!selectedFile) {
      setEscalationError('Please select a PDF file first.');
      return;
    }

    setEscalationLoading(true);
    setEscalationError('');
    setEscalationResponse(null);

    setModalContent({
      title: 'Escalation Check',
      Component: EscalationCheck,
      props: { loading: true }
    });
    setIsCheckModalOpen(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('form_type', selectedFormType);
    formData.append('comment', ESCALATION_CHECK_PROMPT);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.detail || `HTTP error! status: ${res.status}`);
      }
      const responseData = result.fields;
      setEscalationResponse(responseData);
      setModalContent({
        title: 'Escalation Check',
        Component: EscalationCheck,
        props: { loading: false, response: responseData, error: '' }
      });
    } catch (e) {
      const errorMsg = e.message || 'An unexpected error occurred.';
      setEscalationError(errorMsg);
      setModalContent({
        title: 'Escalation Check',
        Component: EscalationCheck,
        props: { loading: false, response: null, error: errorMsg }
      });
    } finally {
      setEscalationLoading(false);
    }
  };

  const handleSectionClick = (section) => {
    setActiveSection(section.id);
    if (!section.category) {
      // If the section doesn't have a specific category to extract, just scroll.
      const element = document.getElementById(section.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    setNotification({ open: true, message: `Extracting ${section.title}...`, severity: 'info' });
    handleExtract(section.category);
  };

  // const handleRefresh = () => {
  //   setData({});
  //   setActiveSection(null);
  //   localStorage.removeItem('fileUploadStartTime');
  //   localStorage.removeItem('fileUploadName');
  //   setLoading(false);
  //   setNotification({ open: false, message: '', severity: 'info' });
  //   setRawGemini('');
  //   setExtractionAttempted(false);
  //   setExtractionProgress(0);
  //   if (timerRef.current) {
  //     localStorage.removeItem('fileUploadStartTime');
  //     localStorage.removeItem('fileUploadName');
  //     setSelectedFile(null);
  //     setFileUploadTimer(0);
  //     clearInterval(timerRef.current);
  //   }
  // };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  useEffect(() => {
    if (notification.open) {
      if (notification.severity === 'success' || notification.severity === 'upload') {
        playSound(notification.severity);
      } else if (notification.severity === 'error' || notification.severity === 'warning') {
        playSound('error');
      }
    }
  }, [notification]);

  const handleGeneratePdf = () => {
    if (Object.keys(data).length === 0) {
      setNotification({ open: true, message: 'No data to generate PDF.', severity: 'warning' });


    }

    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 15;
      let yPos = margin;

      const addHeaderFooter = () => {
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          // Header
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text('Appraisal Report Summary', margin, 10);
          doc.text(new Date().toLocaleDateString(), pageWidth - margin, 10, { align: 'right' });
          // Footer
          doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }
      };

      const addSection = (title, sectionFields, sectionData, usePre = false) => {
        if (!sectionData || sectionFields.every(field => !sectionData[field])) return;

        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = margin;
        }

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(40);
        doc.text(title, margin, yPos);
        yPos += 8;

        const body = sectionFields.map(field => {
          let value = sectionData[field];
          if (typeof value === 'object' && value !== null) {
            value = Object.entries(value).map(([k, v]) => `${k}: ${v}`).join('\n');
          }
          return [field, value || ''];
        }).filter(row => row[1]);

        if (body.length > 0) {
          autoTable(doc, {
            startY: yPos,
            head: [['Field', 'Value']],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133], textColor: 255 },
            columnStyles: { 0: { cellWidth: 60 } },
            didDrawPage: (data) => { yPos = data.cursor.y + 10; },
            willDrawCell: (data) => {
              if (data.section === 'body' && usePre) {
                doc.setFont('Courier');
              }
            }
          });
          yPos = doc.lastAutoTable.finalY + 10;
        } else {
          yPos -= 8;
        }
      };

      const allSections = [
        { title: 'Subject Information', fields: subjectFields, data: data.Subject || data },
        { title: 'Contract', fields: contractFields, data: data.CONTRACT },
        { title: 'Neighborhood', fields: neighborhoodFields, data: data.NEIGHBORHOOD },
        { title: 'Site', fields: siteFields, data: data },
        { title: 'Improvements', fields: improvementsFields, data: data },
        { title: 'Sales History', fields: salesHistoryFields, data: data.Subject },
        { title: 'Prior Sale History', fields: priorSaleHistoryFields, data: data, usePre: true },
        { title: 'Reconciliation', fields: reconciliationFields, data: data },
        { title: 'Cost Approach', fields: costApproachFields, data: data },
        { title: 'Income Approach', fields: incomeApproachFields, data: data },
        { title: 'PUD Information', fields: pudInformationFields, data: data },
        { title: 'Market Conditions Addendum', fields: marketConditionsFields, data: data, usePre: true },
        { title: 'Certification/ signature section', fields: appraiserFields, data: data },
        { title: 'Supplemental Addendum', fields: supplementalAddendumFields, data: data, usePre: true },
      ];

      allSections.forEach(section => {
        addSection(section.title, section.fields, section.data, section.usePre);
      });

      if (data.Subject || comparableSales.some(s => data[s])) {
        if (yPos > pageHeight - 60) { doc.addPage(); yPos = margin; }
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(40);
        doc.text('Sales Comparison Approach', margin, yPos);
        yPos += 8;

        const activeComps = comparableSales.filter(sale => data[sale]);
        const head = [['Feature', 'Subject', ...activeComps]];
        const body = salesGridRows.map(row => {
          const rowData = [row.label];
          // Subject
          let subjectValue = data.Subject?.[row.valueKey] || data.Subject?.[row.subjectValueKey] || '';
          if (row.adjustmentKey && data.Subject?.[row.adjustmentKey]) {
            subjectValue += `\n(${data.Subject[row.adjustmentKey]})`;
          }
          rowData.push(subjectValue);
          // Comparables
          activeComps.forEach(sale => {
            let compValue = data[sale]?.[row.valueKey] || '';
            if (row.adjustmentKey && data[sale]?.[row.adjustmentKey]) {
              compValue += `\n(${data[sale][row.adjustmentKey]})`;
            }
            rowData.push(compValue);
          });
          return rowData;
        });

        autoTable(doc, {
          startY: yPos,
          head,
          body,
          theme: 'grid',
          styles: { fontSize: 7, cellPadding: 1 },
          headStyles: { fillColor: [22, 160, 133], textColor: 255, fontSize: 8 },
          didDrawPage: (data) => { yPos = data.cursor.y + 10; }
        });
      }

      addHeaderFooter();
      doc.save('Appraisal_Report_Summary.pdf');
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      setNotification({ open: true, message: 'An error occurred while generating the PDF.', severity: 'error' });

      setIsGeneratingPdf(false);
    }
  };

  const getVisibleSections = () => {
    const baseSections = sections.map(s => s.id);
    let visibleSectionIds = [];

    switch (selectedFormType) {
      case '1004':
        visibleSectionIds = baseSections.filter(id => !['rent-schedule-section', 'prior-sale-history-section', 'rent-schedule-reconciliation-section', 'project-site-section', 'project-info-section', 'project-analysis-section', 'unit-descriptions-section'].includes(id));
        break;
      case '1073':
        visibleSectionIds = baseSections.filter(id => !['rent-schedule-section', 'improvements-section', 'site-section', 'rent-schedule-reconciliation-section', 'pud-info-section', 'market-conditions-section'].includes(id));
        break;
      case '1007':
        visibleSectionIds = baseSections.filter(id => !['project-site-section', 'rent-schedule-reconciliation-section', 'prior-sale-history-section', 'project-info-section', 'project-analysis-section', 'unit-descriptions-section'].includes(id));
        break;
      default:

        visibleSectionIds = baseSections.filter(id => !['rent-schedule-section', 'rent-schedule-reconciliation-section', 'project-site-section', 'project-info-section', 'project-analysis-section', 'unit-descriptions-section']);
        break;
    }

    return sections.filter(section => visibleSectionIds.includes(section.id));
  };

  const renderForm = () => {
    const props = { data, allData: data, extractionAttempted, handleDataChange, editingField, setEditingField, isEditable, highlightedSubjectFields, highlightedContractFields, highlightedSiteFields, subjectFields, contractFields, neighborhoodFields, siteFields, improvementsFields, salesGridRows, comparableSales, salesComparisonAdditionalInfoFields, salesHistoryFields, priorSaleHistoryFields, reconciliationFields, costApproachFields, incomeApproachFields, pudInformationFields, marketConditionsFields, marketConditionsRows, condoCoopProjectsRows, condoForeclosureFields, appraiserFields, supplementalAddendumFields, uniformResidentialAppraisalReportFields, appraisalAndReportIdentificationFields, projectSiteFields, projectInfoFields, projectAnalysisFields, unitDescriptionsFields, imageAnalysisFields, dataConsistencyFields, comparableRents, RentSchedulesFIELDS2, rentScheduleReconciliationFields, formType: selectedFormType, comparisonData, getComparisonStyle, SalesComparisonSection, EditableField, infoOfSalesFields, loading, stateRequirementFields, handleStateRequirementCheck, stateReqLoading, stateReqResponse, stateReqError, handleUnpaidOkCheck, unpaidOkLoading, unpaidOkResponse, unpaidOkError, handleClientRequirementCheck, clientReqLoading, clientReqResponse, clientReqError, handleFhaCheck, fhaLoading, fhaResponse, fhaError, handleEscalationCheck, escalationLoading, escalationResponse, escalationError, onDataChange: handleDataChange, handleExtract };

    let formComponent;
    switch (selectedFormType) {
      case '1004':
        formComponent = <Form1004 {...props} allData={data} />;
        break;
      case '1073':
        formComponent = <Form1073 {...props} allData={data} />;
        break;
      case '1007':
        formComponent = <Form1007 {...props} allData={data} />;
        break;
      default:
        return (
          <Typography sx={{ mt: 2, textAlign: 'center' }}>Please select a form type to see the report details.</Typography>
        );
    }
    return (
      <Fade in={!!selectedFormType} timeout={1000}>
        <div>{formComponent}</div>
      </Fade>
    );
  };

  const activeTheme = themeMode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <TooltipStyles />

      <div className="page-container">
        <Sidebar
          sections={getVisibleSections()}
          isOpen={isSidebarOpen || isSidebarLocked}
          isLocked={isSidebarLocked}
          onLockToggle={() => { setIsSidebarLocked(!isSidebarLocked); setIsEditable(!isEditable); }}
          onMouseEnter={() => {
            if (!isSidebarLocked) setIsSidebarOpen(true);
          }}
          onMouseLeave={() => {
            if (!isSidebarLocked) setIsSidebarOpen(false);
          }}
          onSectionClick={handleSectionClick}
          onThemeToggle={handleThemeChange}
          currentTheme={themeMode}
          activeSection={activeSection}
        />
        <div className={`main-content container-fluid ${isSidebarOpen || isSidebarLocked ? 'sidebar-open' : ''}`}>
          <div className="header-container">
            <img
              src={process.env.PUBLIC_URL + '/logo.png'}
              alt="logo"
              className="logo"
            />
            <h2 className="app-title">Appraisal Report</h2>
          </div>



          <Paper elevation={2} sx={{ p: 2, position: 'sticky', top: 0, zIndex: 1100, height: 'fit-content', backgroundColor: activeTheme.palette.background.paper }}>
            <Stack spacing={0.5}>


              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"

                    className='select'
                  >
                    Select PDF File
                    <input
                      type="file"
                      hidden
                      accept=".pdf,application/pdf"
                      ref={fileInputRef}
                      onChange={onFileChange}
                    />
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl size="small">
                    <InputLabel id="form-type-select-label">Form Type</InputLabel>
                    <Select
                      labelId="form-type-select-label"
                      id="form-type-select"
                      value={selectedFormType}
                      label="Form Type"
                      onChange={(e) => setSelectedFormType(e.target.value)}
                      className='select'
                    >
                      {formTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button variant="contained" className='select' color="primary" onClick={handleGeneratePdf} disabled={Object.keys(data).length === 0} fullWidth>
                    {isGeneratingPdf ? <CircularProgress size={24} color="inherit" /> : 'Generate PDF'}
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button variant="outlined" className='select' color="info" onClick={() => setIsComparisonDialogOpen(true)} fullWidth>
                    Fast App
                  </Button>
                </Grid>
              </Grid>
              {selectedFile &&
                <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" noWrap>
                      Selected File: <strong>{selectedFile.name}</strong>
                    </Typography>
                    {data['FHA Case No.'] && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                          FHA Case #: {data['FHA Case No.']}
                        </Typography>
                        <Tooltip title="Check FHA Requirements">
                          <IconButton onClick={handleFhaCheck} size="small" sx={{ ml: 1 }}>
                            <InfoIcon fontSize="small" color="info" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}

                    {data['ANSI'] && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 3 }}>
                          ANSI:
                        </Typography>
                        <EditableField style={{ maxwidth: 'auto', marginLeft: '30px', marginRight: '30px' }} fieldPath={['ANSI']} value={data['ANSI']} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} allData={data} />
                      </Box>
                    )}


                    {data['Exposure comment'] && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 'bold', mr: 1 }}>
                          Exposure Comment:
                        </Typography>
                        <EditableField fieldPath={['Exposure comment']} value={data['Exposure comment']} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} allData={data} />
                      </Box>
                    )}

                    {data['Prior service comment'] && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 'bold', mr: 1 }}>
                          Prior Service Comment:
                        </Typography>
                        <EditableField
                          fieldPath={['Prior service comment']}
                          value={data['Prior service comment']}
                          onDataChange={handleDataChange}
                          editingField={editingField} setEditingField={setEditingField}
                          isEditable={isEditable} allData={data}
                        />
                      </Box>
                    )}
                    {isUnpaidOkLender && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          Unpaid OK can proceed with review
                        </Typography>
                      </Box>
                    )}
                    {/* {data['Assignment Type']?.toLowerCase() === 'purchase transaction' && ( */}
                    {data['Assignment Type']?.toLowerCase() === 'purchase transaction' && !contractExtracted && (
                      <Tooltip title="Extract Contract Section">
                        <IconButton
                          // onClick={() => handleExtract('CONTRACT')}
                          onClick={() => {
                            handleExtract('CONTRACT');
                            setContractExtracted(true);
                          }}
                          size="small"
                          sx={{ color: '#db1873ff', fontSize: '0.9rem' }}
                          disabled={loading}
                        >Assignment Type Purchase Transaction<WarningIcon /></IconButton>
                      </Tooltip>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: '100%', maxWidth: 300 }}>
                      {loading && (
                        <>
                          <Typography variant="body2" align="center" sx={{ fontWeight: 'bold' }}>
                            Elapsed Time : {Math.floor(timer / 60)}m {timer % 60}s
                          </Typography>
                          <LinearProgress variant="determinate" value={extractionProgress} />
                        </>
                      )}
                      {!loading && lastExtractionTime && (
                        <Typography variant="body2" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                          Last extraction: {lastExtractionTime >= 60 ? `${Math.floor(lastExtractionTime / 60)}m ` : ''}
                          {`${(lastExtractionTime % 60).toFixed(1)}s`}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'left', marginRight: '10px', marginLeft: '100px', cursor: 'pointer' }} onClick={handleTimerToggle}>
                      <Tooltip title={isTimerRunning ? "Click to pause timer" : "Click to start timer"}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Total Time:
                          {Math.floor(fileUploadTimer / 3600).toString().padStart(2, '0')}:
                          {Math.floor((fileUploadTimer % 3600) / 60).toString().padStart(2, '0')}:
                          {(fileUploadTimer % 60).toString().padStart(2, '0')}
                        </Typography>
                      </Tooltip>
                    </Box>
                  </Grid>

                </Grid>

              }
            </Stack>
          </Paper>

          <ComparisonDialog
            open={isComparisonDialogOpen}
            onClose={() => setIsComparisonDialogOpen(false)}
            data={comparisonData}
            onDataChange={handleComparisonDataChange}
          />

          <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled" sx={{ width: '100%' }}>
              {notification.message}
            </Alert>
          </Snackbar>

          {renderForm()}

          <PromptAnalysis
            onPromptSubmit={handlePromptAnalysis}
            loading={promptAnalysisLoading}
            response={promptAnalysisResponse}
            error={promptAnalysisError}

            submittedPrompt={submittedPrompt}
          />

          {rawGemini && (
            <div id="raw-output" className="mt-4">
              <h5>Raw Gemini Output (Debug):</h5>
              <pre style={{ background: '#f8f9fa', padding: '1em', borderRadius: '6px', maxHeight: '300px', overflow: 'auto' }}>{rawGemini}</pre>
            </div>
          )}
        </div>
        {modalContent && (
          <Dialog open={isCheckModalOpen} onClose={() => setIsCheckModalOpen(false)} fullWidth maxWidth="md">
            <DialogTitle>
              {modalContent.title}
              <IconButton
                aria-label="close"
                onClick={() => setIsCheckModalOpen(false)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <modalContent.Component {...modalContent.props} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ThemeProvider >

  );
}




export default Subject;
