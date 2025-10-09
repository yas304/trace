import React, { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

// *****************************************************************
// *** CRITICAL CHANGE FOR RENDER DEPLOYMENT ***
// This constant reads the VITE_API_URL environment variable 
// set on Render. It falls back to localhost for local development.
// *****************************************************************
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'; 

function App() {
  const [mode, setMode] = useState('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  const analyzeImage = async (imageFile) => {
    setIsLoading(true);
    setResult(null);
    setError('');
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      // *****************************************************************
      // *** API CALL MODIFIED TO USE API_BASE_URL ***
      // *****************************************************************
      const response = await axios.post(`${API_BASE_URL}/api/check-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (err) {
      setError('Analysis failed. The server may be down.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
      setError('');
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  const handleUploadSubmit = () => {
    if (file) {
      analyzeImage(file);
    }
  };

  const removeImage = () => {
    setFile(null);
    setImagePreview(null);
    setResult(null);
    setError('');
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setIsCameraOn(true);
      setError('');
      setResult(null);
    } catch (err) {
      setError('Could not access the webcam. Please ensure permissions are granted.');
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    videoRef.current.srcObject = null;
    setStream(null);
    setIsCameraOn(false);
    removeImage(); // Clear any previous capture
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      // Mirror the canvas context to match the video feed view
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        const capturedFile = new File([blob], 'captured_image.png', { type: 'image/png' });
        setFile(capturedFile);
        setImagePreview(URL.createObjectURL(capturedFile));
        analyzeImage(capturedFile);
      }, 'image/png');
    }
  };

  useEffect(() => {
    // Cleanup function to stop camera when component unmounts or mode changes
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const renderResultCard = () => {
    if (!result) return null;

    if (result.match) {
      const data = result.data;
      return (
        <div className="result-card success">
          <p><strong>MATCH FOUND:</strong> {data.name}</p>
          <p>Status: {data.status}</p>
          <p>Last Seen: {data.last_seen_location}</p>
        </div>
      );
    } else {
      return (
        <div className="result-card no-match">
          <p>{result.message || 'No match found in the database.'}</p>
        </div>
      );
    }
  };

  const switchMode = (newMode) => {
    if (isCameraOn) {
      stopCamera();
    }
    setMode(newMode);
    removeImage();
  };

  return (
    <div className="app-container">
      <div className="card-wrapper">
        <header className="card-header">
          <h1>TraceOn AI</h1>
          <p className="subtitle">Facial Recognition Analysis Engine</p>
        </header>

        <nav className="mode-selector">
          <button 
            className={`mode-btn ${mode === 'upload' ? 'active' : ''}`}
            onClick={() => switchMode('upload')}
          >
            Upload Image
          </button>
          <button 
            className={`mode-btn ${mode === 'webcam' ? 'active' : ''}`}
            onClick={() => switchMode('webcam')}
          >
            Webcam Capture
          </button>
        </nav>

        <main className="card-main">
          {mode === 'upload' && (
            <>
              {!file ? (
                <div {...getRootProps()} className={`dropzone ${isDragActive ? 'drag-active' : ''}`}>
                  <input {...getInputProps()} />
                  {isDragActive ? 
                    <p>Drop the file here ...</p> : 
                    <p>Drag 'n' drop an image here, or click to select file</p>
                  }
                </div>
              ) : (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <button onClick={removeImage} className="remove-btn" title="Remove">×</button>
                </div>
              )}
              <button onClick={handleUploadSubmit} disabled={isLoading || !file} className="submit-btn">{isLoading ? 'Analyzing...' : 'Find Match'}</button>
            </>
          )}

          {mode === 'webcam' && (
            <div className="webcam-container">
              {!isCameraOn ? (
                <button onClick={startCamera} className="submit-btn">Start Camera</button>
              ) : (
                <>
                  <div className="video-wrapper"><video ref={videoRef} autoPlay playsInline className="video-feed" /></div>
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <div className="webcam-controls">
                    <button onClick={handleCapture} disabled={isLoading} className="submit-btn">{isLoading ? 'Analyzing...' : 'Capture & Analyze'}</button>
                    <button onClick={stopCamera} className="stop-btn">Stop Camera</button>
                  </div>
                </>
              )}
            </div>
          )}
        </main>

        {(isLoading || error || result) && (
          <footer className="card-footer">
            {isLoading && <div className="spinner"></div>}
            {error && <div className="result-card error">{error}</div>}
            {renderResultCard()}
          </footer>
        )}
      </div>
    </div>
  );
}

export default App;