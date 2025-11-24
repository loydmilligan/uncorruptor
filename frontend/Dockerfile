FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source
COPY . .

EXPOSE 5173

# Create .env file from environment variable and start Vite dev server
CMD sh -c "echo \"VITE_API_URL=\$VITE_API_URL\" > .env && npm run dev -- --host 0.0.0.0"
