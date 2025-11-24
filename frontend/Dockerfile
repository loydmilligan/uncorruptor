FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source
COPY . .

EXPOSE 5173

# Vite dev server needs to listen on all interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
