# Use a Node.js 20 Alpine image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the entire project source code
COPY . .

# Build the NestJS backend application
RUN npx nest build backend

# Expose the port your NestJS app listens on (default is 3000)
EXPOSE 3000

# Command to run the application
CMD [ "node", "apps/backend/dist/main.js" ]