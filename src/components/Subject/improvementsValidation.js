export const checkUnits = (field, text) => {
    if (field !== 'Units') return null;
    const value = String(text || '').trim();
    if (!value) {
        return { isError: true, message: "'Units' cannot be blank. If 1 unit, it should be marked '1'." };
    }
    if (value !== '1' && !value.toLowerCase().includes('one')) {
        return { isError: true, message: "For a single unit property, 'Units' must be '1'." };
    }
    return { isMatch: true };
};

export const checkBasementDetails = (field, text, data) => {
    const basementFields = ['Basement Area sq.ft.', 'Basement Finish %'];
    if (!basementFields.includes(field)) return null;

    const hasFullBasement = String(data['Full Basement'] || '').toLowerCase() === 'yes';
    const hasPartialBasement = String(data['Partial Basement'] || '').toLowerCase() === 'yes';

    if (hasFullBasement && hasPartialBasement) {
        return { isError: true, message: "Only one of 'Full Basement' or 'Partial Basement' can be selected." };
    }

    if (hasFullBasement || hasPartialBasement) {
        if (field === 'Basement Area sq.ft.') {
            const area = parseFloat(String(text || '0').replace(/[^0-9.]/g, ''));
            if (isNaN(area) || area <= 0) {
                return { isError: true, message: "'Basement Area' must be a non-zero value if a basement type is checked." };
            }
        }
        if (field === 'Basement Finish %') {
            if (!String(text || '').trim()) {
                return { isError: true, message: "'Basement Finish %' cannot be blank if a basement type is checked." };
            }
        }
    }
    return { isMatch: true };
};

export const checkEvidenceOf = (field, text) => {
    const evidenceFields = ['Infestation', 'Dampness', 'Settlement'];
    if (!evidenceFields.some(f => field.includes(f))) return null;

    const value = String(text || '').trim().toLowerCase();
    if (value.includes('yes') || value.includes('checked')) {
        return { isError: true, message: `Evidence of '${field}' is checked. Please verify with photos and comments.` };
    }
    return { isMatch: true };
};

export const checkMaterialCondition = (field, text) => {
    const fieldsToCheck = [
        'Foundation Walls (Material/Condition)', 'Exterior Walls (Material/Condition)',
        'Roof Surface (Material/Condition)', 'Gutters & Downspouts (Material/Condition)',
        'Window Type (Material/Condition)', 'Floors (Material/Condition)',
        'Walls (Material/Condition)', 'Trim/Finish (Material/Condition)',
        'Bath Floor (Material/Condition)', 'Bath Wainscot (Material/Condition)'
    ];

    if (!fieldsToCheck.includes(field)) return null;

    const value = String(text || '').trim();
    if (!value) {
        return { isError: true, message: `'${field}' cannot be blank.` };
    }

    if (!value.includes('/') || value.split('/').length < 2 || value.split('/').some(part => !part.trim())) {
        return { isError: true, message: `Both Material and Condition are required for '${field}', separated by '/'.` };
    }
    return { isMatch: true };
};

export const checkHeatingFuel = (field, text) => {
    if (field !== 'Fuel') return null;
    const value = String(text || '').trim().toLowerCase();
    if (value && !['gas', 'oil'].includes(value)) {
        return { isError: true, message: `Fuel is '${text}'. Expected 'Gas' or 'Oil'. Please verify.` };
    }
    return { isMatch: true };
};

export const checkCarStorage = (field, text, data) => {
    if (field !== 'Car Storage' || !data) return null;
    const carStorageValue = String(text || '').trim().toLowerCase();

    if (!carStorageValue) return null; // No validation if car storage is not specified

    const drivewayCars = parseInt(String(data['Driveway # of Cars'] || '0').trim(), 10);
    const garageCars = parseInt(String(data['Garage # of Cars'] || '0').trim(), 10);
    const carportCars = parseInt(String(data['Carport # of Cars'] || '0').trim(), 10);
    const garageType = String(data['Garage Att./Det./Built-in'] || '').trim();

    if (carStorageValue.includes('driveway') && drivewayCars <= 0) {
        return { isError: true, message: "If Car Storage is 'Driveway', then 'Driveway # of Cars' must be greater than 0." };
    }

    if (carStorageValue.includes('garage')) {
        if (garageCars <= 0) return { isError: true, message: "If Car Storage is 'Garage', then 'Garage # of Cars' must be greater than 0." };
        if (!garageType) return { isError: true, message: "If Car Storage is 'Garage', one of 'Attached', 'Detached', or 'Built-in' must be specified." };
    }

    if (carStorageValue.includes('carport')) {
        if (carportCars <= 0) return { isError: true, message: "If Car Storage is 'Carport', then 'Carport # of Cars' must be greater than 0." };
        if (!garageType) return { isError: true, message: "If Car Storage is 'Carport', one of 'Attached', 'Detached', or 'Built-in' must be specified." };
    }

    return { isMatch: true };
};

export const checkAccessoryUnit = (field, data) => {
    if (field !== 'Units') return null;
    const unitValue = String(data['Units'] || '').trim().toLowerCase();
    if (unitValue.includes('one with accessory unit')) {
        const additionalFeatures = String(data['Additional features'] || '').toLowerCase();
        if (!additionalFeatures.includes('adu') && !additionalFeatures.includes('accessory dwelling unit')) {
            return { isError: true, message: "If 'One with Accessory Unit' is indicated, details about the ADU should be in 'Additional features', grid, photos, and sketches." };
        }
    }
    return { isMatch: true };
};

export const checkNumberOfStories = (field, text) => {
    if (field !== '# of Stories') return null;
    const value = String(text || '').trim();
    if (!value || value === '0') {
        return { isError: true, message: "'# of Stories' cannot be blank or 0." };
    }
    return { isMatch: true };
};

export const checkPropertyType = (field, text) => {
    if (field !== 'Type') return null;
    if (!String(text || '').trim()) {
        return { isError: true, message: "A 'Type' (e.g., Detached, Attached) must be selected." };
    }
    return { isMatch: true };
};

export const checkConstructionStatusAndReconciliation = (field, data) => {
    if (field !== 'Existing/Proposed/Under Const.') return null;
    const status = String(data['Existing/Proposed/Under Const.'] || '').trim().toLowerCase();
    const reconciliationField = "This appraisal is made \"as is\", subject to completion per plans and specifications on the basis of a hypothetical condition that the improvements have been completed, subject to the following repairs or alterations on the basis of a hypothetical condition that the repairs or alterations have been completed, or subject to the following required inspection based on the extraordinary assumption that the condition or deficiency does not require alteration or repair:";
    const reconciliationValue = String(data[reconciliationField] || '').toLowerCase();

    if (!status) {
        return { isError: true, message: "Construction status (Existing, Proposed, etc.) must be selected." };
    }

    if (status === 'existing' && !reconciliationValue.includes('as is')) {
        return { isError: true, message: "If construction status is 'Existing', reconciliation should be 'as is'." };
    }

    if ((status === 'proposed' || status === 'under const.') && !reconciliationValue.includes('subject to')) {
        return { isError: true, message: "If status is 'Proposed' or 'Under Const.', reconciliation should be 'subject to'." };
    }
    return { isMatch: true };
};

export const checkDesignStyle = (field, text) => {
    if (field !== 'Design (Style)') return null;
    if (!String(text || '').trim()) {
        return { isError: true, message: "'Design (Style)' cannot be blank." };
    }
    return { isMatch: true };
};

export const checkYearBuilt = (field, text) => {
    if (field !== 'Year Built') return null;
    if (!String(text || '').trim()) {
        return { isError: true, message: "'Year Built' cannot be blank." };
    }
    return { isMatch: true };
};

export const checkEffectiveAge = (field, text) => {
    if (field !== 'Effective Age (Yrs)') return null;
    if (!String(text || '').trim()) {
        return { isError: true, message: "'Effective Age (Yrs)' cannot be blank." };
    }
    return { isMatch: true };
};

export const checkAdditionalFeatures = (field, text) => {
    if (field !== 'Additional features') return null;
    if (!String(text || '').trim()) {
        return { isError: true, message: "'Additional features' should not be blank. If none, state 'None'." };
    }
    return { isMatch: true };
};

export const checkPropertyConditionDescription = (field, text) => {
    if (field !== 'Describe the condition of the property') return null;
    const value = String(text || '').trim().toUpperCase();
    if (!value) {
        return { isError: true, message: "'Describe the condition of the property' cannot be blank." };
    }
    if (value.includes('C5') || value.includes('C6')) {
        return { isError: true, message: `CRITICAL: Property condition is '${value}'. Please review.` };
    }
    const validConditions = ['C1', 'C2', 'C3', 'C4'];
    if (!validConditions.some(c => value.startsWith(c))) {
        return { isError: true, message: "Property condition must be between C1-C4." };
    }
    return { isMatch: true };
};

export const checkPhysicalDeficienciesImprovements = (field, text) => {
    const fieldName = "Are there any physical deficiencies or adverse conditions that affect the livability, soundness, or structural integrity of the property? If Yes, describe";
    if (field !== fieldName) return null;

    const value = String(text || '').trim().toLowerCase();
    if (!value) {
        return { isError: true, message: `'${fieldName}' cannot be blank.` };
    }
    if (value.startsWith('yes') && value.length < 10) { // Simple check for a description
        return { isError: true, message: "If 'Yes', a description is required." };
    }
    return { isMatch: true };
};

export const checkNeighborhoodConformity = (field, text) => {
    const fieldName = "Does the property generally conform to the neighborhood (functional utility, style, condition, use, construction, etc.)? If No, describe";
    if (field !== fieldName) return null;
    const value = String(text || '').trim().toLowerCase();
    if (!value) {
        return { isError: true, message: `'${fieldName}' cannot be blank.` };
    }
    if (value.startsWith('no') && value.length < 5) {
        return { isError: true, message: "If 'No', a description is required." };
    }
    return { isMatch: true };
};

export const checkFoundationType = (field, text) => {
    if (field !== 'Foundation Type') return null;
    if (!String(text || '').trim()) {
        return { isError: true, message: "'Foundation Type' cannot be blank." };
    }
    return { isMatch: true };
};

export const checkImprovementsFieldsNotBlank = (field, text) => {
    const fieldsToCheck = [
        'Attic',
        'Heating Type',
        'Fuel',
        'Cooling Type',
        'Fireplace(s) #',
        'Patio/Deck',
        'Pool',
        'Woodstove(s) #',
        'Fence',
        'Porch',
        'Other Amenities',
        'Car Storage',
        'Driveway # of Cars',
        'Driveway Surface',
        'Garage # of Cars',
        'Carport # of Cars',
        'Appliances',
        'Finished area above grade Rooms',
        'Finished area above grade Bedrooms',
        'Finished area above grade Bath(s)',
        'Square Feet of Gross Living Area Above Grade'
    ];

    if (fieldsToCheck.includes(field) && !String(text || '').trim()) {
        return { isError: true, message: `'${field}' should not be blank.` };
    }
    return null;
};
