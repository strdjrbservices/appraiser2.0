export const checkMarketConditionsFieldsNotBlank = (field, text) => {
    const fieldsToCheck = [
        "Instructions:", "Seller-(developer, builder, etc.)paid financial assistance prevalent?",
        "Explain in detail the seller concessions trends for the past 12 months (e.g., seller contributions increased from 3% to 5%, increasing use of buydowns, closing costs, condo fees, options, etc.).",
        "Are foreclosure sales (REO sales) a factor in the market?", "If yes, explain (including the trends in listings and sales of foreclosed properties).",
        "Cite data sources for above information.", "Summarize the above information as support for your conclusions in the Neighborhood section of the appraisal report form. If you used any additional information, such as an analysis of pending sales and/or expired and withdrawn listings, to formulate your conclusions, provide both an explanation and support for your conclusions."
    ];

    if (fieldsToCheck.includes(field) && (!text || String(text).trim() === '')) {
        return { isError: true, message: `'${field}' should not be blank.` };
    }
    return null;
};