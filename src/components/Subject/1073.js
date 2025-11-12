
import { SubjectInfoCard, GridInfoCard,  MarketConditionsTable, EditableField } from './FormComponents'; // Assuming EditableField is still needed elsewhere
import { Button, Stack } from '@mui/material';
import { ComparableAddressConsistency, CondoCoopProjectsTable } from './subject';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SalesComparisonSection from './SalesComparisonSection';
const Form1073 = ({ data, allData, extractionAttempted, handleDataChange, editingField, setEditingField, isEditable, highlightedSubjectFields, highlightedContractFields, subjectFields, contractFields, neighborhoodFields, salesGridRows, comparableSales, salesHistoryFields, priorSaleHistoryFields, salesComparisonAdditionalInfoFields, marketConditionsRows, marketConditionsFields, reconciliationFields, costApproachFields, incomeApproachFields, condoCoopProjectsRows, condoForeclosureFields, appraiserFields, supplementalAddendumFields, uniformResidentialAppraisalReportFields, appraisalAndReportIdentificationFields, projectSiteFields, projectInfoFields, projectAnalysisFields, unitDescriptionsFields, imageAnalysisFields, dataConsistencyFields, formType, comparisonData, getComparisonStyle, infoOfSalesFields, loading, loadingSection, stateRequirementFields, handleStateRequirementCheck, stateReqLoading, stateReqResponse, stateReqError, handleUnpaidOkCheck, unpaidOkLoading, unpaidOkResponse, unpaidOkError, handleClientRequirementCheck, clientReqLoading, clientReqResponse, clientReqError, handleFhaCheck, fhaLoading, fhaResponse, fhaError, handleEscalationCheck, escalationLoading, escalationResponse, escalationError }) => (
    <>
        <Stack direction="row" spacing={2} sx={{ mb: 2, mt: 2 }}>
            <Button variant="contained" onClick={handleStateRequirementCheck} disabled={stateReqLoading} className="blink-me">
                State Req Check
            </Button>
            <Button variant="contained" onClick={handleClientRequirementCheck} disabled={clientReqLoading} className="blink-me">
                Client Req Check
            </Button>
            <Button variant="contained" onClick={handleEscalationCheck} disabled={escalationLoading} color="error">
                Escalation Check
            </Button>
        </Stack>
    <SubjectInfoCard id="subject-info" title="Subject Information" fields={subjectFields} data={data} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange([field], value)} isEditable={true} editingField={editingField} setEditingField={setEditingField} highlightedFields={highlightedSubjectFields} allData={allData} comparisonData={comparisonData} getComparisonStyle={getComparisonStyle} loading={loading} loadingSection={loadingSection} />
    <GridInfoCard id="contract-section" title="Contract Section" fields={contractFields} data={data.CONTRACT} cardClass="bg-secondary" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['CONTRACT', ...field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} highlightedFields={highlightedContractFields} allData={allData} loading={loading} loadingSection={loadingSection} />
    <GridInfoCard id="neighborhood-section" title="Neighborhood Section" fields={neighborhoodFields} data={data.NEIGHBORHOOD} cardClass="bg-info" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['NEIGHBORHOOD', ...field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} />
    <GridInfoCard id="project-site-section" title="Project Site" fields={projectSiteFields} data={data} cardClass="bg-primary" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} />
    <GridInfoCard id="project-info-section" title="Project Information" fields={projectInfoFields} data={data} cardClass="bg-secondary" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} />
    <GridInfoCard id="project-analysis-section" title="Project Analysis" fields={projectAnalysisFields} data={data} cardClass="bg-info" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} />
    <GridInfoCard id="unit-descriptions-section" title="Unit Descriptions" fields={unitDescriptionsFields} data={data} cardClass="bg-warning" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} />
    <GridInfoCard id="prior-sale-history-section" title="Prior Sale History" fields={priorSaleHistoryFields} data={data} cardClass="bg-dark" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={true} allData={allData} loading={loading} loadingSection={loadingSection} />
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
    <GridInfoCard id="reconciliation-section" title="RECONCILIATION" fields={reconciliationFields} data={data.RECONCILIATION} cardClass="bg-secondary" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['RECONCILIATION', ...field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} allData={allData} loading={loading} loadingSection={loadingSection} />
    <GridInfoCard id="cost-approach-section" title="Cost Approach" fields={costApproachFields} data={data} cardClass="bg-dark" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} allData={allData} loading={loading} loadingSection={loadingSection} />
    <GridInfoCard id="income-approach-section" title="Income Approach" fields={incomeApproachFields} data={data} cardClass="bg-danger" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} allData={allData} loading={loading} loadingSection={loadingSection} />
    <CondoCoopProjectsTable id="condo-coop-section" title="CONDO/CO-OP PROJECTS" data={data} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} condoCoopProjectsRows={condoCoopProjectsRows} extractionAttempted={extractionAttempted} />
    <GridInfoCard id="condo-foreclosure-section" fields={condoForeclosureFields} data={data.CONDO_FORECLOSURE} cardClass="bg-primary" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['CONDO_FORECLOSURE',...field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} allData={allData} loading={loading} loadingSection={loadingSection} />
    <GridInfoCard id="market-conditions-summary" title="Market Conditions" fields={marketConditionsFields} data={data?.MARKET_CONDITIONS} cardClass="bg-warning" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['MARKET_CONDITIONS', field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} loading={loading} loadingSection={loadingSection} />
    <MarketConditionsTable id="market-conditions-section"  data={data} onDataChange={(field, value) => handleDataChange(field, value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} marketConditionsRows={marketConditionsRows} />
    <GridInfoCard id="appraiser-section" title="CERTIFICATION" fields={appraiserFields} data={data.CERTIFICATION} cardClass="bg-info" extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['CERTIFICATION', ...field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} allData={allData} loading={loading} loadingSection={loadingSection} />
    {/* <FieldTable id="supplemental-addendum-section" title="Supplemental Addendum" fields={supplementalAddendumFields} data={data} cardClass="bg-light text-dark" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange([field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} allData={allData} />
    <FieldTable id="uniform-report-section" title="Uniform Residential Appraisal Report" fields={uniformResidentialAppraisalReportFields} data={data} cardClass="bg-dark" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange([field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} allData={allData} />    
    <FieldTable id="appraisal-id-section" title="Appraisal and Report Identification" fields={appraisalAndReportIdentificationFields} data={data} cardClass="bg-info" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange([field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} allData={allData} /> */}
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
                        isMissing={isMissing} 
                        isEditable={isEditable} />
                       
                    </td>
                  );
                })}
                <td>
                  {feature === 'Bedroom' && <EditableField fieldPath={['photo and label of the Bedrooms correct are matching?']} value={data['photo and label of the Bedrooms correct are matching?'] || ''} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} />}
                  {feature === 'Bathroom' && <EditableField fieldPath={['photo and label of the Bathrooms correct are matching?']} value={data['photo and label of the Bathrooms correct are matching?'] || ''} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={true} />}
                </td>
                <td>
                  {feature === 'Bedroom' && <EditableField fieldPath={['check for the duplicate photo of the Bedrooms?']} value={data['check for the duplicate photo of the Bedrooms?'] || ''} onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} />}
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
    {/* <GridInfoCard id="image-analysis-section" title="Image Analysis" fields={imageAnalysisFields} data={data.IMAGE_ANALYSIS} cardClass="bg-dark" usePre={true} extractionAttempted={extractionAttempted} onDataChange={(field, value) => handleDataChange(['IMAGE_ANALYSIS', ...field], value)} editingField={editingField} setEditingField={setEditingField} isEditable={isEditable} allData={allData} loading={loading} loadingSection={loadingSection} /> */}
  </>
);

export default Form1073;