import streamlit as st
import google.generativeai as genai
from PyPDF2 import PdfReader
import os

if "GEMINI_API_KEY" in os.environ:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])

st.title("PDF Extractor with Gemini")

uploaded_file = st.file_uploader("Upload a PDF file", type="pdf")
if uploaded_file is not None:
    reader = PdfReader(uploaded_file)
    numofpages = len(reader.pages)

    all_text_list = []

    for i in range(numofpages):
        page = reader.pages[i]
        text = page.extract_text()
        if text:
            all_text_list.append(text)

    st.subheader("Extracted Text")

    subbject_section =f"""please extract the 'Property Address',
        'City',
        'County',
        'State',
        'Zip Code',
        'Borrower',
        'Owner of Public Record',
        'Legal Description',
        "Assessor's Parcel #",
        'Tax Year',
        'R.E. Taxes $',
        'Neighborhood Name',
        'Map Reference',
        'Census Tract',
        'Occupant',
        'Special Assessments $',
        'PUD',
        'HOA $ per year',
        'HOA $ per month',
        'Property Rights Appraised',
        'Assignment Type',
        'Lender/Client',
        'Address (Lender/Client)',
        'Offered for Sale in Last 12 Months',
        'Report data source(s) used, offering price(s), and date(s)' from the text. Return as a JSON object."""
    
    Neighborhood_section =f""" please extract the Neighborhood Section
          "Location",
          "Built-Up",
          "Growth",
          "Property Values",
          "Demand/Supply",
          "Marketing Time",
          "One-Unit",
          "2-4 Unit",
          "Multi-Family",
          "Commercial",
          "Other",
          "one unit housing price(high,low,pred)",
          "one unit housing age(high,low,pred)",
          "Neighborhood Boundaries",
          "Neighborhood Description",
          "Market Conditions:" from the text. Return as a JSON object with exact values, not suggestions."""
    
    sales_grid =f""" please extract the sales comparision approach Section
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
              "Porch/Patio/Deck" from {all_text} but provide me exact values not suggestion text"""

    improvement_section =f""" please extract the improvement Section
          "Units", "# of Stories", "Type", "Existing/Proposed/Under Const.",
            "Design (Style)", "Year Built", "Effective Age (Yrs)", "Foundation Type",
            "Basement Area sq.ft.", "Basement Finish %", 
            "Evidence of Settlement",
            "Exterior Walls (Material/Condition)", "Roof Surface (Material/Condition)",
            "Gutters & Downspouts (Material/Condition)", "Window Type (Material/Condition)",
             "Storm Sash/Insulated", "Screens", "Floors (Material/Condition)", "Walls (Material/Condition)",
             "Trim/Finish (Material/Condition)", "Bath Floor (Material/Condition)", "Bath Wainscot (Material/Condition)",
             "Attic", "Heating Type", "Fuel", "Cooling Type",
             "Fireplace(s) #", "Patio/Deck", "Pool", "Woodstove(s) #", "Fence", "Porch", "Other Amenities",
             "Car Storage None", "Driveway # of Cars", "Driveway Surface", "Garage # of Cars", "Carport # of Cars",
             "Garage Att.", "Garage Det.", "Garage Built-in", "Appliances Refrigerator", "Appliances Range/Oven",
             "Appliances Dishwasher", "Appliances Disposal", "Appliances Microwave", "Appliances Washer/Dryer",
             "Appliances Other", "Finished area above grade Rooms", "Finished area above grade Bedrooms",
             "Finished area above grade Bath(s)", "Square Feet of Gross Living Area Above Grade",
             "Additional features", "Condition of the property",
             "Physical Deficiencies or Adverse Conditions",
             "Property Conforms to Neighborhood" from {all_text} but provide me exact values not suggestion text"""

    # Combine the list of text into a single string
    full_text = "\n".join(all_text_list)

    # Create a dictionary to hold the prompts
    prompts = {
        "Subject": subbject_section.format(all_text=full_text),
        "Neighborhood": Neighborhood_section.format(all_text=full_text),
        "Sales Grid": sales_grid.format(all_text=full_text),
        "Improvements": improvement_section.format(all_text=full_text)
    }

    # Add a select box to choose the section
    section_to_extract = st.selectbox("Choose a section to extract:", list(prompts.keys()))

    if st.button(f"Extract {section_to_extract} Section"):
        with st.spinner(f"Extracting {section_to_extract} data with Gemini..."):
            # Correctly instantiate the model and generate content
            model = genai.GenerativeModel(model_name="gemini-1.5-flash")
            response = model.generate_content(contents=prompts[section_to_extract])

            st.subheader("Extracted Output")
            st.text(response.text.replace('**', ''))