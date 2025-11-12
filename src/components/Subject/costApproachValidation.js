export const checkCostNew = (field, text) => {
    if (field !== 'ESTIMATED/REPRODUCTION / REPLACEMENT COST NEW') return null;

    const value = String(text || '').trim().toLowerCase();
    if (!value) {
        return { isError: true, message: "'ESTIMATED/REPRODUCTION / REPLACEMENT COST NEW' cannot be blank. One option must be selected." };
    }

    const hasReproduction = value.includes('reproduction');
    const hasReplacement = value.includes('replacement');

    if (hasReproduction && hasReplacement) {
        return { isError: true, message: "Only one of 'Reproduction' or 'Replacement' can be selected." };
    }

    if (!hasReproduction && !hasReplacement) {
        return { isError: true, message: "Either 'Reproduction' or 'Replacement' must be selected." };
    }

    return { isMatch: true };
};

export const checkSourceOfCostData = (field, text) => {
    if (field !== 'Source of cost data') return null;
    if (!text || String(text).trim() === '') {
        return { isError: true, message: "'Source of cost data' cannot be blank." };
    }
    return { isMatch: true };
};

export const checkIndicatedValueByCostApproach = (field, text, data) => {
    if (field !== 'Indicated Value By Cost Approach......................................................=$') return null;
    const value = String(text || '').trim();
    const comments = String(data?.['Comments on Cost Approach (gross living area calculations, depreciation, etc.) '] || '').toLowerCase();

    if (!value && !comments.includes('why cost approach cannot be developed')) {
        return { isError: true, message: "If 'Indicated Value by Cost Approach' is blank, a comment explaining why it was not developed is required." };
    }
    return { isMatch: true };
};

export const checkCostApproachFieldsNotBlank = (field, text) => {
    const fieldsToCheck = [
        "Estimated", "Source of cost data", "Quality rating from cost service ",
        "Effective date of cost data ", "Comments on Cost Approach (gross living area calculations, depreciation, etc.) ",
        "OPINION OF SITE VALUE = $ ................................................", "Dwelling", "Garage/Carport ",
        " Total Estimate of Cost-New  = $ ...................", "Depreciation ",
        "Depreciated Cost of Improvements......................................................=$ ",
        "“As-is” Value of Site Improvements......................................................=$",
        "Indicated Value By Cost Approach......................................................=$"
    ];
    if (fieldsToCheck.includes(field) && (!text || String(text).trim() === '')) {
        return { isError: true, message: `'${field}' should not be blank.` };
    }
    return null;
};
