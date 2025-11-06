# Use Node.js 20 LTS (Alpine for smaller image size)
FROM node:20-alpine

# Install build dependencies needed for better-sqlite3
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Create database directory
RUN mkdir -p /app/database

# Initialize and seed the database, then start the server
CMD ["sh", "-c", "npm run init-db && npm run seed-data && npm run dev"]
