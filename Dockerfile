# Use an official Python runtime as the base image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the backend requirements file into the container
COPY requirements.txt .

# Install backend dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend source code into the container
COPY . .

# Install Node.js and npm
RUN apt-get update && apt-get install -y nodejs npm

# Set the working directory for the frontend
WORKDIR /app/frontend

# Copy the frontend package.json and package-lock.json
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Build the frontend
RUN npm run build

# Set the working directory back to the root
WORKDIR /app

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["python", "app.py"]
