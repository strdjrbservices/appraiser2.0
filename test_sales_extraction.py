#!/usr/bin/env python3
"""
Test script to extract SALES COMPARISON APPROACH data from PDF
and show how it would be used with the salesgrid component.
"""

import sys
import json
from pdf_extractor import PDFExtractor

def test_pdf_extraction(pdf_path):
    """Test PDF extraction and show salesgrid data mapping"""
    extractor = PDFExtractor()
    
    print(f"Processing PDF: {pdf_path}")
    
    # Convert PDF to DOCX
    docx_path = extractor.convert_pdf_to_docx(pdf_path, "temp_extraction.docx")
    
    # Extract text from DOCX
    full_text = extractor.extract_text_from_docx(docx_path)
    
    # Extract all fields
    extracted_data = extractor.extract_fields_from_text(full_text)
    
    # Get sales comparison specific data
    sales_grid_data = extractor.get_sales_comparison_data(extracted_data)
    
    print("\n=== SALES COMPARISON APPROACH EXTRACTION RESULTS ===\n")
    
    # Show extracted basic subject information
    print("SUBJECT PROPERTY INFORMATION:")
    table_data = sales_grid_data["table_data"]
    
    if table_data.get("Address", {}).get("subject"):
        print(f"  Address: {table_data['Address']['subject']}")
    if table_data.get("Sale Price", {}).get("subject"):
        print(f"  Sale Price: {table_data['Sale Price']['subject']}")
    if table_data.get("Sale Price/Gross Liv. Area", {}).get("subject"):
        print(f"  Sale Price/Gross Liv. Area: {table_data['Sale Price/Gross Liv. Area']['subject']}")
    
    print("\nCOMPARABLE SALES:")
    for comp_num in range(1, 4):
        comp_key = f"comp{comp_num}"
        print(f"\n  Comparable #{comp_num}:")
        
        if table_data.get("Address", {}).get(comp_key):
            print(f"    Address: {table_data['Address'][comp_key]}")
        if table_data.get("Proximity to Subject", {}).get(comp_key):
            print(f"    Proximity: {table_data['Proximity to Subject'][comp_key]}")
        if table_data.get("Sale Price", {}).get(comp_key):
            print(f"    Sale Price: {table_data['Sale Price'][comp_key]}")
        if table_data.get("Sale Price/Gross Liv. Area", {}).get(comp_key):
            print(f"    Sale Price/Gross Liv. Area: {table_data['Sale Price/Gross Liv. Area'][comp_key]}")
    
    print("\nRESEARCH SECTIONS:")
    research_data = sales_grid_data["research_data"]
    
    print(f"  Research Choice: {research_data['research']['choice']}")
    if research_data['research']['explanation']:
        print(f"  Research Explanation: {research_data['research']['explanation']}")
    
    print(f"  Subject Research Choice: {research_data['subject_research']['choice']}")
    if research_data['subject_research']['explanation']:
        print(f"  Subject Research Data: {research_data['subject_research']['explanation']}")
    
    print(f"  Comparable Research Choice: {research_data['comparable_research']['choice']}")
    if research_data['comparable_research']['explanation']:
        print(f"  Comparable Research Data: {research_data['comparable_research']['explanation']}")
    
    print("\nADDITIONAL DATA:")
    additional_data = sales_grid_data["additional_data"]
    
    if additional_data.get("analysis_of_prior_sale"):
        print(f"  Analysis of Prior Sale: {additional_data['analysis_of_prior_sale'][:100]}...")
    
    if additional_data.get("summary"):
        print(f"  Summary: {additional_data['summary'][:100]}...")
    
    if additional_data.get("indicated_value"):
        print(f"  Indicated Value: {additional_data['indicated_value']}")
    
    print("\n=== RAW SALES COMPARISON FIELDS FOUND ===\n")
    
    # Show all extracted sales comparison fields
    sales_fields = {k: v for k, v in extracted_data.items() if k.startswith("Sales Comparison")}
    
    for field, value in sales_fields.items():
        print(f"{field}: {value}")
    
    print(f"\nTotal Sales Comparison fields extracted: {len(sales_fields)}")
    
    # Save the extracted data for reference
    with open("extracted_sales_data.json", "w") as f:
        json.dump(sales_grid_data, f, indent=2)
    
    print(f"\nSales grid data saved to: extracted_sales_data.json")
    print("This data can be passed to the SalesComparisonApproach React component as props.")
    
    # Clean up temp file
    import os
    if os.path.exists(docx_path):
        os.remove(docx_path)
    
    return sales_grid_data

def main():
    if len(sys.argv) != 2:
        print("Usage: python test_sales_extraction.py <pdf_path>")
        print("Example: python test_sales_extraction.py 'src/components/Subject/6409 Back Bay Ln (1).pdf'")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    try:
        test_pdf_extraction(pdf_path)
    except Exception as e:
        print(f"Error processing PDF: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
