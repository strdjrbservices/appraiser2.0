export const checkHousingPriceAndAge = (field, allData) => {
    const priceField = "one unit housing price(high,low,pred)";
    const ageField = "one unit housing age(high,low,pred)";

    if (field !== priceField && field !== ageField) return null;

    const housingData = allData?.NEIGHBORHOOD?.[field];
    if (typeof housingData !== 'object' || housingData === null) return null;

    const high = parseFloat(String(housingData.high || '0').replace(/[^0-9.-]+/g, ""));
    const low = parseFloat(String(housingData.low || '0').replace(/[^0-9.-]+/g, ""));
    const pred = parseFloat(String(housingData.pred || '0').replace(/[^0-9.-]+/g, ""));

    if (isNaN(high) || isNaN(low) || isNaN(pred)) return null;

    if (!(high >= pred && pred >= low)) {
        const fieldName = field.includes('price') ? 'Price' : 'Age';
        return { isError: true, message: `${fieldName} values are inconsistent. Expected High >= Predominant >= Low. (High: ${housingData.high}, Pred: ${housingData.pred}, Low: ${housingData.low})` };
    }
    return { isMatch: true };
};

export const checkNeighborhoodBoundaries = (field, text) => {
    if (field !== 'Neighborhood Boundaries') return null;
    const value = String(text || '').toLowerCase();
    if (!value) return { isError: true, message: 'Neighborhood Boundaries cannot be blank. It must include North, South, East, and West.' };

    const requiredWords = ['north', 'south', 'east', 'west'];
    const missingWords = requiredWords.filter(word => !value.includes(word));

    if (missingWords.length > 0) {
        return { isError: true, message: `Neighborhood Boundaries is missing required directions: ${missingWords.join(', ').toUpperCase()}.` };
    }
    return { isMatch: true };
};

export const checkNeighborhoodUsageConsistency = (field, data) => {
    const usageFields = ["One-Unit", "2-4 Unit", "Multi-Family", "Commercial", "Other"];
    if (!usageFields.includes(field) || !data.NEIGHBORHOOD) return null;

    const values = usageFields.map(f => parseFloat(String(data.NEIGHBORHOOD[f] || '0').replace('%', '').trim()) || 0);
    const total = values.reduce((sum, v) => sum + v, 0);
    const anyFieldHasValue = usageFields.some(f => data.NEIGHBORHOOD[f] !== undefined && data.NEIGHBORHOOD[f] !== null && data.NEIGHBORHOOD[f] !== '');

    if (anyFieldHasValue && total !== 100) {
        return { isError: true, message: `Neighborhood usage total is ${total}%, not 100%.` };
    }
    return { isMatch: true };
};

export const checkSpecificZoningClassification = (field, text) => {
    if (field !== 'Specific Zoning Classification') return null;
    const value = String(text || '').trim();
    const validValues = ['R1', 'R2', 'Residence'];
    const regex = new RegExp(`\\b(${validValues.join('|')})\\b`, 'i');

    if (value && regex.test(value)) {
        return { isMatch: true };
    } else if (value) {
        return { isError: true, message: `Invalid Specific Zoning Classification: '${value}'. Expected to contain R1, R2, or Residence.` };
    }
};

export const checkSingleChoiceFields = (field, text) => {
    const singleChoiceFields = {
        
        "Built-Up": ['Over 75%', '25-75%', 'Under 25%'],
        "Growth": ['Rapid', 'Stable', 'Slow'],
        "Property Values": ['Increasing', 'Stable', 'Declining'],
        "Demand/Supply": ['Shortage', 'In Balance', 'Oversupply'],
        "Marketing Time": ['Under 3 mths', '3-6 mths', 'Over 6 mths']
    };

    if (!singleChoiceFields[field]) return null;

    const value = String(text || '').trim();
    if (!value) return null;

    const validOptions = singleChoiceFields[field];
    const valueLower = value.toLowerCase();

    const isMatch = validOptions.some(option => valueLower === option.toLowerCase());

    if (isMatch) {
        return { isMatch: true };
    }
    return { isError: true, message: `Invalid value for '${field}'. Only one option should be selected. Expected one of: ${validOptions.join(', ')}.` };
};

export const checkNeighborhoodFieldsNotBlank = (field, text) => {
    const fieldsToCheck = [
        'Location',
        'Built-Up',
        'Growth',
        'Property Values',
        'Demand/Supply',
        'Marketing Time',
        'One-Unit',
        '2-4 Unit',
        'Multi-Family',
        'Commercial',
        'Other',
        'one unit housing price(high,low,pred)',
        'one unit housing age(high,low,pred)',
        'Neighborhood Boundaries',
        'Neighborhood Description',
        'Market Conditions:'
    ];

    if (fieldsToCheck.includes(field)) {
        if (typeof text === 'object' && text !== null) {
            if (Object.values(text).every(v => !v)) return { isError: true, message: `'${field}' cannot be blank.` };
        } else if (!text || String(text).trim() === '') {
            return { isError: true, message: `'${field}' cannot be blank.` };
        }
    }
    return null;
};

export const checkLocation = (field, text) => {
    if (field !== 'Location') return null;

    const value = String(text || '').trim().toLowerCase();
    if (!value) {
        return { isError: true, message: "'Location' cannot be blank." };
    }

    const validLocations = ['urban', 'suburban', 'rural'];
    if (!validLocations.some(loc => value.includes(loc))) {
        return { isError: true, message: "Location must include one of 'Urban', 'Suburban', or 'Rural'." };
    }

    return { isMatch: true };
};