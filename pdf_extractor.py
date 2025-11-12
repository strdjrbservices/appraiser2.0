import google.generativeai as genai
import json
from bs4 import BeautifulSoup
import re
import asyncio
import textwrap
from google.api_core import exceptions as google_exceptions
from PyPDF2 import PdfReader

genai.configure(api_key="AIzaSyDWVKFK-R5eWUL4jKqxVw48xOHNbMgbEiA")

def _check_for_api_error_message(response_text, prompt_feedback):
    """Checks if the given text or prompt feedback indicates a Gemini API error."""
    return "Gemini 2.0 generated this response due to high traffic on Gemini 2.5" in response_text or \
           "API quota exceeded" in response_text or \
           (prompt_feedback and prompt_feedback.block_reason)


#{{1004}}

# SUBJECT
SUBJECT_FIELDS = [
    'Exposure comment','Prior service comment','ANSI','FHA Case No.','Property Address', 'City', 'County', 'State', 'Zip Code', 'Borrower', 'Owner of Public Record',
    'Legal Description', "Assessor's Parcel #", 'Tax Year', 'R.E. Taxes $', 'Neighborhood Name', 'Map Reference',
    'Census Tract', 'Occupant', 'Special Assessments $', 'PUD', 'HOA $', 'HOA(per year)', 'HOA(per month)',
    'Property Rights Appraised', 'Assignment Type', 'Lender/Client', 'Address (Lender/Client)',
    'Offered for Sale in Last 12 Months', 'Report data source(s) used, offering price(s), and date(s)',"Appraiser's Fee","AMC License #"
]

# CONTRACT
CONTRACT_FIELDS = [
    'I did did not analyze the contract for sale for the subject purchase transaction. Explain the results of the analysis of the contract for sale or why the analysis was not performed.',
    'Contract Price $', 'Date of Contract', 'Is property seller owner of public record?', 'Data Source(s)',
    'Is there any financial assistance (loan charges, sale concessions, gift or downpayment assistance, etc.) to be paid by any party on behalf of the borrower?',
    'If Yes, report the total dollar amount and describe the items to be paid',
]

# NEIGHBORHOOD
NEIGHBORHOOD_FIELDS = [
    "Location", "Built-Up", "Growth", "Property Values", "Demand/Supply",
    "Marketing Time", "One-Unit", "2-4 Unit", "Multi-Family", "Commercial", "Other", "Present Land Use for other", "one unit housing price(high,low,pred)", "one unit housing age(high,low,pred)",
    "Neighborhood Boundaries", "Neighborhood Description", "Market Conditions:",
]

# SITE
SITE_FIELDS = [
    "Dimensions", "Area", "Shape", "View", "Specific Zoning Classification", "Zoning Description",
    "Zoning Compliance", "Is the highest and best use of subject property as improved (or as proposed per plans and specifications) the present use?",
    "Electricity", "Gas", "Water", "Sanitary Sewer", "Street", "Alley", "FEMA Special Flood Hazard Area",
    "FEMA Flood Zone", "FEMA Map #", "FEMA Map Date", "Are the utilities and off-site improvements typical for the market area? If No, describe",
    "Are there any adverse site conditions or external factors (easements, encroachments, environmental conditions, land uses, etc.)? If Yes, describe`"

]

# IMPROVEMENTS
IMPROVEMENTS_FIELDS = [
    "One with Accessory Unit","Units", "# of Stories", "Type", "Existing/Proposed/Under Const.",
    "Design (Style)", "Year Built", "Effective Age (Yrs)", "Foundation Type",
    "Basement Area sq.ft.", "Basement Finish %",
    "Evidence of", "Foundation Walls (Material/Condition)",
    "Exterior Walls (Material/Condition)", "Roof Surface (Material/Condition)",
    "Gutters & Downspouts (Material/Condition)", "Window Type (Material/Condition)",
    "Storm Sash/Insulated", "Screens", "Floors (Material/Condition)", "Walls (Material/Condition)",
    "Trim/Finish (Material/Condition)", "Bath Floor (Material/Condition)", "Bath Wainscot (Material/Condition)",
    "Attic", "Heating Type", "Fuel", "Cooling Type",
    "Fireplace(s) #", "Patio/Deck", "Pool", "Woodstove(s) #", "Fence", "Porch", "Other Amenities",
    "Car Storage", "Driveway # of Cars", "Driveway Surface", "Garage # of Cars", "Carport # of Cars",
    "Garage Att.", "Garage Det.", "Garage Built-in", "Appliances",
    "Finished area above grade Rooms", "Finished area above grade Bedrooms",
    "Finished area above grade Bath(s)", "Square Feet of Gross Living Area Above Grade",
    "Additional features", "Describe the condition of the property",
    "Are there any physical deficiencies or adverse conditions that affect the livability, soundness, or structural integrity of the property? If Yes, describe",
    "Does the property generally conform to the neighborhood (functional utility, style, condition, use, construction, etc.)? If No, describe"
]

# RECONCILIATION
RECONCILIATION_FIELDS = [
    'Indicated Value by: Sales Comparison Approach $',
    'Cost Approach (if developed)',
    'Income Approach (if developed) $',
    'Income Approach (if developed) $ Comment',
    'This appraisal is made "as is", subject to completion per plans and specifications on the basis of a hypothetical condition that the improvements have been completed, subject to the following repairs or alterations on the basis of a hypothetical condition that the repairs or alterations have been completed, or subject to the following required inspection based on the extraordinary assumption that the condition or deficiency does not require alteration or repair:',
    "opinion of the market value, as defined, of the real property that is the subject of this report is $",
    "as of", "final value"
]

# COST APPROACH
COST_APPROACH_FIELDS = [
    "Provide adequate information for the lender/client to replicate the below cost figures and calculations.",
    "Support for the opinion of site value (summary of comparable land sales or other methods for estimating site value)",
    "Estimated",
    "Source of cost data",
    "Quality rating from cost service ",
    "Effective date of cost data ",
    "Comments on Cost Approach (gross living area calculations, depreciation, etc.) ",
    "Estimated Remaining Economic Life (HUD and VA only) ",
    "OPINION OF SITE VALUE = $ ................................................",
    "Dwelling",
    "Garage/Carport ",
    " Total Estimate of Cost-New  = $ ...................",
    "Depreciation ",
    "Depreciated Cost of Improvements......................................................=$ ",
    "“As-is” Value of Site Improvements......................................................=$",
    "Indicated Value By Cost Approach......................................................=$",
]

RentSchedulesFIELDS2 = [
        "Address",
        "Proximity to Subject",
        "Date Lease Begins",
        "Date Lease Expires",
        "Monthly Rental",
        "Less: Utilities",
        "Furniture",
        "Adjusted Monthly Rent",
        "Data Source",
        "Rent",
        "Concessions",
        "Location/View",
        "Design and Appeal",
        "Age/Condition",
        "Room Count Total",
        "Room Count Bdrms",
        "Room Count Baths",
        "Gross Living Area",
        "Other (e.g., basement, etc.)",
        "Other:",
        "Net Adj. (total)",
        "Indicated Monthly Market Rent",
]


# INCOME APPROACH
INCOME_APPROACH_FIELDS = [
    "Estimated Monthly Market Rent $",
    "X Gross Rent Multiplier  = $",
    "Indicated Value by Income Approach",
    "Summary of Income Approach (including support for market rent and GRM) ",
]

# PUD INFORMATION
PUD_INFO_FIELDS = [
    "PUD Fees $",
    "PUD Fees (per month)",
    "PUD Fees (per year)",
    "Is the developer/builder in control of the Homeowners' Association (HOA)?", "Unit type(s)",
    "Provide the following information for PUDs ONLY if the developer/builder is in control of the HOA and the subject property is an attached dwelling unit.",
    "Legal Name of Project", "Total number of phases", "Total number of units", "Total number of units sold",
    "Total number of units rented", "Total number of units for sale", "Data source(s)", "Was the project created by the conversion of existing building(s) into a PUD?", " If Yes, date of conversion", "Does the project contain any multi-dwelling units? Yes No Data", "Are the units, common elements, and recreation facilities complete?", "If No, describe the status of completion.", "Are the common elements leased to or by the Homeowners' Association?",
    "If Yes, describe the rental terms and options.", "Describe common elements and recreational facilities."
]

# CERTIFICATION
CERTIFICATION_FIELDS = [
    "Signature", "Name", "Company Name", "Company Address", "Telephone Number", "Email Address", "Date of Signature and Report", "Effective Date of Appraisal", "State Certification #", "or State License #", "or Other (describe)", "State #", "State", "Expiration Date of Certification or License", "ADDRESS OF PROPERTY APPRAISED", "APPRAISED VALUE OF SUBJECT PROPERTY $",
    "LENDER/CLIENT Name",
    "Lender/Client Company Name",
    "Lender/Client Company Address",
    "Lender/Client Email Address",
]

# ADDENDUM
ADDENDUM_FIELDS = [
    "SUPPLEMENTAL ADDENDUM",
    "ADDITIONAL COMMENTS",
    "APPRAISER'S CERTIFICATION:",
    "SUPERVISORY APPRAISER'S CERTIFICATION:",
    "Analysis/Comments",
    "GENERAL INFORMATION ON ANY REQUIRED REPAIRS",
    "UNIFORM APPRAISAL DATASET (UAD) DEFINITIONS ADDENDUM",
]

# SALES OR TRANSFER HISTORY
SALES_TRANSFER_FIELDS = [
    "I did did not research the sale or transfer history of the subject property and comparable sales. If not, explain",
    "My research did did not reveal any prior sales or transfers of the subject property for the three years prior to the effective date of this appraisal.",
    "Data Source(s) for subject property research",
    "My research did did not reveal any prior sales or transfers of the comparable sales for the year prior to the date of sale of the comparable sale.",
    "Data Source(s) for comparable sales research",
    "Analysis of prior sale or transfer history of the subject property and comparable sales",
    "Summary of Sales Comparison Approach", "Indicated Value by Sales Comparison Approach $"
]

# INFO OF SALES
INFO_OF_SALES_FIELDS = [
    "There are ____ comparable properties currently offered for sale in the subject neighborhood ranging in price from$ ___to $___",
    "There are ___comparable sales in the subject neighborhoodwithin the past twelvemonths ranging in sale price from$___ to $____"
]

# UNIFORM RESIDENTIAL APPRAISAL REPORT
UNIFORM_REPORT_FIELDS = [
    "SCOPE OF WORK:",
    "INTENDED USE:",
    "INTENDED USER:",
    "DEFINITION OF MARKET VALUE:",
    "STATEMENT OF ASSUMPTIONS AND LIMITING CONDITIONS:",
]

# APPRAISAL AND REPORT IDENTIFICATION
APPRAISAL_ID_FIELDS = [
    "This Report is one of the following types:", "Comments on Standards Rule 2-3", "Reasonable Exposure Time", "Comments on Appraisal and Report Identification"
]

# MARKET CONDITIONS
MARKET_CONDITIONS_FIELDS = [
    "Inventory Analysis Total # of Comparable Sales (Settled)",
    "Inventory Analysis Total # of Comparable Sales (Settled) (Prior 7-12 Months)",
    "Inventory Analysis Total # of Comparable Sales (Settled) (Prior 4-6 Months)",
    "Inventory Analysis Total # of Comparable Sales (Settled) (Current-3 Months)",
    "Inventory Analysis Total # of Comparable Sales (Settled) (Overall Trend)",
    "Inventory Analysis Absorption Rate (Total Sales/Months)",
    "Inventory Analysis Absorption Rate (Total Sales/Months) (Prior 7-12 Months)",
    "Inventory Analysis Absorption Rate (Total Sales/Months) (Prior 4-6 Months)",
    "Inventory Analysis Absorption Rate (Total Sales/Months) (Current-3 Months)",
    "Inventory Analysis Absorption Rate (Total Sales/Months) (Overall Trend)",
    "Inventory Analysis Total # of Comparable Active Listings",
    "Inventory Analysis Total # of Comparable Active Listings (Prior 7-12 Months)",
    "Inventory Analysis Total # of Comparable Active Listings (Prior 4-6 Months)",
    "Inventory Analysis Total # of Comparable Active Listings (Current-3 Months)",
    "Inventory Analysis Total # of Comparable Active Listings (Overall Trend)",
    "Inventory Analysis Months of Housing Supply (Total Listings/Ab.Rate)",
    "Median Sale & List Price, DOM, Sale/List % Median Comparable Sale Price (Prior 7-12 Months)",
    "Median Sale & List Price, DOM, Sale/List % Median Comparable Sale Price (Prior 4-6 Months)",
    "Median Sale & List Price, DOM, Sale/List % Median Comparable Sale Price (Current-3 Months)",
    "Median Sale & List Price, DOM, Sale/List % Median Comparable Sale Price (Overall Trend)",
    "Median Sale & List Price, DOM, Sale/List % Median Comparable Sales Days on Market (Prior 7-12 Months)",
    "Median Sale & List Price, DOM, Sale/List % Median Comparable Sales Days on Market (Prior 4-6 Months)",
    "Median Sale & List Price, DOM, Sale/List % Median Comparable Sales Days on Market (Current-3 Months)",
    "Median Sale & List Price, DOM, Sale/List % Median Comparable Sales Days on Market (Overall Trend)",
    "Median Sale & List Price, DOM, Sale/List % Median Comparable List Price (Prior 7-12 Months)",
    "Median Sale & List Price, DOM, Sale/List % Median Comparable List Price (Prior 4-6 Months)",
    "Median Sale & List Price, DOM, Sale/List % Median Comparable List Price (Current-3 Months)",
    "Median Sale & List Price, DOM, Sale/List % Median Comparable List Price (Overall Trend)",
    "Median Sale & List Price, DOM, Sale/List % Median Comparable Listings Days on Market (Prior 7-12 Months)",
    "Median Sale & List Price, DOM, Sale/List % Median Comparable Listings Days on Market (Prior 4-6 Months)",
    "Median Sale & List Price, DOM, Sale/List % Median Comparable Listings Days on Market (Current-3 Months)",
    "Median Sale & List Price, DOM, Sale/List % Median Comparable Listings Days on Market (Overall Trend)",
    "Median Sale & List Price, DOM, Sale/List % Median Sale Price as % of List Price (Prior 7-12 Months)",
    "Median Sale & List Price, DOM, Sale/List % Median Sale Price as % of List Price (Prior 4-6 Months)",
    "Median Sale & List Price, DOM, Sale/List % Median Sale Price as % of List Price (Current-3 Months)",
    "Median Sale & List Price, DOM, Sale/List % Median Sale Price as % of List Price (Overall Trend)",

    "Instructions:",
    "Seller-(developer, builder, etc.)paid financial assistance prevalent?",
    "Explain in detail the seller concessions trends for the past 12 months (e.g., seller contributions increased from 3% to 5%, increasing use of buydowns, closing costs, condo fees, options, etc.).",
    "Are foreclosure sales (REO sales) a factor in the market?", "If yes, explain (including the trends in listings and sales of foreclosed properties).",
    "Cite data sources for above information.", "Summarize the above information as support for your conclusions in the Neighborhood section of the appraisal report form. If you used any additional information, such as an analysis of pending sales and/or expired and withdrawn listings, to formulate your conclusions, provide both an explanation and support for your conclusions."
]

# CONDO
CONDO_FIELDS = [
    "Subject Project Data Total # of Comparable Sales (Settled) (Prior 7–12 Months)",
    "Subject Project Data Total # of Comparable Sales (Settled) (Prior 4–6 Months)",
    "Subject Project Data Total # of Comparable Sales (Settled) (Current – 3 Months)",
    "Subject Project Data Total # of Comparable Sales (Settled) (Overall Trend)",
    "Subject Project Data Absorption Rate (Total Sales/Months) (Prior 7–12 Months)",
    "Subject Project Data Absorption Rate (Total Sales/Months) (Prior 4–6 Months)",
    "Subject Project Data Absorption Rate (Total Sales/Months) (Current – 3 Months)",
    "Subject Project Data Absorption Rate (Total Sales/Months) (Overall Trend)",
    "Subject Project Data Total # of Comparable Active Listings (Prior 7–12 Months)",
    "Subject Project Data Total # of Comparable Active Listings (Prior 4–6 Months)",
    "Subject Project Data Total # of Comparable Active Listings (Current – 3 Months)",
    "Subject Project Data Total # of Comparable Active Listings (Overall Trend)",
    "Subject Project Data Months of Unit Supply (Total Listings/Ab.Rate) (Prior 7–12 Months)",
    "Subject Project Data Months of Unit Supply (Total Listings/Ab.Rate) (Prior 4–6 Months)",
    "Subject Project Data Months of Unit Supply (Total Listings/Ab.Rate) (Current – 3 Months)",
    "Subject Project Data Months of Unit Supply (Total Listings/Ab.Rate) (Overall Trend)",
    "Are foreclosure sales (REO sales) a factor in the project?",
    "If yes, indicate the number of REO listings and explain the trends in listings and sales of foreclosed properties.",
    "Summarize the above trends and address the impact on the subject unit and project.",
]

# CONDO FORECLOSURE
CONDO_FORECLOSURE_FIELDS = [
    "Are foreclosure sales (REO sales) a factor in the project?",
    "If yes, indicate the number of REO listings and explain the trends in listings and sales of foreclosed properties.",
    "Summarize the above trends and address the impact on the subject unit and project.",
]

#IMAGE
IMAGE_FIELDS =[
    "Extract the subject property address from the 'Subject Photos' section. Return as a JSON object like {'Subject Photo Address': 'address'}.",
    "Extract the subject property address from the 'Aerial Map' section. Return as a JSON object like {'Aerial Map Subject Address': 'address'}.",
    "Extract the subject property address from the 'Location Map' section. Return as a JSON object like {'Location Map Subject Address': 'address'}.",
    "Extract the address for each comparable sale from the 'Comparable Photos' section. Return as a JSON object like {'Comparable Photo Address 1': 'address', 'Comparable Photo Address 2': 'address', ...}.",
    "Extract the address for each comparable sale from the 'Location Map' section. Return as a JSON object like {'Location Map Address 1': 'address', 'Location Map Address 2': 'address', ...}.",
    "Analyze the interior photos and provide a count for each room type (bedroom, bathroom, kitchen, etc.), referencing the floor plan and improvements section. Return as a JSON object.",
    "For each comparable photo, check if the photo matches the property described in the sales comparison grid. Return as a JSON object like {'is label correct? 1': 'Yes' or 'No' or 'N/A', 'is label correct? 2': 'Yes' or 'No' or 'N/A', ...}.",
    "For each comparable photo, check if it is a duplicate of another comparable photo. Return as a JSON object like {'duplicate photo? 1': 'Yes' or 'No' or 'N/A', 'duplicate photo? 2': 'Yes' or 'No' or 'N/A', ...}.",
    "Verify and report on the consistency of comparable property addresses across the sales comparison grid, photos, and location map. Note any discrepancies or use of duplicate photos. Also, verify appraiser signature details against their license. Return as a JSON object.",
    "include bedroom, bed, bathroom, bath, half bath, kitchen, lobby, foyer, living room count with label and photo,please explan and match the floor plan with photo and improvement section, GLA",
    "please match comparable address in sales comparison approach and comparable photos, please make sure comp phto are not same, also find front, rear, street photo and make sure it is not same, capture any additionbal photo for adu according to check mark",
    "please match comparable address in sales comparison approach and comparable photos, please make sure comp phto are not same, also find front, rear, street photo and make sure it is not same, capture any additionbal photo for adu according to check mark, please match the same in location map, areial map should have subject address, please check signature section details of appraiser in appraiser license copy for accuracy"
]
    # "Subject related photos Count with Lables",
    # "subject address match with SALES COMPARISON APPROACH section, Comparable Photo Page, and Location Map",
    # "Bedroom photo count match with SALES COMPARISON APPROACH and IMPROVEMENTS section",
    # "Bathroom photo count match with SALES COMPARISON APPROACH and IMPROVEMENTS section",
    # "Comparable photos count and lables",
    # "Comparable lables and Address match with SALES COMPARISON APPROACH",
    # "Subject address match in areial map",
    # "Building Sketch summary",
    # "Appraiser licence summary",
    # "Name and other information of appraisaer match with licence and signature page"
# TOTAL ROOMS
# Interior Room & Floor Plan Matching:
# Identify and count all interior spaces: bedrooms, beds, bathrooms, half baths, kitchen, lobby, foyer, living room.
# Include labels and corresponding photos for each room.
# Match the floor plan with the provided photos and include an “Improvements” section.
# Include GLA (Gross Living Area) details.
# Sales Comparison Approach (Comps):
# Match comparable property addresses with the photos.
# Ensure no two comparable photos are identical.
# Capture front, rear, and street views for each comparable; ensure these are unique.
# Include any additional photos for ADU (Accessory Dwelling Unit) based on checkmarks.
# Location & Maps:
# Match comparable properties in the location map.
# Ensure the aerial map shows the subject property address.
# Appraiser Verification:
# Check the signature section details against the appraiser’s license copy for accuracy.


RENT_SCHEDULE_RECONCILIATION_FIELDS = [
    "Comments on market data, including the range of rents for single family properties, an estimate of vacancy for single family rental properties, the general trend of rents and vacancy, and support for the above adjustments. (Rent concessions should be adjusted to the market, not to the subject property.)",
    "Final Reconciliation of Market Rent:",
    "I (WE) ESTIMATE THE MONTHLY MARKET RENT OF THE SUBJECT AS OF",
    "TO BE $",
]


SalesGridFIELDS2 = [
        "Address",
        "Proximity to Subject",
        "Sale Price",
        "Sale Price/Gross Liv. Area",
        "Data Source(s)",
        "Verification Source(s)",
        "Sale or Financing Concessions",
        "Sale or Financing Concessions Adjustment",
        "Date of Sale/Time",
        "Date of Sale/Time Adjustment",
        "Location",
        "Location Adjustment",
        "Leasehold/Fee Simple",
        "Leasehold/Fee Simple Adjustment",
        "Site",
        "Site Adjustment",
        "View",
        "View Adjustment",
        "Design (Style)",
        "Design (Style) Adjustment",
        "Quality of Construction",
        "Quality of Construction Adjustment",
        "Actual Age",
        "Actual Age Adjustment",
        "Condition",
        "Condition Adjustment",
        "Total Rooms",
        "Bedrooms",
        "Bedrooms Adjustment",
        "Baths",
        "Baths Adjustment",
        "Above Grade Room Count Adjustment",
        "Gross Living Area",
        "Gross Living Area Adjustment",
        "Basement & Finished Rooms Below Grade",
        "Basement & Finished Rooms Below Grade Adjustment",
        "Functional Utility",
        "Functional Utility Adjustment",
        "Heating/Cooling",
        "Heating/Cooling Adjustment",
        "Energy Efficient Items",
        "Energy Efficient Items Adjustment",
        "Garage/Carport",
        "Garage/Carport Adjustment",
        "Porch/Patio/Deck",
        "Porch/Patio/Deck Adjustment",
        "Net Adjustment (Total)",
        "Adjusted Sale Price of Comparable",
        #SALES HISTORY
        "Date of Prior Sale/Transfer",
        "Price of Prior Sale/Transfer", 
        "Data Source(s) for prior sale",
        "Effective Date of Data Source(s) for prior sale",
]

RentSchedulesFIELDS2 = [
        "Address",
        "Proximity to Subject",
        "Date Lease Begins",
        "Date Lease Expires",
        "Monthly Rental",
        "Less: Utilities",
        "Furniture",
        "Adjusted Monthly Rent",
        "Data Source",
        "Rent",
        "Concessions",
        "Location/View",
        "Design and Appeal",
        "Age/Condition",
        "Room Count Total",
        "Room Count Bdrms",
        "Room Count Baths",
        "Gross Living Area",
        "Other (e.g., basement, etc.)",
        "Other:",
        "Net Adj. (total)",
        "Indicated Monthly Market Rent",
]


#{{1073}}
Project_SITE_FIELDS = [
    "Topography", "Size", "Density", "View", "Specific Zoning Classification", "Zoning Description",
    "Zoning Compliance", "Is the highest and best use of subject property as improved (or as proposed per plans and specifications) the present use?",
    "Electricity", "Gas", "Water", "Sanitary Sewer", "Street", "Alley", "FEMA Special Flood Hazard Area",
    "FEMA Flood Zone", "FEMA Map #", "FEMA Map Date", "Are the utilities and off-site improvements typical for the market area?",
    "Are there any adverse site conditions or external factors (easements, encroachments, environmental conditions, land uses, etc.)?",
    "If Yes, describe",
]

Project_Info_FIELDS = [
    "Data source(s) for project information", "Project Description", "# of Stories",
      "# of Elevators", "Existing/Proposed/Under Construction", "Year Built",
    "Effective Age", "Exterior Walls",
    "Roof Surface", "Total # Parking", "Ratio (spaces/units)", "Type", "Guest Parking", "# of Units", "# of Units Completed",
    "# of Units For Sale", "# of Units Sold", "# of Units Rented", "# of Owner Occupied Units",
    "# of Phases","# of Units","# of Units for Sale","# of Units Sold","# of Units Rented","# of Owner Occupied Units","# of Planned Phases",
    "# of Planned Units","# of Planned Units for Sale","# of Planned Units Sold","# of Planned Units Rented","# of Planned Owner Occupied Units",
    "Project Primary Occupancy","Is the developer/builder in control of the Homeowners' Association (HOA)?",
    "Management Group","Does any single entity (the same individual, investor group, corporation, etc.) own more than 10% of the total units in the project?"
    ,"Was the project created by the conversion of existing building(s) into a condominium?",
    "If Yes,describe the original use and date of conversion", 
    "Are the units, common elements, and recreation facilities complete (including any planned rehabilitation for a condominium conversion)?","If No, describe",
    "Is there any commercial space in the project?",
    "If Yes, describe and indicate the overall percentage of the commercial space.","Describe the condition of the project and quality of construction.",
    "Describe the common elements and recreational facilities.","Are any common elements leased to or by the Homeowners' Association?",
    "If Yes, describe the rental terms and options.","Is the project subject to a ground rent?",
    "If Yes, $ per year (describe terms and conditions)",
    "Are the parking facilities adequate for the project size and type?","If No, describe and comment on the effect on value and marketability."
]

Project_Analysis_FIELDS = [
    "I did did not analyze the condominium project budget for the current year. Explain the results of the analysis of the budget (adequacy of fees, reserves, etc.), or why the analysis was not performed.",
    "Are there any other fees (other than regular HOA charges) for the use of the project facilities?",
    "If Yes, report the charges and describe.",
    "Compared to other competitive projects of similar quality and design, the subject unit charge appears",
    "If High or Low, describe",
    "Are there any special or unusual characteristics of the project (based on the condominium documents, HOA meetings, or other information) known to the appraiser?",
    "If Yes, describe and explain the effect on value and marketability.",


]

UNIT_DESCRIPTIONS_FIELDS = [
    "Unit Charge$"," per month X 12 = $", "per year",
    "Annual assessment charge per year per square feet of gross living area = $",
    "Utilities included in the unit monthly assessment [None/Heat/Air/Conditioning/Electricity/Gas/Water/Sewer/Cable/Other (describe)]",
    "Floor #",
    "# of Levels",
    "Heating Type/Fuel",
    "Central AC/Individual AC/Other (describe)",
    "Fireplace(s) #/Woodstove(s) #/Deck/Patio/Porch/Balcony/Other",
    "Refrigerator/Range/Oven/Disp Microwave/Dishwasher/Washer/Dryer",
    "Floors",
    "Walls",
    "Trim/Finish",
    "Bath Wainscot",
    "Doors",
    "None/Garage/Covered/Open",    
    "Assigned/Owned",
    "# of Cars",
    "Parking Space #",
    "Finished area above grade contains:",
    "Rooms",
    "Bedrooms",
    "Bath(s)",
    "Square Feet of Gross Living Area Above Grade",
    "Are the heating and cooling for the individual units separately metered?", "If No, describe and comment on compatibility to other projects in the market area.",
    "Additional features (special energy efficient items, etc.)",
    "Describe the condition of the property (including needed repairs, deterioration, renovations, remodeling, etc.)",
    "Are there any physical deficiencies or adverse conditions that affect the livability, soundness, or structural integrity of the property? If Yes, describe",
    "Does the property generally conform to the neighborhood (functional utility, style, condition, use, construction, etc.)? If No, describe"
]

# DATA CONSISTENCY
DATA_CONSISTENCY_FIELDS = [
    "Bedroom Improvements Count",
    "Bedroom Sales Comparison Approach Count",
    "Bedroom Photo Count",
    "TOTAL Bedroom Floorplan Count",
    "Bathroom Improvements Count",
    "Bathroom Sales Comparison Approach Count",
    "Bathroom Photo Count",
    "TOTAL Bathroom Floorplan Count",
    "GLA Improvements Count",
    "GLA Sales Comparison Approach Count",
    "GLA Photo Count",
    "GLA Floorplan Count",
    "photo and label of the Bedrooms correct are matching?",
    "photo and label of the Bathrooms correct are matching?",
    "check for the duplicate photo of the Bedrooms?",
    "check for the duplicate photo of the Bathrooms?",
    
]
PRIOR_SALE_HISTORY_FIELDS =[
    "Prior Sale History: I did did not research the sale or transfer history of the subject property and comparable sales",
    "Prior Sale History: My research did did not reveal any prior sales or transfers of the subject property for the three years prior to the effective date of this appraisal",
    "Prior Sale History: Data source(s) for subject",
    "Prior Sale History: My research did did not reveal any prior sales or transfers of the comparable sales for the year prior to the date of sale of the comparable sale",
    "Prior Sale History: Data source(s) for comparables",
    "Prior Sale History: Report the results of the research and analysis of the prior sale or transfer history of the subject property and comparable sales",
    "Prior Sale History: Date of Prior Sale/Transfer",
    "Prior Sale History: Price of Prior Sale/Transfer",
    "Prior Sale History: Data Source(s) for prior sale/transfer",
    "Prior Sale History: Effective Date of Data Source(s)",
    "Prior Sale History: Analysis of prior sale or transfer history of the subject property and comparable sales"
]



FORM_TYPE_CATEGORIES = {
    "1004": [
        "SUBJECT", "CONTRACT", "NEIGHBORHOOD", "SITE", "IMPROVEMENTS", "SALES_GRID",
        "SALES_TRANSFER", "INFO_OF_SALES", "RECONCILIATION", "COST_APPROACH", "INCOME_APPROACH",
        "SALES_TRANSFER", "INFO_OF_SALES", "RECONCILIATION", "COST_APPROACH", "INCOME_APPROACH", "CONDO_FORECLOSURE",
        "PUD_INFO", "MARKET_CONDITIONS", "CONDO", "CERTIFICATION", "ADDENDUM",
        "UNIFORM_REPORT", "APPRAISAL_ID", "IMAGE_ANALYSIS", "DATA_CONSISTENCY","ADDENDUM_FIELDS"
    ],
    "1073": [
        "SUBJECT", "CONTRACT", "NEIGHBORHOOD", "PROJECT_SITE", "PROJECT_INFO",
        "PROJECT_ANALYSIS", "UNIT_DESCRIPTIONS", "PRIOR_SALE_HISTORY", "SALES_GRID", "CONDO_FORECLOSURE",
        "SALES_TRANSFER", "INFO_OF_SALES", "RECONCILIATION", "COST_APPROACH", "INCOME_APPROACH",
        "CONDO", "CERTIFICATION", "ADDENDUM", "UNIFORM_REPORT", "APPRAISAL_ID","ADDENDUM_FIELDS"
        "IMAGE_ANALYSIS", "DATA_CONSISTENCY"
    ],
    "1007": [
        "SUBJECT", "CONTRACT", "NEIGHBORHOOD", "SITE", "IMPROVEMENTS", "SALES_GRID",
        "SALES_TRANSFER", "INFO_OF_SALES", "RENT_SCHEDULE_GRID", "RENT_SCHEDULE_RECONCILIATION",
        "RECONCILIATION", "COST_APPROACH", "INCOME_APPROACH", "PUD_INFO",
        "RECONCILIATION", "COST_APPROACH", "INCOME_APPROACH", "PUD_INFO", "CONDO_FORECLOSURE",
        "MARKET_CONDITIONS", "CONDO", "CERTIFICATION", "ADDENDUM", "UNIFORM_REPORT","ADDENDUM_FIELDS",
        "APPRAISAL_ID", "IMAGE_ANALYSIS", "DATA_CONSISTENCY"
    ]
}

# Default categories for form types not explicitly defined
DEFAULT_CATEGORIES = [
    "SUBJECT", "CONTRACT", "NEIGHBORHOOD", "SITE", "IMPROVEMENTS", "SALES_GRID",
    "SALES_TRANSFER", "RECONCILIATION", "COST_APPROACH", "INCOME_APPROACH",
    "SALES_TRANSFER", "RECONCILIATION", "COST_APPROACH", "INCOME_APPROACH", "CONDO_FORECLOSURE",
    "PUD_INFO", "MARKET_CONDITIONS", "CONDO", "CERTIFICATION", "ADDENDUM",
    "UNIFORM_REPORT", "APPRAISAL_ID", "IMAGE_ANALYSIS", "DATA_CONSISTENCY"
]


async def extract_fields_from_pdf(pdf_path, form_type: str, category: str = None, custom_prompt: str = None):
    combined_result = {}
    raw_responses = []

    try:
        # Read the PDF file bytes directly to avoid the File API's `ragStoreName` requirement.
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()

        # Create the file part to be included in the prompt.
        sample_file_part = {"mime_type": "application/pdf", "data": pdf_bytes}

        model = genai.GenerativeModel(model_name="gemini-2.5-flash")

        if custom_prompt:
            # Handle custom prompt directly
            final_prompt = (
                f"Analyze the provided appraisal report based on this prompt: '{custom_prompt}'. "
                "Your response must be a single, clean JSON object. "
                "The JSON should have a 'summary' key with a 2-3 line summary of the findings. "
                "For all other keys representing extracted fields, the value must be a JSON object containing two keys: 'value' (the extracted text or finding) and 'page_no' (the page number where the information was found). "
                "Example: { \"Field Name\": { \"value\": \"Extracted Value\", \"page_no\": 5 } }. "
                "Do not include any introductory text, explanations, or markdown formatting like ```json. "
                "If a field's value is not found, use an empty string '' for the 'value' and null for 'page_no'."
            )

            try:
                raw_text = ""  # Initialize raw_text
                response = await model.generate_content_async(contents=[sample_file_part, final_prompt])
                raw_text = response.text

                if _check_for_api_error_message(raw_text, response.prompt_feedback):
                    return {'error': 'Gemini API Error', 'message': raw_text, 'raw': raw_text}

                json_str = raw_text.strip().lstrip('```json').rstrip('```').strip()
                data = json.loads(json_str) if json_str else {}
                return {'fields': data, 'raw': f"--- CUSTOM PROMPT SECTION ---\n{raw_text}"}
            except json.JSONDecodeError as e:
                return {'error': 'JSON Parsing Error', 'message': f"Failed to parse Gemini response: {e}. Raw response: {raw_text}", 'raw': raw_text}
            except Exception as e:
                return {'error': 'Processing Error', 'message': f"An unexpected error occurred during custom prompt extraction: {e}", 'raw': raw_text}
        async def process_category(category_name, fields_list):
            complex_field_instructions = (
                "For fields containing 'did did not', the value should be a JSON object like {'choice': 'did' or 'did not', 'comment': 'extracted text'}. "
                "For Yes/No questions, if the answer is 'Yes' and there is associated text, the value should be a JSON object like {'choice': 'Yes', 'comment': 'extracted text'}. "
                "If a checkbox is marked, treat it as 'Yes'. "
                "For monetary values, extract only the numeric value without currency symbols or commas (e.g., '1,250,000' should be '1250000'). "
                "For date fields like 'as of', extract the date in 'MM/DD/YYYY' format. "
                "For 'FHA Case No.', extract the value in '000-00000000' format. "
                "For the \"Neighborhood\" section, when the \"Other\" land use percentage is greater than 0, find the corresponding text field or comment that describes what this \"other\" land use is, and extract its value for the field \"Present Land Use for other\"."
            )
            
            base_prompt = (
                "From the provided appraisal report, extract the values for the fields listed below. "
                "Your response must be a single, clean JSON object with the field names as keys and their extracted values. "
                "Pay close attention to the complex field instructions. "
                "Do not include any introductory text, explanations, or markdown formatting like ```json. "
                "The field names in the JSON must exactly match the list provided. "
                "If a field's value is not found, use an empty string ''. "
                "Ensure all string values are properly escaped and the JSON is valid."
            )

            final_prompt = f"{base_prompt}{complex_field_instructions} Fields for {category_name}: {fields_list}."

            response = await model.generate_content_async(contents=[sample_file_part, final_prompt])
            if _check_for_api_error_message(response.text, response.prompt_feedback):
                return category_name, {'api_error': True, 'message': response.text, 'raw': response.text}

            return category_name, response

        async def process_sales_grid():
            sales_grid_prompt = (
                "Extract data from the 'SALES COMPARISON APPROACH' grid for the 'Subject' and all 'Comparable Sale' columns. "
                "Return a single, clean JSON object structured as: { 'Subject': { ...fields... }, 'COMPARABLE SALE #1': { ...fields... }, ... }. "
                "Do not add any text or markdown outside the JSON. If a value is missing, use an empty string ''. "
                "Many fields have a corresponding adjustment value, which is often located in a row directly below the primary value. "
                "For example, 'Location' has a 'Location Adjustment'. Ensure you capture both correctly. "
                "The field names in the JSON must exactly match the list provided. "
                f"Fields to extract for each column: {SalesGridFIELDS2}."
            )
            response = await model.generate_content_async(contents=[sample_file_part, sales_grid_prompt])
            if _check_for_api_error_message(response.text, response.prompt_feedback):
                return "SALES_GRID", {'api_error': True, 'message': response.text, 'raw': response.text}
            return "SALES_GRID", response

        async def process_rent_schedule_grid():
            rent_schedule_prompt = (
                "Extract data from the 'COMPARABLE RENT SCHEDULE' grid for the 'Subject' and all 'Comparable Rent' columns. "
                "Return a single, clean JSON object structured as: { 'Subject': { ...fields... }, 'COMPARABLE RENT #1': { ...fields... }, ... }. "
                "Do not add any text or markdown outside the JSON. If a value is missing, use an empty string ''. "
                "Some fields may have adjustment values (e.g., 'Rent', 'Concessions'). Ensure you capture these if present. "
                "The field names in the JSON must exactly match the list provided. "
                f"Fields to extract for each column: {RentSchedulesFIELDS2}."
            )
            response = await model.generate_content_async(contents=[sample_file_part, rent_schedule_prompt])
            if _check_for_api_error_message(response.text, response.prompt_feedback):
                return "RENT_SCHEDULE_GRID", {'api_error': True, 'message': response.text, 'raw': response.text}
            return "RENT_SCHEDULE_GRID", response

        field_categories = {
            "SUBJECT": SUBJECT_FIELDS, "CONTRACT": CONTRACT_FIELDS, "NEIGHBORHOOD": NEIGHBORHOOD_FIELDS,
            "SITE": SITE_FIELDS, "IMPROVEMENTS": IMPROVEMENTS_FIELDS, "RECONCILIATION": RECONCILIATION_FIELDS,
            "COST_APPROACH": COST_APPROACH_FIELDS, "INCOME_APPROACH": INCOME_APPROACH_FIELDS,
            "RENT_SCHEDULE_RECONCILIATION": RENT_SCHEDULE_RECONCILIATION_FIELDS, "PUD_INFO": PUD_INFO_FIELDS,
            "CERTIFICATION": CERTIFICATION_FIELDS, "ADDENDUM": ADDENDUM_FIELDS, "SALES_TRANSFER": SALES_TRANSFER_FIELDS,
            "UNIFORM_REPORT": UNIFORM_REPORT_FIELDS, "APPRAISAL_ID": APPRAISAL_ID_FIELDS, "MARKET_CONDITIONS": MARKET_CONDITIONS_FIELDS, "INFO_OF_SALES": INFO_OF_SALES_FIELDS,
            "CONDO": CONDO_FIELDS, "IMAGE_ANALYSIS": IMAGE_FIELDS,
            "PRIOR_SALE_HISTORY": PRIOR_SALE_HISTORY_FIELDS, "PROJECT_SITE": Project_SITE_FIELDS, "PROJECT_INFO": Project_Info_FIELDS,
            "CONDO_FORECLOSURE": CONDO_FORECLOSURE_FIELDS, "PRIOR_SALE_HISTORY": PRIOR_SALE_HISTORY_FIELDS, "PROJECT_SITE": Project_SITE_FIELDS, "PROJECT_INFO": Project_Info_FIELDS,
            "PROJECT_ANALYSIS": Project_Analysis_FIELDS, "UNIT_DESCRIPTIONS": UNIT_DESCRIPTIONS_FIELDS,
            "DATA_CONSISTENCY": DATA_CONSISTENCY_FIELDS
        }

        if category:
            categories_to_process = [category.upper()]
        else:
            categories_to_process = FORM_TYPE_CATEGORIES.get(form_type, DEFAULT_CATEGORIES)

        import asyncio
        tasks = []
        for category_name in categories_to_process:
            if category_name == "SALES_GRID":
                tasks.append(process_sales_grid())
            elif category_name == "RENT_SCHEDULE_GRID":
                tasks.append(process_rent_schedule_grid())
            elif category_name in field_categories:
                tasks.append(process_category(category_name, field_categories[category_name]))

        results = []
        chunk_size = 5
        for i in range(0, len(tasks), chunk_size):
            chunk = tasks[i:i + chunk_size]
            chunk_results = await asyncio.gather(*chunk)
            results.extend(chunk_results)
             
            if i + chunk_size < len(tasks):
                print(f"Processed chunk {i//chunk_size + 1}, waiting before next batch...")
                await asyncio.sleep(10)
        
        # Handle results from parallel tasks
        for category_name, response in results:
            if isinstance(response, dict) and response.get('api_error'):
                # This is an API error already detected in the async helper
                combined_result[category_name] = response
                raw_responses.append(f"--- {category_name} SECTION (API ERROR) ---\n{response['raw']}")
                continue
            try:
                raw_text = response.text
            except ValueError:
                    # This block handles cases where response.text itself fails,
                    # typically due to content being blocked by safety filters.
                    # In such cases, response.text raises a ValueError.
                    # The prompt_feedback should contain the reason.

                # Handle cases where the response is blocked (e.g., for safety reasons)
                reason = "Unknown"
                if response.prompt_feedback.block_reason:
                    reason = response.prompt_feedback.block_reason.name
                raw_text = f"Response blocked for '{category_name}'. Reason: {reason}"
                combined_result[category_name] = {'api_error': True, 'message': raw_text, 'raw': raw_text}
                raw_responses.append(f"--- {category_name} SECTION (API ERROR) ---\n{raw_text}")
                continue
            if _check_for_api_error_message(raw_text, response.prompt_feedback):
                combined_result[category_name] = {'api_error': True, 'message': raw_text, 'raw': raw_text}
                raw_responses.append(f"--- {category_name} SECTION (API ERROR) ---\n{raw_text}")
                continue
            if category_name == "SALES_GRID": # Original logic for raw_responses
                section_header = "SALES GRID"
            elif category_name == "RENT_SCHEDULE_GRID":
                section_header = "RENT SCHEDULE GRID"
            else: 
                section_header = category_name
            # Truncate raw_text for debugging output to prevent RecursionError on very long strings
            # The RecursionError is likely due to FastAPI's jsonable_encoder processing a very large string in the 'raw' field.
            truncated_raw_text = (raw_text[:2000] + '...' if len(raw_text) > 2000 else raw_text)
            raw_responses.append(f"--- {section_header} SECTION ---\n{truncated_raw_text}")

            json_str = raw_text.strip().lstrip('```json').rstrip('```').strip()
            parsed_data = {}
            try:
                # Attempt to fix common LLM JSON issues before parsing
                # This heuristic specifically targets unquoted keys that might contain spaces
                # and are followed by a colon, or single-quoted keys/values.
                # It's a best-effort attempt as LLM output can be unpredictable.
                # The reported error `{"Inventory Analysis Total # of Comparable Sales (Settled)': {`
                # suggests an unquoted key ending with a single quote.
                # This regex tries to wrap such keys in double quotes.
                fixed_json_str = re.sub(r"([{,]\s*)([a-zA-Z0-9_ #\-\(\)\/\%\.]+?)(':)", r'\1"\2"\3', json_str)
                # Also, replace single quotes used as string delimiters with double quotes
                # This is still risky if apostrophes are present in valid strings.
                # A more robust solution would involve a dedicated lenient JSON parser like `json5` or `hjson`.
                # For now, let's try a simpler fix for the reported error.
                # The original `replace("'\"", "\"")` was not sufficient.
                # Let's try to parse directly and catch the error.

                parsed_data = json.loads(json_str)

                for key, value in parsed_data.items():
                    if isinstance(value, bool):
                        parsed_data[key] = "Yes" if value else "No"

                for field, value in parsed_data.items():
                    if isinstance(value, dict) and 'choice' in value and 'did did not' in field.lower():
                        parsed_data[field] = f"I {value.get('choice', '')} . {value.get('comment', '')}".strip()
                    elif isinstance(value, dict) and 'choice' in value and value.get('comment'):
                        # Handle Yes/No with comments
                        parsed_data[field] = f"{value.get('choice', '')}: {value.get('comment', '')}".strip()

                if category_name in ["SALES_GRID", "RENT_SCHEDULE_GRID"]:
                    if "Subject" in parsed_data:
                        if "Subject" not in combined_result:
                            combined_result["Subject"] = {}
                        combined_result["Subject"].update(parsed_data["Subject"])
                        del parsed_data["Subject"]
                    combined_result.update(parsed_data)
                else:
                    combined_result.update(parsed_data)

                if category_name not in ["SALES_GRID", "RENT_SCHEDULE_GRID"]:
                    if 'api_error' not in combined_result.get(category_name, {}):
                        combined_result.setdefault(category_name, {}).update(parsed_data)

            except json.JSONDecodeError as e:
                # Store JSON decode error for this category to prevent RecursionError later
                error_message = f"JSON Parsing Error for {category_name}: {e}. Raw response snippet: {json_str[:500]}..."
                print(error_message)
                combined_result[category_name] = {'error': 'JSON Parsing Failed', 'message': error_message, 'raw_snippet': json_str[:500]}
            except Exception as e:
                # Catch any other unexpected errors during data processing
                error_message = f"An unexpected error occurred during data processing for {category_name}: {e}. Raw response snippet: {json_str[:500]}..."
                print(error_message)
                combined_result[category_name] = {'error': 'Processing Error', 'message': error_message, 'raw_snippet': json_str[:500]}

    except google_exceptions.ResourceExhausted as e:
        print(f"Gemini API Quota Exceeded: {e}")
        
        # Return a top-level error for the entire extraction process
        return {'error': 'Gemini API Quota Exceeded', 'message': f"API quota exceeded. Please check your plan and billing details. Original error: {e}"}
    except Exception as e:
        # Catch any other top-level exceptions during the overall extraction process
        print(f"Error during overall document extraction: {e}")
        return {'error': 'Extraction Failed', 'message': f"An unexpected error occurred during document extraction: {e}"}

    except Exception as e:
        print(f"Error parsing JSON from Gemini: {e}")
         
        return {'fields': combined_result, 'raw': "\n\n".join(raw_responses)}

    return {'fields': combined_result, 'raw': "\n\n".join(raw_responses)}

 
def get_sales_comparison_data(extracted_data):
     
    return {
        "table_data": {},
        "research_data": {},
        "additional_data": {}
    }

async def compare_documents(original_path: str, revised_path: str, revision_request: str = None) -> dict:
    """
    Compares two documents (PDFs) and identifies differences using a generative model.
    """
    try:
        with open(original_path, "rb") as f:
            original_bytes = f.read()
        with open(revised_path, "rb") as f:
            revised_bytes = f.read()

        # Get page counts
        old_pdf_reader = PdfReader(original_path)
        new_pdf_reader = PdfReader(revised_path)
        old_pdf_page_count = len(old_pdf_reader.pages)
        new_pdf_page_count = len(new_pdf_reader.pages)

        original_file_part = {"mime_type": "application/pdf", "data": original_bytes}
        revised_file_part = {"mime_type": "application/pdf", "data": revised_bytes}

        model = genai.GenerativeModel(model_name="gemini-2.5-flash")

        if revision_request:
            # Use a more structured prompt when a specific revision_request is given
            prompt = textwrap.dedent(f"""\
                You are an expert appraisal reviewer. You are given an 'Original PDF', a 'Revised PDF', and a 'Checklist' of items to verify.
                Your task is to meticulously follow the instructions in the 'Checklist' and analyze both documents to answer each point.

                Checklist:
                ---
                {revision_request}
                ---

                Your response must be a single, clean JSON object as specified in the checklist instructions.

                Do not include any introductory text, explanations, or markdown formatting like ```json.
            """)
        else:
            # Fallback to the generic comparison prompt if no revision_request is provided
            prompt = textwrap.dedent("""
                You are an expert appraisal reviewer. Compare the two provided appraisal documents: an 'Original' and a 'Revised' version.
                Identify all fields that have different values. Your response must be a single, clean JSON object with two keys: 'summary' and 'comparison_summary'.
                The 'summary' value should be a concise, 3-4 line summary of the key changes found.
                The 'comparison_summary' value must be an array of objects, where each object represents a single changed field and has the following keys: 'field', 'original_value', 'revised_value', 'page_no', and 'comment'.
                Do not include any introductory text, explanations, or markdown formatting like ```json.
            """)

        # Optimized prompt to get market values from both PDFs in one call.
        market_value_prompt = textwrap.dedent("""
            From the 'Original PDF' and the 'Revised PDF', extract only the "opinion of the market value, as defined, of the real property that is the subject of this report is $" from the RECONCILIATION section of each document.
            Your response must be a single, clean JSON object with two keys: 'old_market_value' and 'new_market_value'.
            Example: { "old_market_value": "123000", "new_market_value": "125000" }.
            Do not include any introductory text, explanations, or markdown formatting like ```json.
        """)

        # We now run only two API calls in parallel: one for the main comparison and one for the market values.
        print("Starting comparison task...")
        comparison_task = model.generate_content_async(contents=[prompt, original_file_part, revised_file_part])

        print("Starting market value extraction task...")
        market_value_task = model.generate_content_async(contents=[market_value_prompt, original_file_part, revised_file_part])

        # Run all three tasks concurrently
        results = await asyncio.gather(
            comparison_task,
            market_value_task
        )
        comparison_response, market_value_response = results

        # Handle comparison_response first
        raw_comparison_text = comparison_response.text
        if _check_for_api_error_message(raw_comparison_text, comparison_response.prompt_feedback):
            return {'error': 'Gemini API Error', 'message': raw_comparison_text, 'raw': raw_comparison_text}

        # If a specific revision_request (like the checklist) is provided, we expect a specific JSON structure.
        if revision_request:
            json_str = raw_comparison_text.strip().lstrip('```json').rstrip('```').strip()
            return json.loads(json_str) if json_str else {}

        # Handle market_value_response
        raw_market_value_text = market_value_response.text
        if _check_for_api_error_message(raw_market_value_text, market_value_response.prompt_feedback):
            return {'error': 'Gemini API Error', 'message': f"Failed to extract market values: {raw_market_value_text}", 'raw': raw_market_value_text}

        try:
            comparison_json = json.loads(raw_comparison_text.strip().lstrip('```json').rstrip('```').strip()) if raw_comparison_text else {"comparison_summary": []}
            market_value_json = json.loads(raw_market_value_text.strip().lstrip('```json').rstrip('```').strip()) if raw_market_value_text else {}
        except json.JSONDecodeError as e:
            return {'error': 'JSON Parsing Error', 'message': f"Failed to parse Gemini comparison response: {e}. Raw response: {raw_comparison_text}", 'raw': raw_comparison_text}
        except Exception as e:
            return {'error': 'Processing Error', 'message': f"An unexpected error occurred during comparison processing: {e}. Raw response: {raw_comparison_text}", 'raw': raw_comparison_text}

        # Combine all results into a single response object
        # The market values are now part of the main response object.
        comparison_json['old_market_value'] = market_value_json.get('old_market_value', 'Not Found')
        comparison_json['new_market_value'] = market_value_json.get('new_market_value', 'Not Found')
        comparison_json['old_pdf_page_count'] = old_pdf_page_count
        comparison_json['new_pdf_page_count'] = new_pdf_page_count

        return comparison_json

    except google_exceptions.ResourceExhausted as e:
        raise Exception(f"API quota exceeded. Please check your plan and billing details. Original error: {e}")
    except Exception as e:
        print(f"Error during document comparison: {e}")
        raise

def extract_fields_from_html(html_content: str, fields_to_extract: list[str]) -> dict:
    """
    Extracts specified fields from HTML content using a primary (Gemini) and fallback (parsing) strategy.
    """
    data = {}
    field_map = {field.lower(): field for field in fields_to_extract}

    # Strategy 1: Use Gemini for robust extraction
    try:
        model = genai.GenerativeModel(model_name="gemini-2.5-flash")
        prompt = (
            f"Extract the following fields from this HTML content: {', '.join(fields_to_extract)}. "
            "The HTML might be poorly structured. Find the most likely value for each field. "
            "Return a single, clean JSON object where keys are the field names and values are the extracted text. "
            "If a field is not found, use an empty string. Do not include markdown formatting."
        )
        response = model.generate_content([prompt, html_content])
        json_str = response.text.strip().lstrip('```json').rstrip('```').strip()
        data = json.loads(json_str)
        # Ensure all requested fields are in the dictionary, even if empty
        for field in fields_to_extract:
            if field not in data:
                data[field] = ""
        return data
    except Exception as e:
        print(f"HTML extraction with Gemini failed, falling back to parsing. Error: {e}")
        # If Gemini fails, clear data and proceed to fallback
        data = {}

    # Strategy 2 (Fallback): Use BeautifulSoup for parsing if Gemini fails
    soup = BeautifulSoup(html_content, 'lxml')

    # Sub-strategy 2a: Find elements containing the exact field name and look for the value in subsequent elements.
    for field_lower, field_original in field_map.items():
        if field_original in data and data[field_original]: continue

        # Specific logic for 'Appraisal Type' which is often in a span with a specific ID
        if field_original == 'Appraisal Type':
            appraisal_type_span = soup.find('span', id='AppraisalType')
            if appraisal_type_span and appraisal_type_span.get_text(strip=True):
                data[field_original] = appraisal_type_span.get_text(strip=True)
                continue

        # Handle <select> elements specifically to get the selected option
        select_element = soup.find('select', attrs={'name': re.compile(field_lower, re.IGNORECASE)})
        if select_element:
            # Strategy 1: Find the option with the 'selected' attribute.
            selected_option = select_element.find('option', selected=True)
            if selected_option and selected_option.get_text(strip=True) and selected_option.get_text(strip=True) != '-- Select One --':
                data[field_original] = selected_option.get_text(strip=True)
                continue

            # Strategy 2: If no 'selected' attribute, check the value of the <select> tag itself.
            # Some frameworks set the value of the select tag to the value of the selected option.
            select_value = select_element.get('value')
            if select_value:
                option_by_value = select_element.find('option', attrs={'value': select_value})
                if option_by_value and option_by_value.get_text(strip=True):
                    data[field_original] = option_by_value.get_text(strip=True)
                    continue

        label_elements = soup.find_all(
            lambda tag: tag.name in ['div', 'td', 'th', 'span', 'b', 'strong'] and
                        tag.get_text(strip=True).lower().rstrip(':') == field_lower
        )
        for label_element in label_elements:
            next_element = label_element.find_next(['div', 'td', 'th', 'span', 'dd'])
            if next_element and next_element.get_text(strip=True):
                value_text = next_element.get_text(strip=True)
                if value_text.lower() not in field_map:
                    data[field_original] = value_text
                    break
        if field_original in data and data[field_original]: continue

    # Sub-strategy 2b (Fallback): Handle plain text line-by-line format for any remaining fields.
    remaining_fields = {f.lower(): f for f in fields_to_extract if f not in data or not data[f]}
    if remaining_fields:
        lines = [line.strip() for line in soup.get_text().splitlines() if line.strip()]
        for i, line in enumerate(lines):
            line_lower = line.lower().rstrip(':')
            if line_lower in remaining_fields and i + 1 < len(lines):
                original_field_name = remaining_fields[line_lower]
                next_line = lines[i + 1]
                # Ensure the next line isn't another field name before assigning it as a value
                if next_line.lower().rstrip(':') not in remaining_fields:
                    data[original_field_name] = next_line

    return data