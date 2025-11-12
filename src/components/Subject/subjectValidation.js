export const checkTaxYear = (field, text) => {
    if (field !== 'Tax Year') return null;
    const taxYearValue = String(text || '').trim();
    if (!taxYearValue) {
        return { isError: true, message: 'Tax Year should not be blank.' };
    }
    const taxYear = parseInt(taxYearValue, 10);
    if (isNaN(taxYear)) {
        return { isError: true, message: 'Tax Year must be a valid year.' };
    }
    const currentYear = new Date().getFullYear();
    if (taxYear > currentYear || taxYear < currentYear - 1) {
        return { isError: true, message: `Tax Year must be the current year (${currentYear}) or the previous year (${currentYear - 1}).` };
    }
    return { isMatch: true };
};

export const checkRETaxes = (field, text) => {
    if (field !== 'R.E. Taxes $') return null;
    const taxesValue = String(text || '').trim();
    if (!taxesValue) {
        return { isError: true, message: 'R.E. Taxes $ should not be blank.' };
    }
    const integerPart = taxesValue.split('.')[0].replace(/[^0-9]/g, '');
    if (integerPart.length > 4) {
        return { isError: true, message: 'R.E. Taxes $ integer part should not exceed 4 digits.' };
    }
    return { isMatch: true };
};

export const checkSpecialAssessments = (field, text) => {
    if (field !== 'Special Assessments $') return null;
    const value = parseFloat(String(text || '0').replace(/[^0-9.-]+/g, ""));
    if (isNaN(value) || value < 0) {
        return { isError: true, message: 'Special Assessments $ must be at least 0.' };
    }
    return { isMatch: true };
};

export const checkPUD = (field, text) => {
    if (field !== 'PUD') return null;
    const value = String(text || '').trim().toLowerCase();
    if (value !== 'yes' && value !== 'no') {
        return { isError: true, message: "PUD must be 'Yes' or 'No'." };
    }
    return { isMatch: true };
};

export const checkHOA = (field, text, data) => {
    if (field !== 'HOA $') return null;
    const pudValue = String(data['PUD'] || '').trim().toLowerCase();
    if (pudValue === 'yes') {
        const hoaValue = parseFloat(String(text || '').replace(/[^0-9.-]+/g, ""));
        if (isNaN(hoaValue) || hoaValue <= 0) {
            return { isError: true, message: 'HOA $ must be greater than 0 if PUD is Yes.' };
        }
        if (!data['HOA(per year)'] && !data['HOA(per month)']) {
            return { isError: true, message: "If PUD is 'Yes', at least one of 'HOA (per year)' or 'HOA (per month)' must be specified." };
        }
    }
    return { isMatch: true };
};

export const checkOfferedForSale = (field, text, data) => {
    if (field === 'Offered for Sale in Last 12 Months') {
        const value = String(text || '').trim().toLowerCase();
        if (value !== 'yes' && value !== 'no') {
            return { isError: true, message: "This field must be 'Yes' or 'No'." };
        }
        if (value === 'yes') {
            const detailsField = data['Report data source(s) used, offering price(s), and date(s)'];
            if (!detailsField) {
                return { isError: true, message: "If 'Yes', details must be provided in the data source field below." };
            }

            const detailsValue = String(detailsField).toLowerCase();
            const missingKeywords = [];

            if (!detailsValue.includes('dom')) missingKeywords.push('DOM');
            if (!detailsValue.includes('listed')) missingKeywords.push('listed');
            if (!detailsValue.includes('mls') && !detailsValue.includes('multiple listing service')) {
                missingKeywords.push("'MLS' or 'Multiple Listing Service'");
            }

            if (missingKeywords.length > 0) {
                return { isError: true, message: `If 'Yes', the details must include: ${missingKeywords.join(', ')}.` };
            }
        }
    }
    return null;
};

export const checkPropertyRightsInconsistency = (field, text, data) => {
    if (field !== 'Property Rights Appraised' || !data.Subject) return null;
    const subjectPropertyRights = String(text || '').trim();
    const salesGridPropertyRights = String(data.Subject['Leasehold/Fee Simple'] || '').trim();
    if (subjectPropertyRights && salesGridPropertyRights && subjectPropertyRights !== salesGridPropertyRights) {
        return { isError: true, message: `Property Rights mismatch: Subject section has '${subjectPropertyRights}', but Sales Comparison has '${salesGridPropertyRights}'.` };
    }
    return { isMatch: true };
};

export const checkAnsi = (field, text, data) => {
    if (field !== 'ANSI') return null;

    const isFha = data && data['FHA Case No.'] && String(data['FHA Case No.']).trim() !== '';
    const ansiComment = String(text || '').trim();

    // Check for forbidden code GX001
    if (ansiComment.toUpperCase().includes('GX001')) {
        return { isError: true, message: "ANSI comment must not include code 'GX001'." };
    }

    // For conventional loans, the comment is mandatory
    if (!isFha && !ansiComment) {
        return { isError: true, message: "ANSI comment is mandatory for conventional loans." };
    }

    return { isMatch: true };
};
