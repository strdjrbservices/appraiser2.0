import { checkNotBlank } from './generalValidation';

export const checkLenderAddressInconsistency = (field, data) => {
    const relevantFields = ['Address (Lender/Client)', 'Lender/Client Company Address'];
    if (!relevantFields.includes(field) || !data) return null;

    const subjectLenderAddress = String(data['Address (Lender/Client)'] || '').trim();
    const appraiserLenderAddress = String(data['Lender/Client Company Address'] || '').trim();

    if (subjectLenderAddress && appraiserLenderAddress && subjectLenderAddress !== appraiserLenderAddress) {
        return { isError: true, message: `Lender Address mismatch: Subject section has '${subjectLenderAddress}', but Appraiser section has '${appraiserLenderAddress}'.` };
    }
    return { isMatch: true };
};

export const checkAppraiserFieldsNotBlank = (field, text) => {
    const fieldsToCheck = [
        "Signature",
        "Name",
        "Company Name",
        "Company Address",
        "Telephone Number",
        "Email Address",
        "Date of Signature and Report",
        "Effective Date of Appraisal",
        "State Certification #",
        "or State License #",
        "or Other (describe)",
        "State #",
        "State",
        "Expiration Date of Certification or License",
        "ADDRESS OF PROPERTY APPRAISED",
        "APPRAISED VALUE OF SUBJECT PROPERTY $",
        "LENDER/CLIENT Name",
        "Lender/Client Company Name",
        "Lender/Client Company Address",
        "Lender/Client Email Address"
    ];
    return checkNotBlank(field, text, fieldsToCheck.find(f => f === field));
};

export const checkLenderNameInconsistency = (field, text, data) => {
    if (field !== 'Lender/Client' || !data) return null;
    const subjectLenderName = String(text || '').trim();
    const appraiserLenderName = String(data['Lender/Client Company Name'] || '').trim();
    if (subjectLenderName && appraiserLenderName && subjectLenderName !== appraiserLenderName) {
        return { isError: true, message: `"Lender/Client mismatch: Subject section has '${subjectLenderName}', but Appraiser section has '${appraiserLenderName}'."` };
    }
    return { isMatch: true };
};