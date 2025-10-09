import React, { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

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
      const response = await axios.post('http://127.0.0.1:8000/api/check-image', formData, {
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
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'image/jpeg': [], 'image/png': [] }, multiple: false });
  const handleUploadSubmit = (e) => { e.preventDefault(); if (file) analyzeImage(file); else setError('Please select an image.'); };
  const handleRemoveImage = () => { setFile(null); setImagePreview(null); };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setIsCameraOn(true);
    } catch (err) {
      setError("Could not access webcam. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setIsCameraOn(false);
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        const imageFile = new File([blob], "webcam_capture.jpg", { type: "image/jpeg" });
        analyzeImage(imageFile);
      }, 'image/jpeg');
    }
  };

  useEffect(() => { return () => { if (stream) stream.getTracks().forEach(track => track.stop()); }; }, [stream, mode]);

  const renderResultCard = () => {
    if (!result) return null;
    
    if (result.match) {
      const { name, status, last_seen_location } = result.data;
      return (
        <div className="result-card success">
          <div className="result-title">Match Found</div>
          <div className="result-detail"><strong>Name:</strong> {name}</div>
          <div className="result-detail"><strong>Status:</strong> {status}</div>
          <div className="result-detail"><strong>Last Seen:</strong> {last_seen_location}</div>
        </div>
      );
    } else {
      return (
        <div className="result-card no-match">
          <div className="result-title">No Match Found</div>
          <p>{result.message}</p>
        </div>
      );
    }
  };
  
  return (
    <div className="app-container">
      <div className="card">
        <header className="card-header">
          <div className="logo">TR</div>
          <h1>TraceOn AI</h1>
          <p>AI-Powered Missing Person Identification</p>
        </header>

        <div className="tabs">
          <button onClick={() => setMode('upload')} className={`tab-button ${mode === 'upload' ? 'active' : ''}`}>Upload Photo</button>
          <button onClick={() => setMode('webcam')} className={`tab-button ${mode === 'webcam' ? 'active' : ''}`}>Live Cam</button>
        </div>

        <main className="card-body">
          {mode === 'upload' && (
            <>
              {!imagePreview && (
                <div {...getRootProps({ className: `dropzone` })}>
                  <input {...getInputProps()} /> <p>Drag & drop photo here, or click to select</p>
                </div>
              )}
              {imagePreview && (
                <div className="preview-container">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <button onClick={handleRemoveImage} className="remove-btn" title="Remove">×</button>
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