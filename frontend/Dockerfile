# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (clean install without lock file)
RUN rm -rf node_modules && npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 5173

# Start the webpack development server
CMD ["npm", "run", "dev"]
