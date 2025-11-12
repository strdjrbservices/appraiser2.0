export const checkFinalValueConsistency = (field, text, allData) => {
    if (!allData || !allData.RECONCILIATION || !allData.CERTIFICATION || !allData.SALES_TRANSFER) return null;

    const fieldsToCompare = [
        allData.RECONCILIATION?.['Indicated Value by: Sales Comparison Approach $'],
        allData.SALES_TRANSFER?.['Indicated Value by Sales Comparison Approach $'],
        allData.RECONCILIATION?.["opinion of the market value, as defined, of the real property that is the subject of this report is $"],
        allData.CERTIFICATION?.['APPRAISED VALUE OF SUBJECT PROPERTY $'],
        allData.RECONCILIATION?.['final value']
    ];

    const populatedValues = fieldsToCompare.map(val => {
        if (val === undefined || val === null || String(val).trim() === '') return null;
        const numericValue = parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
        return isNaN(numericValue) ? null : numericValue;
    }).filter(v => v !== null);

    if (populatedValues.length > 1 && new Set(populatedValues).size > 1) {
        return { isError: true, message: `Inconsistent final appraised values found across sections. Values are: ${[...new Set(populatedValues)].join(', ')}` };
    }

    if (field === "opinion of the market value, as defined, of the real property that is the subject of this report is $" && (!text || String(text).trim() === '')) {
        return { isError: true, message: "The final 'as of' value cannot be blank." };
    }

    return { isMatch: true };
};

export const checkCostApproachDeveloped = (field, text, allData) => {
    if (field !== 'Cost Approach (if developed)') return null;
    const costApproachValue = allData.COST_APPROACH?.['Indicated Value By Cost Approach......................................................=$'];
    if (costApproachValue && (!text || String(text).trim() === '')) {
        return { isError: true, message: "Cost Approach is developed, so this field cannot be blank." };
    }
    return { isMatch: true };
};

export const checkAppraisalCondition = (field, text) => {
    if (field !== 'This appraisal is made "as is", subject to completion per plans and specifications on the basis of a hypothetical condition that the improvements have been completed, subject to the following repairs or alterations on the basis of a hypothetical condition that the repairs or alterations have been completed, or subject to the following required inspection based on the extraordinary assumption that the condition or deficiency does not require alteration or repair:') return null;
    
    const value = String(text || '').trim().toLowerCase();
    const hasAsIs = value.includes('as is');
    const hasSubjectTo = value.includes('subject to');

    if (!hasAsIs && !hasSubjectTo) {
        return { isError: true, message: "Either 'as is' or 'subject to' must be selected." };
    }
    if (hasAsIs && hasSubjectTo) {
        return { isError: true, message: "Only one of 'as is' or 'subject to' can be selected." };
    }
    return { isMatch: true };
};

export const checkAsOfDate = (field, text, allData) => {
    if (field !== 'as of') return null;
    if (!text || String(text).trim() === '') {
        return { isError: true, message: "'as of' date cannot be blank." };
    }
    const effectiveDate = allData.CERTIFICATION?.['Effective Date of Appraisal'];
    if (effectiveDate && String(text).trim() !== String(effectiveDate).trim()) {
        return { isError: true, message: `Date mismatch: 'as of' date (${text}) does not match 'Effective Date of Appraisal' (${effectiveDate}) in the signature section.` };
    }
    return { isMatch: true };
};
export const checkFinalValueBracketing = (field, text, allData) => {
    // This validation applies specifically to the 'final value' field in the RECONCILIATION section.
    if (field !== 'final value' || !text || String(text).trim() === '') {
        return null; // Only validate 'final value' if it's present
    }

    // Parse the final value, removing non-numeric characters except the decimal point
    const finalValue = parseFloat(String(text).replace(/[^0-9.]/g, ''));
    if (isNaN(finalValue)) {
        return null; // Cannot validate if final value is not a valid number
    }

    let minComparableValue = Infinity;
    let maxComparableValue = -Infinity;
    let comparableValuesFound = false;

    // Filter for keys that represent comparable sales (e.g., "COMPARABLE SALE #1")
    const comparableSalesKeys = Object.keys(allData).filter(k => k.startsWith('COMPARABLE SALE #'));

    if (comparableSalesKeys.length === 0) {
        return null; // No comparable sales found to bracket against
    }

    for (const saleKey of comparableSalesKeys) {
        const salePriceText = String(allData[saleKey]?.['Sale Price'] || '').trim();
        const adjustedSalePriceText = String(allData[saleKey]?.['Adjusted Sale Price of Comparable'] || '').trim();

        const salePrice = parseFloat(salePriceText.replace(/[^0-9.]/g, ''));
        const adjustedSalePrice = parseFloat(adjustedSalePriceText.replace(/[^0-9.]/g, ''));

        if (!isNaN(salePrice)) {
            minComparableValue = Math.min(minComparableValue, salePrice);
            maxComparableValue = Math.max(maxComparableValue, salePrice);
            comparableValuesFound = true;
        }
        if (!isNaN(adjustedSalePrice)) {
            minComparableValue = Math.min(minComparableValue, adjustedSalePrice);
            maxComparableValue = Math.max(maxComparableValue, adjustedSalePrice);
            comparableValuesFound = true;
        }
    }

    if (!comparableValuesFound) {
        return null; // Still no valid comparable sales prices found after parsing
    }

    if (finalValue < minComparableValue || finalValue > maxComparableValue) {
        return {
            isError: true,
            message: `Final value ($${finalValue.toLocaleString()}) is not bracketed by comparable sales prices. Range: $${minComparableValue.toLocaleString()} - $${maxComparableValue.toLocaleString()}.`
        };
    }

    return { isMatch: true, message: "Final value is bracketed by comparable sales prices." };
};
