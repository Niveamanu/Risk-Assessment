# Base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Use HTTP instead of HTTPS to bypass SSL trust issues temporarily
RUN sed -i 's/https/http/' /etc/apk/repositories && \
    apk add --no-cache ca-certificates && \
    update-ca-certificates

# Install dependencies
COPY package.json package-lock.json ./

# Disable strict SSL (if required due to corporate CA issues)
RUN npm config set strict-ssl false && npm install

# Copy source files
COPY . .

# Expose port 5173 for Vite dev server
EXPOSE 5173

# Start Vite dev server on port 5173, accessible from outside container
CMD ["npm", "run", "dev", "--", "--port=5173", "--host"] 