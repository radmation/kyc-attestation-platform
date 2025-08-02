# Use a Node.js 20 Alpine image for a smaller footprint
FROM node:20-alpine AS development

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker cache
# This step is done separately so that npm install is only re-run if package.json changes
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the entire project source code
COPY . .

# Build the NestJS backend application
# The `apps/backend` path is crucial here.
# Using `npx nest build backend` directly ensures the Nest CLI builds the 'backend' app.
RUN npx nest build backend

# --- Production Stage ---
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Copy only necessary files from the development stage
# This includes node_modules and the built backend application
COPY --from=development /usr/src/app/node_modules ./node_modules
# CORRECTED: Copy from the monorepo's root dist/apps/backend to the target location
COPY --from=development /usr/src/app/dist/apps/backend ./apps/backend/dist

# Expose the port your NestJS app listens on (default is 3000)
EXPOSE 3000

# Command to run the application
# Ensure this points to the correct main.js in the built dist folder
CMD [ "node", "apps/backend/dist/main.js" ]