export const checkPudInformationFieldsNotBlank = (field, text) => {
    const fieldsToCheck = [
        "PUD Fees $", "PUD Fees (per month)", "PUD Fees (per year)",
        "Is the developer/builder in control of the Homeowners' Association (HOA)?", "Unit type(s)",
        "Provide the following information for PUDs ONLY if the developer/builder is in control of the HOA and the subject property is an attached dwelling unit.",
        "Legal Name of Project", "Total number of phases", "Total number of units",
        "Total number of units sold", "Total number of units rented", "Total number of units for sale",
        "Data source(s)", "Was the project created by the conversion of existing building(s) into a PUD?",
        " If Yes, date of conversion", "Does the project contain any multi-dwelling units? Yes No Data",
        "Are the units, common elements, and recreation facilities complete?", "If No, describe the status of completion.",
        "Are the common elements leased to or by the Homeowners' Association?",
        "If Yes, describe the rental terms and options.", "Describe common elements and recreational facilities."
    ];

    if (fieldsToCheck.includes(field) && (!text || String(text).trim() === '')) {
        return { isError: true, message: `'${field}' should not be blank.` };
    }
    return null;
};