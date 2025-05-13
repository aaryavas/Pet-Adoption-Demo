FROM node:18

WORKDIR /app

# Copy package files then remove package-lock.json and install dependencies
COPY package*.json ./
RUN rm -f package-lock.json && npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]