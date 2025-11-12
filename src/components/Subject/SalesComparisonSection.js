
import { EditableField } from './FormComponents';


const SalesComparisonSection = ({
  data,
  extractionAttempted,
  handleDataChange,
  editingField,
  setEditingField,
  salesGridRows,
  comparableSales,
  salesHistoryFields,
  salesComparisonAdditionalInfoFields,
  formType,
  isEditable,
  allData
}) => {

  return (
    <>
      <div id="sales-comparison" style={{ marginBottom: '1rem', marginTop: '1rem' }} className="card shadow mb-4">
        <div className="card-header CAR1 bg-primary text-white" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
          <strong>Sales Comparison Approach</strong>
        </div>
        <div className="card-body p-0 table-container">
          <table className="table table-hover table-striped mb-0" style={{ fontSize: '0.8rem' }}>
            <thead className="table-light">
              <tr>
                <th className="border border-gray-400 p-1 bg-gray-200">Feature</th>
                <th className="border border-gray-400 p-1 bg-gray-200">Subject</th>
                {comparableSales.map((sale, idx) => (
                  <th key={idx} className="border border-gray-400 p-1 bg-gray-200">{sale}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {salesGridRows.map((row, idx) => {
                const isHighlighted = row.label === 'Date of Sale/Time';
                const rowClass = isHighlighted ? 'highlighted-field' : '';

                // let mostCommonSource = null;
                // let verificationSourcesInconsistent = false;
                if (row.label === "Verification Source(s)") {
                  const subjectSource = data.Subject?.[row.valueKey];
                  const sources = [subjectSource, ...comparableSales.map(sale => data[sale]?.[row.valueKey])].filter(Boolean);
                  if (sources.length > 0) {
                    // const sourceCounts = sources.reduce((acc, source) => {
                    //   acc[source] = (acc[source] || 0) + 1;
                    //   return acc;
                    // }, {});
                    // mostCommonSource = Object.keys(sourceCounts).reduce((a, b) => sourceCounts[a] > sourceCounts[b] ? a : b);
                    const uniqueSources = new Set(sources);
                    if (uniqueSources.size > 1) {
                      // verificationSourcesInconsistent = true;
                    }
                  }
                }

                let mostCommonLeasehold = null;
                let leaseholdInconsistent = false;
                if (row.label === "Leasehold/Fee Simple") {
                  const allValues = [data.Subject?.[row.valueKey], ...comparableSales.map(sale => data[sale]?.[row.valueKey])].filter(Boolean);
                  if (allValues.length > 0) {
                    const valueCounts = allValues.reduce((acc, value) => {
                      acc[value] = (acc[value] || 0) + 1;
                      return acc;
                    }, {});
                    mostCommonLeasehold = Object.keys(valueCounts).reduce((a, b) => valueCounts[a] > valueCounts[b] ? a : b);
                    const uniqueValues = new Set(allValues);
                    if (uniqueValues.size > 1) leaseholdInconsistent = true;
                  }
                }

                const subjectValue = row.label === "Verification Source(s)"
                  ? (comparableSales.map(sale => data[sale]?.[row.valueKey]).find(Boolean) || data.Subject?.[row.valueKey] || '')
                  : (row.subjectValueKey ? data[row.subjectValueKey] || '' : data.Subject?.[row.valueKey] || '');

                const subjectStyle = {};
                if (extractionAttempted && ((row.subjectValueKey && !data[row.subjectValueKey]) || (!row.subjectValueKey && (!data.Subject || !data.Subject[row.valueKey])))) {
                  subjectStyle.border = '2px solid red';
                }
                const subjectLeaseholdValue = data.Subject?.[row.valueKey] || '';
                if (leaseholdInconsistent && subjectLeaseholdValue && subjectLeaseholdValue !== mostCommonLeasehold) {
                  subjectStyle.backgroundColor = 'red';
                }

                return (
                  <tr key={idx} className={rowClass}>
                    <td className="border border-gray-400 p-1 font-medium" style={{ backgroundColor: 'var(--background-color-light)' }}>{row.label}</td>
                    <td className="border border-gray-400 p-1" style={subjectStyle}>
                      {data.Subject && !row.isAdjustmentOnly && (
                        <EditableField
                          fieldPath={row.subjectValueKey ? [row.subjectValueKey] : ['Subject', row.valueKey]}
                          value={subjectValue}
                          onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField}
                          isMissing={extractionAttempted && (row.subjectValueKey ? !data[row.subjectValueKey] : !data.Subject?.[row.valueKey])}
                          isEditable={true}
                          allData={allData}
                          saleName={'Subject'}
                        />
                      )}
                      {data.Subject && row.adjustmentKey && (
                        <EditableField
                          fieldPath={['Subject', row.adjustmentKey]} value={data.Subject[row.adjustmentKey] || ''}
                          onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField}
                          isMissing={extractionAttempted && (!data.Subject[row.adjustmentKey] || data.Subject[row.adjustmentKey] === '')}
                          isEditable={true} isAdjustment={true}
                        />
                      )}
                    </td>
                    {comparableSales.map((sale, cidx) => {
                      const compValue = data[sale]?.[row.valueKey] || '';
                      const adjValue = data[sale]?.[row.adjustmentKey] || '';
                      const cellStyle = {};
                      if (extractionAttempted && !row.isAdjustmentOnly && (!data[sale] || (compValue === undefined || compValue === ''))) {
                        cellStyle.border = '2px solid red';
                      }

                      return (
                        <td key={cidx} className="border border-gray-400 p-1" style={cellStyle}>
                          {!row.isAdjustmentOnly && (
                            <EditableField
                              fieldPath={[sale, row.valueKey]}
                              value={compValue}
                              onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField}
                              isMissing={extractionAttempted && (!compValue || compValue === '')}
                              isEditable={true}
                              allData={data}
                              saleName={sale}
                            />
                          )}
                          {row.adjustmentKey && (
                            <EditableField
                              fieldPath={[sale, row.adjustmentKey]}
                              value={adjValue}
                              onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField}
                              isMissing={extractionAttempted && (!adjValue || adjValue === '')}
                              isEditable={true}
                              isAdjustment={true}
                              allData={data}
                              saleName={sale}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card shadow mb-10">
        <div className="card-header CAR1 bg-info text-white" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
          <strong>Sales or Transfer History</strong>
        </div>
        <div className="card-body p-0">
          <table className="table table-hover table-striped mb-0">
            <thead className="table-light">
              <tr></tr>
            </thead>
            <tbody className="table-group-divider">
              {salesComparisonAdditionalInfoFields.map((field, index) => (
                <tr key={index}>
                  <td style={{ width: '50%' }}>{field}</td>
                  <td>
                    <EditableField
                      fieldPath={[field]}
                      value={data[field] || ''}
                      onDataChange={(path, val) => handleDataChange(path, val)} editingField={editingField} setEditingField={setEditingField}
                      isMissing={extractionAttempted && (!data[field] || data[field] === '')}
                      allData={allData}
                      isEditable={true}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      <div id="prior-sale-history-grid" style={{ marginBottom: '1rem', marginTop: '1rem' }} className="card shadow mb-4">
        <div className="card-header CAR1 bg-dark text-white" style={{ position: 'sticky', top: 0, zIndex: 10 }}><strong>Prior Sale History of Subject and Comparables</strong></div>
        <div className="card-body p-0 table-container">
          <table className="table table-hover table-striped mb-0" style={{ fontSize: '0.8rem' }}>
            <thead className="table-light">
              <tr>
                <th className="border border-gray-400 p-1 bg-gray-200">Feature</th>
                <th className="border border-gray-400 p-1 bg-gray-200">
                  Subject
                </th>
                {comparableSales.map((sale, idx) => (
                  <th key={idx} className="border border-gray-400 p-1 bg-gray-200">{sale}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {salesHistoryFields.map((feature, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-400 p-1 font-medium">{feature}</td>
                  <td className="border border-gray-400 p-1">
                    <EditableField
                      fieldPath={['Subject', feature]}
                      value={data.Subject?.[feature] || ''}
                      onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField}
                      isMissing={extractionAttempted && (!data.Subject?.[feature] || data.Subject?.[feature] === '')}
                      allData={allData}
                      isEditable={true}
                    />
                  </td>
                  {comparableSales.map((sale, cidx) => (
                    <td key={cidx} className="border border-gray-400 p-1">
                      <EditableField
                        fieldPath={[sale, feature]}
                        value={data[sale]?.[feature] || ''}
                        onDataChange={handleDataChange} editingField={editingField} setEditingField={setEditingField}
                        isMissing={extractionAttempted && (!data[sale]?.[feature] || data[sale]?.[feature] === '')}
                        allData={allData}
                        isEditable={true}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default SalesComparisonSection;