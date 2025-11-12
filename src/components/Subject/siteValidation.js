export const checkZoning = (field, text, data) => {
    if (field !== 'Zoning Compliance') return null;
    const value = String(text || '').trim();
    const validValues = ['Legal', 'Legal Nonconforming (Grandfathered Use)', 'No Zoning'];

    if (value.startsWith('Illegal')) {
        return { isError: true, message: "STOP REVIEW AND ESCALATE TO MANAGER/ CLIENT" };
    }

    if (value === 'Legal') {
        return { isMatch: true, message: "Zoning is Legal." };
    } else if (value === 'Legal Nonconforming (Grandfathered Use)' || value === 'No Zoning') {
        const supplementalAddendum = String(data['SUPPLEMENTAL ADDENDUM'] || '').trim();
        if (!supplementalAddendum) {
            return { isError: true, message: `Comments are required in 'Supplemental Addendum' when compliance is '${value}'.` };
        }
    } else if (value && !validValues.some(v => value.startsWith(v))) {
        return { isError: true, message: `Invalid Zoning Compliance value: '${value}'.` };
    }
    return null;
};

export const checkZoningDescription = (field, text) => {
    if (field !== 'Zoning Description') return null;
    const value = String(text || '').trim();
    if (!value) {
        return { isError: true, message: 'Zoning Description should not be blank.' };
    }
    if (/\b(agriculture|agr)\b/i.test(value)) {
        return { isError: true, message: "CRITICAL: Zoning Description contains 'agriculture' or 'agr'. Please review." };
    }
    return { isMatch: true };
};

export const checkSpecificZoningClassification = (field, text) => {
    if (field !== 'Specific Zoning Classification') return null;
    const value = String(text || '').trim();
    if (!value) {
        return { isError: true, message: 'Specific Zoning Classification should not be blank.' };
    }
    return { isMatch: true };
};

export const checkHighestAndBestUse = (field, text) => {
    if (field !== 'Is the highest and best use of subject property as improved (or as proposed per plans and specifications) the present use?') return null;
    const raw = String(text || '').trim();
    if (!raw) {
        return { isError: true, message: "This field must be marked 'Yes'." };
    }
    
    const value = raw.toLowerCase();
    const yesPattern = /^(y|yes)\b|present use|as improved|as proposed/;
    if (yesPattern.test(value)) return { isMatch: true };
    
    if (value.startsWith('no') || value.includes('no')) {
        return { isError: true, message: `CRITICAL: Highest & Best Use is not the present use. This should be 'Yes'.` };
    }

    return { isError: true, message: `Value for 'Highest and Best Use' should be 'Yes'.` };
};

export const checkFemaInconsistency = (field, data) => {
    const relevantFields = ['FEMA Special Flood Hazard Area', 'FEMA Flood Zone'];
    if (!relevantFields.includes(field)) return null;

    const hazardArea = String(data['FEMA Special Flood Hazard Area'] || '').trim().toLowerCase();
    const floodZone = String(data['FEMA Flood Zone'] || '').trim().toUpperCase();

    if (!hazardArea && !floodZone) return null;

    const isNoAndInvalid = hazardArea === 'no' && floodZone && floodZone !== 'X' && floodZone !== 'X500';
    const isYesAndInvalid = hazardArea === 'yes' && floodZone && !['A', 'AE'].includes(floodZone);

    if (isNoAndInvalid) {
        return { isError: true, message: `Hazard Area is 'No', so Flood Zone should be 'X' or 'X500'.` };
    } else if (isYesAndInvalid) {
        return { isError: true, message: `Hazard Area is 'Yes', so Flood Zone should be 'A' or 'AE'.` };
    }
    return { isMatch: true };
};

export const checkFemaFieldsConsistency = (field, text, data) => {
    const femaFields = ["FEMA Flood Zone", "FEMA Map #", "FEMA Map Date"];
    if (!femaFields.includes(field) || !data) return null;

    const hazardArea = String(data['FEMA Special Flood Hazard Area'] || '').trim().toLowerCase();
    const fieldValue = String(text || '').trim(); 

    if (hazardArea && !fieldValue) {
        return { isError: true, message: `'${field}' cannot be empty when 'FEMA Special Flood Hazard Area' has a value.` };
    }
    return { isMatch: true };
};

export const checkSiteSectionBlank = (field, text) => {
    const fieldsToCheck = ["Dimensions", "Shape", "View"];
    if (fieldsToCheck.includes(field)) {
        if (!String(text || '').trim()) {
            return { isError: true, message: `'${field}' should not be blank.` };
        }
        return { isMatch: true };
    }
    return null;
};

export const checkArea = (field, text) => {
    if (field !== 'Area') return null;
    const value = String(text || '').trim();
    if (!value) {
        return { isError: true, message: 'Area should not be blank.' };
    }

    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (isNaN(numericValue)) return null;

    const hasAcres = /ac|acres/i.test(value);
    const hasSqFt = /sf|sqft|sq\.ft\.|square feet/i.test(value);

    if (numericValue > 43500) { // If area is greater than 43,500 (approx. 1 acre)
        if (!hasAcres) {
            return { isError: true, message: 'Area is greater than 43,500, unit should be in Acres (AC).' };
        }
        if (hasSqFt) {
            return { isError: true, message: 'Area is greater than 43,500, unit should be in Acres (AC), not Square Feet.' };
        }
    } else { // If area is 43,500 or less
        if (!hasSqFt) {
            return { isError: true, message: 'Area is 43,500 or less, unit should be in Square Feet (SF).' };
        }
        if (hasAcres) {
            return { isError: true, message: 'Area is 43,500 or less, unit should be in Square Feet (SF), not Acres.' };
        }
    }
    return { isMatch: true };
};

export const checkYesNoWithComment = (field, text, data, fieldConfig) => {
    if (field !== fieldConfig.name) return null;

    const value = String(text || '').trim().toLowerCase();

    if (!value) {
        return { isError: true, message: `'${field}' should not be blank.` };
    }

    if (value.startsWith(fieldConfig.unwantedValue)) {
        const supplementalAddendum = String(data['SUPPLEMENTAL ADDENDUM'] || '').trim();
        if (!supplementalAddendum) {
            return { isError: true, message: `Comments are required in 'Supplemental Addendum' when '${field}' is '${fieldConfig.unwantedValue}'.` };
        }
    } else if (value !== fieldConfig.wantedValue) {
        return { isError: true, message: `'${field}' should be '${fieldConfig.wantedValue}' or '${fieldConfig.unwantedValue}'.` };
    }

    return { isMatch: true };
};

export const checkUtilities = (field, text, data) => {
    const utilityFields = ["Electricity", "Gas", "Water", "Sanitary Sewer", "Street", "Alley"];
    if (!utilityFields.includes(field)) return null;

    const value = String(text || '').trim();
    if (!value) {
        return { isError: true, message: `'${field}' in the Site section cannot be blank. If not available, it should be 'None'.` };
    }

    if (/\b(other|private)\b/i.test(value)) {
        const supplementalAddendum = String(data['SUPPLEMENTAL ADDENDUM'] || '').trim();
        if (!supplementalAddendum) {
            return { isError: true, message: `Comments are required in 'Supplemental Addendum' when '${field}' is '${value}'.` };
        }
    }
    return { isMatch: true };
};