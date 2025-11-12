export const checkContractFieldsMandatory = (field, text, data, fieldPath) => {
    if (fieldPath[0] !== 'CONTRACT') return null;

    const assignmentType = String(data['Assignment Type'] || '').trim().toLowerCase();

    if (assignmentType === 'purchase transaction') {
        if (!text || String(text).trim() === '') {
            return { isError: true, message: `This field is mandatory when Assignment Type is 'Purchase Transaction'.` };
        }
    }
    return { isMatch: true };
};

export const checkContractAnalysisConsistency = (field, data) => {
    if (!data.CONTRACT) return null;

    const analysisField = "I did did not analyze the contract for sale for the subject purchase transaction. Explain the results of the analysis of the contract for sale or why the analysis was not performed.";
    const analysisValue = String(data.CONTRACT[analysisField] || '').trim().toLowerCase();

    const fieldsToCheck = [
        { name: "Contract Price $", required: analysisValue.includes('did') },
        { name: "Date of Contract", required: analysisValue.includes('did') },
        { name: "Data Source(s) (Contract)", required: analysisValue.includes('did') }

    ];

    if (!analysisValue.includes('did') && !analysisValue.includes('did not')) {
        if (field === analysisField) return { isError: true, message: "This field must include 'did' or 'did not'." };
    }

    for (const f of fieldsToCheck) {
        if (field === f.name) {
            const fieldValue = String(data.CONTRACT[f.name] || '').trim();
            if (f.required && !fieldValue) {
                return { isError: true, message: `This field is required because contract analysis was performed.` };
            } else if (!f.required && fieldValue) {
                return { isError: true, message: `This field should be blank because contract analysis was not performed.` };
            }
        }
    }
    return null;
};

export const checkFinancialAssistanceInconsistency = (field, data) => {
    const assistanceQuestionField = 'Is there any financial assistance (loan charges, sale concessions, gift or downpayment assistance, etc.) to be paid by any party on behalf of the borrower?';
    const assistanceAmountField = 'If Yes, report the total dollar amount and describe the items to be paid';

    if (field !== assistanceQuestionField && field !== assistanceAmountField) return null;
    if (!data.CONTRACT) return null;

    const assistanceAnswer = String(data.CONTRACT[assistanceQuestionField] || '').trim().toLowerCase();
    const amountText = String(data.CONTRACT[assistanceAmountField] || '').trim();
    const numericPart = (amountText.match(/(-?\d+(\.\d+)?)/) || [])[0];
    const amountValue = numericPart !== undefined ? parseFloat(numericPart) : NaN;

    if (assistanceAnswer === 'yes' && (amountText === '' || isNaN(amountValue) || amountValue <= 0)) {
        return { isError: true, message: `Financial assistance is 'Yes', but the amount is missing or not greater than 0.` };
    } else if (assistanceAnswer === 'no' && amountText && (isNaN(amountValue) || amountValue !== 0)) {
        return { isError: true, message: `Financial assistance is 'No', but the amount is not '0' or blank.` };
    }
    return { isMatch: true };
};

export const checkYesNoOnly = (field, text, data, fieldConfig) => {
    if (field !== fieldConfig.name) return null;

    const value = String(text || '').trim().toLowerCase();

    if (!value) {
        return { isError: true, message: `'${field}' must be 'Yes' or 'No'.` };
    }

    if (value !== 'yes' && value !== 'no') {
        return { isError: true, message: `Invalid value for '${field}'. It must be 'Yes' or 'No'.` };
    }

    return { isMatch: true };
};