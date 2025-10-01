# File Upload Feature for AI Attorney

## Overview
The AI Attorney application now supports uploading PDF and DOC files directly during chat conversations. Users can upload documents and ask questions about their content using RAG (Retrieval-Augmented Generation).

## Features

### 1. File Upload During Chat
- Upload PDF, DOC, and DOCX files using the 📎 button in the chat interface
- Files are processed immediately and added to the conversation context
- Each conversation session maintains its own document context

### 2. Session-Based RAG
- Each chat session has a unique session ID
- Uploaded files are processed and added to a session-specific vector store
- Questions are answered using both the uploaded documents and the global knowledge base
- Sessions automatically clean up after 1 hour to prevent memory leaks

### 3. Supported File Types
- **PDF**: Uses PyPDFLoader
- **DOC**: Uses UnstructuredWordDocumentLoader  
- **DOCX**: Uses Docx2txtLoader

## Technical Implementation

### Backend Changes (`backend/api.py`)

#### New Endpoint Structure
```python
@app.post("/ask")
async def ask(
    question: str = Form(None),
    file: UploadFile = File(None),
    session_id: str = Form(None)
):
```

#### Key Features
- **Session Management**: Each conversation gets a unique session ID
- **File Processing**: Temporary files are created, processed, and cleaned up
- **Vector Store Merging**: Uploaded documents are merged with existing knowledge
- **Memory Management**: Automatic cleanup of old sessions

#### New Functions
- `process_uploaded_file()`: Handles file processing and vector store creation
- `cleanup_old_sessions()`: Removes sessions older than 1 hour

### Frontend Changes (`frontend/src/App.jsx`)

#### New State Management
- `sessionId`: Tracks the current conversation session
- Updated file upload handler to send files to `/ask` endpoint
- Session ID is maintained across messages in the same conversation

#### Updated UI
- File upload button (📎) now processes files during chat
- Welcome message includes instructions about file upload
- Upload status messages provide feedback to users

## Usage

### 1. Starting the Application
```bash
# Option 1: Use the startup script
python start_app.py

# Option 2: Manual startup
# Terminal 1 - Backend
cd backend
python -m uvicorn api:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Using File Upload
1. Open the chat interface
2. Click the 📎 button to upload a file
3. Select a PDF, DOC, or DOCX file
4. Wait for the upload confirmation
5. Ask questions about the uploaded document
6. The AI will answer using both the uploaded document and existing knowledge

### 3. Testing
```bash
# Run integration tests
python test_integration.py
```

## API Endpoints

### POST `/ask`
Handles both text questions and file uploads.

**Parameters:**
- `question` (optional): Text question to ask
- `file` (optional): File to upload (PDF, DOC, DOCX)
- `session_id` (optional): Session ID for conversation continuity

**Response:**
```json
{
  "answer": "Response text",
  "session_id": "unique-session-id"
}
```

## File Processing Flow

1. **Upload**: File is sent to `/ask` endpoint
2. **Temporary Storage**: File is saved to a temporary location
3. **Document Loading**: Appropriate loader is selected based on file type
4. **Text Splitting**: Document is split into chunks (1000 chars, 200 overlap)
5. **Embedding**: Chunks are converted to embeddings using OpenAI
6. **Vector Store**: FAISS vector store is created/updated
7. **Cleanup**: Temporary file is deleted
8. **Response**: Success message is returned to user

## Memory Management

- **Session Cleanup**: Sessions older than 1 hour are automatically removed
- **Temporary Files**: All temporary files are cleaned up after processing
- **Vector Store Merging**: New documents are merged with existing session context

## Error Handling

- **Unsupported File Types**: Clear error messages for unsupported formats
- **Upload Failures**: Detailed error messages for failed uploads
- **Processing Errors**: Graceful handling of document processing failures
- **Session Errors**: Fallback to global knowledge base if session issues occur

## Future Enhancements

- Support for more file types (TXT, RTF, etc.)
- File preview before upload
- Multiple file uploads per session
- File management interface
- Document search and filtering
- Export conversation with documents
