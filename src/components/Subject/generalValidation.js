export const checkPhysicalDeficiencies = (field, text) => {
    const fieldName = "Are there any physical deficiencies or adverse conditions that affect the livability, soundness, or structural integrity of the property? If Yes, describe";
    if (field !== fieldName) return null;

    const value = String(text || '').trim().toLowerCase();
    if (value === 'yes') {
        return { isMatch: true };
    }
    if (value !== '') {
        return { isError: true, message: `Value must be 'Yes' for this field.` };
    }
    return null;
};

export const checkSubjectFieldsNotBlank = (field, text) => {
    const fieldsToCheck = [
        'Property Address',
        'County',
        'Borrower',
        'Owner of Public Record',
        'Legal Description',
        "Assessor's Parcel #",
        'Neighborhood Name',
        'Map Reference',
        'Census Tract',
        'Occupant',
        'Property Rights Appraised',
        'Lender/Client',
        'Address (Lender/Client)'
    ];
    return checkNotBlank(field, text, fieldsToCheck.find(f => f === field));
};

export const checkAssignmentTypeConsistency = (field, text, data) => {
    if (field !== 'Assignment Type') return null;
    const assignmentType = String(text || '').trim().toLowerCase();

    if (assignmentType === 'purchase transaction') {
        const contractData = data.CONTRACT;
        const isContractSectionEmpty = !contractData || Object.values(contractData).every(value => value === '' || value === null || value === undefined);
        if (isContractSectionEmpty) {
            return { isError: true, message: `Assignment Type is 'Purchase Transaction' then the Contract Section should not be empty.` };
        }
    } else if (assignmentType === 'refinance transaction') {
        const contractData = data.CONTRACT;
        const isContractSectionEmpty = !contractData || Object.values(contractData).every(value => value === '' || value === null || value === undefined);
        if (!isContractSectionEmpty) {
            return { isError: true, message: `Assignment Type is 'Refinance Transaction' then the Contract Section should be empty.` };
        }
    }
    return { isMatch: true };
};

export const checkNotBlank = (field, text, fieldName) => {
    if (field === fieldName) {
        if (!text || String(text).trim() === '') {
            return { isError: true, message: `'${fieldName}' should not be blank.` };
        }
        return { isMatch: true };
    }
    return null;
};