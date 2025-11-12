import os

os.environ["GRPC_VERBOSITY"] = "ERROR"

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pdf_extractor import ( 
    extract_fields_from_pdf,
    extract_fields_from_html,
    compare_documents
)
import tempfile
import traceback

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/extract-by-category")
async def extract_by_category(file: UploadFile = File(...), form_type: str = Form(...), category: str = Form(None)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        # This function from pdf_extractor.py contains the long-running Gemini calls
        data = await extract_fields_from_pdf(tmp_path, form_type, category=category, custom_prompt=None)
        if data.get('error'):
            raise HTTPException(status_code=500, detail=data['message'])

        return data
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass

@app.post("/extract")
async def extract(file: UploadFile = File(...), form_type: str = Form(...), category: str = Form(None), comment: str = Form(None)):
    # Accommodate custom prompts from components like response.js and CustomQuery.js
    custom_prompt = comment

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    try:
        # If a comment is provided, treat it as a custom prompt and ignore the category.
        if comment:
            data = await extract_fields_from_pdf(tmp_path, form_type=form_type, custom_prompt=comment)
        else:
            data = await extract_fields_from_pdf(tmp_path, form_type=form_type, category=category)
        if data.get('error'):
            raise HTTPException(status_code=500, detail=data['message'])
        return data
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass


@app.post("/compare")
async def compare(
    pdf_file: UploadFile = File(...),
    html_file: UploadFile = File(...)
):
    if not pdf_file or not html_file:
        raise HTTPException(status_code=400, detail="Both PDF and HTML files must be provided.")

    if not pdf_file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="The first file must be a PDF.")
    if not html_file.filename.lower().endswith('.html'):
        raise HTTPException(status_code=400, detail="The second file must be an HTML file.")

    fields_to_compare = [
        'Client Name','Client Address', 'Transaction Type', 'FHA Case Number','Borrower (and Co-Borrower)',
        'Property Address', 'Property County', 'Property Type','Assigned to Vendor(s)','AMC Reg. Number','Appraisal Type','Unit Number','UAD XML Report'
    ]

    pdf_tmp_path = ""
    html_content = ""
    try:
        # Process PDF file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_pdf:
            content = await pdf_file.read()
            tmp_pdf.write(content)
            pdf_tmp_path = tmp_pdf.name

        # Process HTML file
        html_content_bytes = await html_file.read()
        html_content = html_content_bytes.decode('utf-8')

        # Extract data from both files
        pdf_prompt = (
            f"Analyze the provided appraisal report and extract the values for the following fields: {', '.join(fields_to_compare)}. "
            "Your response must be a single, clean JSON object. "
            "Each key in the JSON should be the field name, and its value must be another JSON object with two keys: 'value' (the extracted text or finding) and 'page_no' (the page number where the information was found). "
            "Example: { \"Field Name\": { \"value\": \"Extracted Value\", \"page_no\": 5 } }. "
            "For monetary values, extract only the numeric value without currency symbols or commas. "
            "For checkboxes, use 'Yes' or 'No'. "
            "If a field's value is not found, use an empty string 'N/A' for the 'value' and null for 'page_no'."
            "Assigned to Vendor(s) for this field in the  APPRAISER Name and in Html file Assigned to Vendor(s) "
            "Appraisal Type in Html file such as e.g Appraisal Type '1004 Conventional1004 Single Family' and in pdf field  Appraisal Type "
        )
        pdf_data_response = await extract_fields_from_pdf(pdf_tmp_path, form_type="1004", custom_prompt=pdf_prompt)
        pdf_data = pdf_data_response.get('fields', {})

        html_data = extract_fields_from_html(html_content, fields_to_compare)

        # Compare the data and build the response
        comparison_results = []
        for field in fields_to_compare:
            # PDF data might be nested under a 'value' key from the custom prompt response
            pdf_field_data = pdf_data.get(field, {})
            pdf_value = (pdf_field_data.get('value') if isinstance(pdf_field_data, dict) else pdf_field_data) or "N/A"
            
            html_value = html_data.get(field) or "N/A"

            # Normalize empty strings to "N/A"
            if not str(pdf_value).strip(): pdf_value = "N/A"
            if not str(html_value).strip(): html_value = "N/A"
            # Simple string comparison
            status = 'Match' if str(pdf_value).strip() == str(html_value).strip() else 'Mismatch'

            comparison_results.append({
                "field": field,
                "html_value": html_value,
                "pdf_value": pdf_value,
                "status": status
            })

        return {"comparison_results": comparison_results}

    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        if pdf_tmp_path and os.path.exists(pdf_tmp_path):
            os.remove(pdf_tmp_path)

@app.post("/compare-pdfs")
async def compare_pdfs(
    old_pdf_file: UploadFile = File(...),
    new_pdf_file: UploadFile = File(...),
    revision_request: str = Form(None) # Accept the checklist prompt
):
    if not old_pdf_file or not new_pdf_file:
        raise HTTPException(status_code=400, detail="Both old and new PDF files must be provided.")

    old_tmp_path = ""
    new_tmp_path = ""
    try:
        # Process old PDF file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_old:
            content = await old_pdf_file.read()
            tmp_old.write(content)
            old_tmp_path = tmp_old.name

        # Process new PDF file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_new:
            content = await new_pdf_file.read()
            tmp_new.write(content)
            new_tmp_path = tmp_new.name

        # This function from pdf_extractor.py contains the long-running Gemini calls
        # Pass the revision_request to compare_documents
        data = await compare_documents(old_tmp_path, new_tmp_path, revision_request=revision_request)
        if data.get('error'):
            raise HTTPException(status_code=500, detail=data['message'])

        return data
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        if old_tmp_path and os.path.exists(old_tmp_path):
            os.remove(old_tmp_path)
        if new_tmp_path and os.path.exists(new_tmp_path):
            os.remove(new_tmp_path)

@app.post("/verify-revision")
async def verify_revision(
    file: UploadFile = File(...),
    revision_request: str = Form(...),
    form_type: str = Form("1004") # Default to 1004 as in frontend
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    tmp_path = ""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Use the revision_request as a custom prompt for extraction
        # This instructs Gemini to analyze the PDF based on the specific requests.
        custom_prompt = (
            f"You are an expert appraisal reviewer. Your task is to verify if the provided appraisal PDF has been corrected based on the following checklist. "
            f"For each item in the checklist, determine if it has been addressed in the PDF. "
            f"Checklist:\n---\n{revision_request}\n---\n"
            "Your response must be a single, clean JSON object with two keys: 'summary' and 'comparison_summary'. "
            "The 'summary' value should be a very concise, 1-2 line summary of your overall findings. "
            "The 'comparison_summary' value must be an array of objects, where each object represents a checklist item and has the keys: 'status' ('Corrected', 'Not Corrected', or 'N/A'), 'section' (the relevant section in the report), and 'comment' (your brief, one-sentence analysis and findings for that item). "
            "Do not include any introductory text, explanations, or markdown formatting like ```json."
        )

        data = await extract_fields_from_pdf(tmp_path, form_type, custom_prompt=custom_prompt)
        
        if data.get('error'):
            raise HTTPException(status_code=500, detail=data.get('message', 'An error occurred during verification.'))
        
        return data
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

@app.post("/extract-from-html")
async def extract_from_html(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    if not file.filename.lower().endswith('.html'):
        raise HTTPException(status_code=400, detail="Only HTML files are supported")

    fields_to_extract = [
        'Client Name','Client Address', 'Transaction Type', 'FHA Case Number','Borrower (and Co-Borrower)',
        'Property Address', 'Property County', 'Property Type','Assigned to Vendor(s)','AMC Reg. Number','Appraisal Type','Unit Number','UAD XML Report'
    ]

    try:
        html_content_bytes = await file.read()
        html_content = html_content_bytes.decode('utf-8')

        # This function from pdf_extractor.py can also handle HTML
        extracted_data = extract_fields_from_html(html_content, fields_to_extract)

        return {"extracted_data": extracted_data}
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
