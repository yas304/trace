TraceOn AI - AI-Powered Missing Person Identification

TraceOn AI is a full-stack web application designed to help identify missing persons using facial recognition.

Features

Frontend (React + Vite):
Dual Mode Interface:Easily switch between "Upload Photo" and "Live Cam" modes.
Drag-and-Drop Uploader: A user-friendly file uploader with image preview.
Live Webcam Capture:Access the user's webcam, capture a frame, and send it for analysis.
Real-time Feedback:Displays loading spinners during analysis and clear success, no-match, or error messages.
Responsive Design: A clean, modern UI that works on different screen sizes.

Backend (Python + FastAPI):
FastAPI Framework: A high-performance, modern Python web framework.
Face Recognition Engine:Utilizes the `face_recognition` library to encode faces and find matches.
RESTful API:A simple `/api/check-image` endpoint to handle image uploads and return analysis results.
Mock Database:A simple Python-based mock database for storing and retrieving known face encodings.
Encoding Utility: Includes a script (`generate_encodings.py`) to process images of known individuals and populate the database.


 Tech Stack
Frontend:React, Vite, Axios, React Dropzone
Backend: Python, FastAPI, Uvicorn, face_Recogniition



