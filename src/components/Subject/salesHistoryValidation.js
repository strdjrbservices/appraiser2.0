export const checkResearchHistory = (field, text) => {
    if (field !== "I did did not research the sale or transfer history of the subject property and comparable sales. If not, explain") return null;
    const value = String(text || '').trim().toLowerCase();
    if (value.includes('did not')) {
      return { isError: true, message: "Critical Error: Research on sale/transfer history must be performed. 'did not' is not acceptable." };
    }
    if (!value.includes('did')) {
      return { isError: true, message: "This field must state whether research 'did' or 'did not' occur." };
    }
    return { isMatch: true };
  };
  
  export const checkSubjectPriorSales = (field, text, data) => {
    const fieldName = "My research did did not reveal any prior sales or transfers of the subject property for the three years prior to the effective date of this appraisal.";
    if (field !== fieldName) return null;
    if (!data) return null;
    const value = String(text || '').trim().toLowerCase();
    const priorSaleDate = data.Subject?.['Date of Prior Sale/Transfer'];
    const priorSalePrice = data.Subject?.['Price of Prior Sale/Transfer'];
  
    if (!value.includes('did') && !value.includes('did not')) {
      return { isError: true, message: "This field cannot be blank. Please indicate 'did' or 'did not'." };
    }
  
    if (value.includes('did')) {
      if (!priorSaleDate || !priorSalePrice) {
        return { isError: true, message: "If prior sales were revealed, 'Date of Prior Sale/Transfer' and 'Price of Prior Sale/Transfer' for the Subject must be filled." };
      }
    } else if (value.includes('did not')) {
      if (priorSaleDate || priorSalePrice) {
        return { isError: true, message: "If no prior sales were revealed, 'Date of Prior Sale/Transfer' and 'Price of Prior Sale/Transfer' for the Subject should be blank." };
      }
    }
    return { isMatch: true };
  };
  
  export const checkComparablePriorSales = (field, text, data) => {
    const fieldName = "My research did did not reveal any prior sales or transfers of the comparable sales for the year prior to the date of sale of the comparable sale.";
    if (field !== fieldName) return null;
    if (!data) return null;
    const value = String(text || '').trim().toLowerCase();
    const comparableSales = Object.keys(data).filter(k => k.startsWith('COMPARABLE SALE #'));
  
    if (!value.includes('did') && !value.includes('did not')) {
      return { isError: true, message: "This field cannot be blank. Please indicate 'did' or 'did not'." };
    }
  
    if (value.includes('did')) {
      const anyCompHasPriorSale = comparableSales.some(sale => data[sale]?.['Date of Prior Sale/Transfer'] && data[sale]?.['Price of Prior Sale/Transfer']);
      if (!anyCompHasPriorSale) {
        return { isError: true, message: "If prior sales for comparables were revealed, at least one comparable must have 'Date of Prior Sale/Transfer' and 'Price of Prior Sale/Transfer' filled." };
      }
    } else if (value.includes('did not')) {
      const anyCompHasPriorSale = comparableSales.some(sale => data[sale]?.['Date of Prior Sale/Transfer'] || data[sale]?.['Price of Prior Sale/Transfer']);
      if (anyCompHasPriorSale) {
        return { isError: true, message: "If no prior sales for comparables were revealed, all 'Date of Prior Sale/Transfer' and 'Price of Prior Sale/Transfer' fields for comparables should be blank." };
      }
    }
    return { isMatch: true };
  };
  
  export const checkDataSourceNotBlank = (field, text) => {
    const fieldsToCheck = ["Data Source(s) for subject property research", "Data Source(s) for comparable sales research", "Summary of Sales Comparison Approach"];
    if (fieldsToCheck.includes(field)) {
      if (!text || String(text).trim() === '') {
        return { isError: true, message: `'${field}' cannot be blank.` };
      }
    }
    return { isMatch: true };
  };
  
  export const checkEffectiveDateIsCurrentYear = (field, text) => {
    if (field !== "Effective Date of Data Source(s) for prior sale") return null;
    const value = String(text || '').trim();
    if (!value) return null;
  
    const year = new Date(value).getFullYear();
    const currentYear = new Date().getFullYear();
  
    if (year !== currentYear) {
      return { isError: true, message: `The year for '${field}' must be the current year (${currentYear}).` };
    }
    return { isMatch: true };
  };
  
  export const checkSubjectPriorSaleDate = (field, text, data) => {
    if (field !== 'Date of Prior Sale/Transfer' || !data?.Subject) return null;
    const priorSaleDateStr = String(text || '').trim();
    const asOfDateStr = data.RECONCILIATION?.['as of'];
  
    if (!priorSaleDateStr || !asOfDateStr) return null;
  
    const priorSaleDate = new Date(priorSaleDateStr);
    const asOfDate = new Date(asOfDateStr);
  
    if (isNaN(priorSaleDate.getTime()) || isNaN(asOfDate.getTime())) return null;
  
    const threeYears = 3 * 365 * 24 * 60 * 60 * 1000;
    if (asOfDate - priorSaleDate > threeYears || priorSaleDate > asOfDate) {
      return { isError: true, message: "Subject's prior sale date must be within 3 years of the 'as of' date." };
    }
    return { isMatch: true };
  };
  
  export const checkCompPriorSaleDate = (field, text, data, fieldPath, saleName) => {
    if (field !== 'Date of Prior Sale/Transfer' || !saleName || saleName === 'Subject' || !data) return null;
    const priorSaleDateStr = String(text || '').trim();
    const saleDateStr = data[saleName]?.['Date of Sale/Time'];
    if (!priorSaleDateStr || !saleDateStr) return null;
    const priorSaleDate = new Date(priorSaleDateStr);
    const saleDate = new Date(saleDateStr);
    if (isNaN(priorSaleDate.getTime()) || isNaN(saleDate.getTime())) return null;
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    const diffTime = saleDate - priorSaleDate;

    if (priorSaleDate > saleDate) {
        return { isError: true, message: `Comparable's prior sale date (${priorSaleDateStr}) cannot be after its sale date (${saleDateStr}).` };
    }

    if (diffTime > oneYear) {
        return { isError: true, message: `Comparable's prior sale date must be within 1 year of its sale date.` };
    }
    return { isMatch: true };
  };
  
