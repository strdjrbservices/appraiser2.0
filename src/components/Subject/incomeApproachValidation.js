export const checkIncomeApproachFieldsNotBlank = (field, text) => {
    const fieldsToCheck = [
        "Estimated Monthly Market Rent $", "X Gross Rent Multiplier  = $",
        "Indicated Value by Income Approach", "Summary of Income Approach (including support for market rent and GRM) "
    ];
    if (fieldsToCheck.includes(field) && (!text || String(text).trim() === '')) {
        return { isError: true, message: `'${field}' should not be blank.` };
    }
    return null;
};