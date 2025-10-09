# backend/main.py

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from matcher import find_match

# This is the line the error was on. The import above fixes it.
app = FastAPI(title="TraceOn AI Engine")

# --- CORS Configuration ---
origins = [
    "http://localhost:5173",  # Default for React Vite dev server
    "http://localhost:3000",  # Default for Create React App
# backend/main.py

# ... inside the CORS Configuration section
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    # Placeholder: Use a name you plan to use for the frontend
    "https://traceon-frontend.onrender.com", 
]


]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
# Ensure the directory for temporary uploads exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"status": "TraceOn AI Engine is running."}

@app.post("/api/check-image")
async def check_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type.")
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    try:
        # Save the uploaded file temporarily
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Run the AI matching logic on the saved file
        result = find_match(file_path)
        
    finally:
        # Clean up by deleting the temporary file
        if os.path.exists(file_path):
            os.remove(file_path)
    
    return result