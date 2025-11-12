import React from "react";

const FIELDS2 = [
  "Address",
  "Proximity to Subject",
  "Sale Price",
  "Sale Price/Gross Liv. Area",
  "Data Source(s)",
  "Verification Source(s)",
  "Sale or Financing Concessions",
  "Date of Sale/Time",
  "Location",
  "Leasehold/Fee Simple",
  "Site",
  "View",
  "Design (Style)",
  "Quality of Construction",
  "Actual Age",
  "Condition",
  "Above Grade",
  "Room Count",
  "Gross Living Area",
  "Basement & Finished Rooms Below Grade",
  "Functional Utility",
  "Heating/Cooling",
  "Energy Efficient Items",
  "Garage/Carport",
  "Porch/Patio/Deck"
];

// You can change the number of comparables here
const comparableSales = [
  "COMPARABLE SALE #1",
  "COMPARABLE SALE #2",
  "COMPARABLE SALE #3",
  "COMPARABLE SALE #4",
  "COMPARABLE SALE #5",
  "COMPARABLE SALE #6",
  "COMPARABLE SALE #7",
  "COMPARABLE SALE #8",
  "COMPARABLE SALE #9",
  // Add more if needed: "COMPARABLE SALE #4", ...
];

export default function SalesComparisonApproach() {

  return (
    <div className="subject-container container mt-5 flex border border-gray-400 overflow-hidden" style={{ height: '1000px', width: '1800px', fontSize: '0.80rem' }}>

      {/* <div className="card-header CAR1 bg-primary text-white" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        {"SALES COMPARISON APPROACH".split("").map((ch, i) => (
          <span key={i}>{ch}</span>
        ))}
        <strong>SALES COMPARISON APPROACH</strong>
      </div> */}

      <div className="card-header CAR1 bg-primary text-white new-ticket" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <strong>SALES COMPARISON APPROACH</strong>
      </div>
     
    </div>
  );
}
