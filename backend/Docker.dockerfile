# Use a Python base image with necessary build tools for dlib. 
# We use a slim-bullseye image to keep the size down but ensure system libraries are available.
FROM python:3.10-slim-bullseye

# Set the locale environment to prevent build warnings/errors
ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8

# Install dlib build dependencies (Crucial for face_recognition/dlib compilation)
# - cmake and build-essential are required for C/C++ compilation.
# - libgtk-3-dev and libboost-all-dev provide necessary headers for dlib.
RUN apt-get update && \
    apt-get install -y \
    cmake \
    build-essential \
    libgtk-3-dev \
    libboost-all-dev \
    && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file and install dependencies
# This is done separately to leverage Docker's build cache.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your backend code (main.py, matcher.py, mock_data.py, etc.)
COPY . .

# Environment variable $PORT is automatically set by Render
# We explicitly set the port to 10000, which Render expects for container services
ENV PORT=10000 

# Command to run the FastAPI application using Gunicorn and Uvicorn workers
# Gunicorn manages Uvicorn workers for production-grade parallelism and stability.
CMD ["gunicorn", "main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:10000"]