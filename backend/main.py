from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import aiofiles
import os
import uuid
from scanner.file_analyzer import FileAnalyzer
from scanner.db import ScanDatabase

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

file_analyzer = FileAnalyzer()
scan_db = ScanDatabase()

@app.on_event("startup")
async def startup_event():
    await scan_db.init_db()

@app.post("/scan")
async def scan_file(file: UploadFile):
    try:
        scan_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_DIR, f"{scan_id}_{file.filename}")
        
        # Save uploaded file
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)
        
        # Create scan record
        await scan_db.create_scan(scan_id, file.filename)
        
        try:
            # Analyze file
            results = file_analyzer.analyze_file(file_path)
            await scan_db.update_scan_results(scan_id, results)
        finally:
            # Clean up
            if os.path.exists(file_path):
                os.remove(file_path)
        
        return {
            "scan_id": scan_id,
            "status": "accepted",
            "message": "File scan completed"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scan/{scan_id}")
async def get_scan_status(scan_id: str):
    result = await scan_db.get_scan_results(scan_id)
    if not result:
        raise HTTPException(status_code=404, detail="Scan not found")
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)