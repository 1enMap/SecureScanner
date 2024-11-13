# File Scanner Backend

This is the backend server for the file scanning application. It uses FastAPI to provide a REST API for file scanning services.

## Setup Instructions

1. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the server:
```bash
python main.py
```

The server will run on http://localhost:8000

## API Endpoints

- `POST /scan` - Upload a file for scanning
- `GET /scan/{scan_id}` - Get scan results for a specific scan

## Features

- File upload handling
- YARA rules integration for pattern matching
- MIME type detection
- SQLite database for scan results
- CORS support for frontend integration