
import { SubjectInfoCard, GridInfoCard, MarketConditionsTable, EditableField } from './FormComponents'; // Assuming EditableField is still needed elsewhere
import { Button, Stack } from '@mui/material';
import { ComparableAddressConsistency, CondoCoopProjectsTable } from './subject';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SalesComparisonSection from './SalesComparisonSection';
const Form1007 = ({ data, allData, extractionAttempted, handleDataChange, editingField, setEditingField, highlightedSubjectFields, highlightedContractFields, highlightedSiteFields, subjectFields, contractFields, neighborhoodFields, siteFields, improvementsFields, salesGridRows, comparableSales, salesHistoryFields, salesComparisonAdditionalInfoFields, reconciliationFields, costApproachFields, incomeApproachFields, pudInformationFields, marketConditionsRows, marketConditionsFields, appraiserFields, supplementalAddendumFields, uniformResidentialAppraisalReportFields, appraisalAndReportIdentificationFields, imageAnalysisFields, dataConsistencyFields, condoCoopProjectsRows, condoForeclosureFields, comparableRents, RentSchedulesFIELDS2, rentScheduleReconciliationFields, formType, comparisonData, getComparisonStyle, infoOfSalesFields, loading, loadingSection, stateRequirementFields, handleStateRequirementCheck, stateReqLoading, stateReqResponse, stateReqError, handleUnpaidOkCheck, unpaidOkLoading, unpaidOkResponse, unpaidOkError, handleClientRequirementCheck, clientReqLoading, clientReqResponse, clientReqError, handleFhaCheck, fhaLoading, fhaResponse, fhaError, handleEscalationCheck, escalationLoading, escalationResponse, escalationError }) => (
  <>
    <Stack direction="row" spacing={2} sx={{ mb: 2, mt: 2 }}>
        <Button variant="contained" onClick={handleStateRequirementCheck} disabled={stateReqLoading} className="blink-me">
            State Req Check
        </Button>
        {/* <Button variant="contained" onClick={handleUnpaidOkCheck} disabled={unpaidOkLoading}>
            Unpaid OK Check
        </Button> */}
        <Button variant="contained" onClick={handleClientRequirementCheck} disabled={clientReqLoading} className="blink-me">
            Client Req Check
        </Button>
        <Button variant="contained" onClick={handleEscalationCheck} disabled={escalationLoading} color="error">
            Escalation Check
        </Button>
        {/* <Button variant="contained" onClick={handleFhaCheck} disabled={fhaLoading}>FHA Check</Button> */}
    </Stack>
    <SubjectInfoCard id="subject-info" title="Subject Information" fields={subjectFields} data={data} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange([field], value)} isEditable={true} editingField={editingField} setEditingField={setEditingField} highlightedFields={highlightedSubjectFields} allData={allData} comparisonData={comparisonData} getComparisonStyle={getComparisonStyle} loading={loading} loadingSection={loadingSection} />
    <GridInfoCard id="contract-section" title="Contract Section" fields={contractFields} data={data.CONTRACT} cardClass="bg-secondary" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['CONTRACT', ...field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} highlightedFields={highlightedContractFields} allData={allData} loading={loading} loadingSection={loadingSection} />
    <GridInfoCard id="neighborhood-section" title="Neighborhood Section" fields={neighborhoodFields} data={data.NEIGHBORHOOD} cardClass="bg-info" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['NEIGHBORHOOD', ...field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} />
    <GridInfoCard id="site-section" title="Site Section" fields={siteFields} data={data} cardClass="bg-warning" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} highlightedFields={highlightedSiteFields} allData={allData} loading={loading} loadingSection={loadingSection} />
    <GridInfoCard id="improvements-section" title="Improvements Section" fields={improvementsFields} data={data} cardClass="bg-success" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} />
    <GridInfoCard id="info-of-sales-section" title="Sales Comparison Approach" fields={infoOfSalesFields} data={data.INFO_OF_SALES} cardClass="bg-primary" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['INFO_OF_SALES', ...field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} />

    <SalesComparisonSection
      data={data}
      extractionAttempted={extractionAttempted}
      handleDataChange={handleDataChange}
      editingField={editingField}
      setEditingField={setEditingField}
      salesGridRows={salesGridRows}
      comparableSales={comparableSales}
      salesHistoryFields={salesHistoryFields}
      salesComparisonAdditionalInfoFields={salesComparisonAdditionalInfoFields}
      isEditable={true}
      allData={allData}
      formType={formType}
    />
    <div id="rent-schedule-section" style={{ marginBottom: '1rem', marginTop: '1rem' }} className="card shadow mb-4">
      <div className="card-header CAR1 bg-info text-white" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <strong>Comparable Rent Schedule</strong>
      </div>
      <div className="card-body p-0 table-container">
        <table className="table table-hover table-striped mb-0" style={{ fontSize: '0.8rem' }}>
          <thead className="table-light">
            <tr>
              <th className="border border-gray-400 p-1 bg-gray-200">Feature</th>
              <th className="border border-gray-400 p-1 bg-gray-200">Subject</th>
              {comparableRents.map((rent, idx) => (
                <th key={idx} className="border border-gray-400 p-1 bg-gray-200">{rent}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RentSchedulesFIELDS2.map((feature, idx) => (
              <tr key={idx}>
                <td className="border border-gray-400 p-1 font-medium">{feature}</td>
                <td className="border border-gray-400 p-1">
                  <EditableField
                    fieldPath={['Subject', feature]} value={(data.Subject && data.Subject[feature]) || ''}
                    onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField}
                    isMissing={extractionAttempted && (!data.Subject || !data.Subject[feature] || data.Subject[feature] === '')} isEditable={true}
                     />
                </td>
                {comparableRents.map((rent, cidx) => (
                  <td key={cidx} className="border border-gray-400 p-1">
                    <EditableField
                      fieldPath={[rent, feature]}
                      value={(data[rent] && data[rent][feature]) || ''}
                      onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField}
                      isMissing={extractionAttempted && (!data[rent] || !data[rent][feature] || data[rent][feature] === '')} isEditable={true}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    <GridInfoCard id="rent-schedule-reconciliation-section" title="Comparable Rent Schedule Reconciliation" fields={rentScheduleReconciliationFields} data={data} cardClass="bg-info" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} loading={loading} loadingSection={loadingSection} />

    <GridInfoCard id="reconciliation-section" title="RECONCILIATION" fields={reconciliationFields} data={data.RECONCILIATION} cardClass="bg-secondary" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['RECONCILIATION', ...field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} />
    <GridInfoCard id="cost-approach-section" title="Cost Approach" fields={costApproachFields} data={data} cardClass="bg-dark" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} />
    <GridInfoCard id="income-approach-section" title="Income Approach" fields={incomeApproachFields} data={data} cardClass="bg-danger" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} />
    <GridInfoCard id="pud-info-section" title="PUD Information" fields={pudInformationFields} data={data} cardClass="bg-secondary" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} />
    <GridInfoCard id="market-conditions-summary" title="Market Conditions" fields={marketConditionsFields} data={data?.MARKET_CONDITIONS} cardClass="bg-warning" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['MARKET_CONDITIONS', field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} loading={loading} loadingSection={loadingSection} />
    <MarketConditionsTable id="market-conditions-section" data={data} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} marketConditionsRows={marketConditionsRows} />
    <CondoCoopProjectsTable id="condo-coop-section" title="CONDO/CO-OP PROJECTS" data={data} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={true} condoCoopProjectsRows={condoCoopProjectsRows} extractionAttempted={extractionAttempted} />    <GridInfoCard id="condo-foreclosure-section" 
     fields={condoForeclosureFields} data={data.CONDO_FORECLOSURE} cardClass="bg-primary" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['CONDO_FORECLOSURE',...field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} />
    <GridInfoCard id="appraiser-section" title="CERTIFICATION" fields={appraiserFields} data={data.CERTIFICATION} cardClass="bg-info" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['CERTIFICATION', ...field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} />
    {/* <FieldTable id="supplemental-addendum-section" title="Supplemental Addendum" fields={supplementalAddendumFields} data={data} cardClass="bg-light text-dark" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange([field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} />
    <FieldTable id="uniform-report-section" title="Uniform Residential Appraisal Report" fields={uniformResidentialAppraisalReportFields} data={data} cardClass="bg-dark" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange([field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} />
    <FieldTable id="appraisal-id-section" title="Appraisal and Report Identification" fields={appraisalAndReportIdentificationFields} data={data} cardClass="bg-info" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange([field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} /> */}
    <ComparableAddressConsistency data={data} comparableSales={comparableSales} extractionAttempted={extractionAttempted} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} />

    <div id="data-consistency-section" style={{ marginBottom: '1rem', marginTop: '1rem' }} className="card shadow mb-4">
      <div className="card-header CAR1 bg-dark text-white" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <strong>Data Consistency Check</strong>
      </div>
      <div className="card-body p-0 table-container">
        <table className="table table-hover table-striped mb-0">
          <thead className="table-light">
            <tr>
              <th>Feature</th>
              <th>Improvements</th>
              <th>Sales Grid</th>
              <th>Photos</th>
              <th>Floor Plan</th>
              <th>label correct?</th>
              <th>duplicate photo?</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(dataConsistencyFields).map((feature) => (
              <tr key={feature}>
                <td className="font-medium">{feature}</td>
                {Object.keys(dataConsistencyFields[feature]).map((source) => {
                  // const values = Object.values(dataConsistencyFields[feature]).map(fieldName => data[fieldName]).filter(Boolean);
                  const fieldName = dataConsistencyFields[feature][source];
                  const value = data[fieldName];
                  const isMissing = extractionAttempted && (!value || value === '');
                  return (
                    <td key={source} style={isMissing ? { border: '2px solid red' } : {}}>
                      <EditableField
                        fieldPath={[fieldName]}
                        value={value || ''}
                        onDataChange={(path, val) => handleDataChange(path, val)}
                        editingField={editingField} setEditingField={setEditingField}
                        isMissing={isMissing} isEditable={true} />
                    </td>
                  );
                })}
                <td>
                  {feature === 'Bedroom' && <EditableField fieldPath={['photo and label of the Bedrooms correct are matching?']} value={data['photo and label of the Bedrooms correct are matching?'] || ''} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={true} />}
                  {feature === 'Bathroom' && <EditableField fieldPath={['photo and label of the Bathrooms correct are matching?']} value={data['photo and label of the Bathrooms correct are matching?'] || ''} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={true} />}
                </td>
                <td>
                  {feature === 'Bedroom' && <EditableField fieldPath={['check for the duplicate photo of the Bedrooms?']} value={data['check for the duplicate photo of the Bedrooms?'] || ''} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={true} />}
                  {feature === 'Bathroom' && <EditableField fieldPath={['check for the duplicate photo of the Bathrooms?']} value={data['check for the duplicate photo of the Bathrooms?'] || ''} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={true} />}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {(() => {
                    const values = Object.values(dataConsistencyFields[feature]).map(fieldName => data[fieldName]).filter(Boolean);
                    if (values.length === 0) return null;
                    const uniqueValues = new Set(values.map(v => String(v).trim()));
                    const isConsistent = uniqueValues.size <= 1;
                    return isConsistent ? <CheckCircleOutlineIcon style={{ color: 'green' }} /> : <ErrorOutlineIcon style={{ color: 'red' }} />;
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    {/* <GridInfoCard id="image-analysis-section" title="Image Analysis" fields={imageAnalysisFields} data={data.IMAGE_ANALYSIS} cardClass="bg-dark" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['IMAGE_ANALYSIS', ...field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} /> */}
  </>
);

export default Form1007;