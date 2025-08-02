# KYC Attestation Platform

## Project Overview

This project is a Know Your Customer (KYC) Attestation Platform designed to streamline and secure the process of identity verification and compliance. It features a NestJS backend for robust API services and data management, integrated with PostgreSQL for data storage. The platform is designed with scalability and compliance in mind, utilizing ULIDs for unique, sortable identifiers.

## Project Structure

The project is structured as a monorepo, with the core backend application located in the `apps/backend` directory.

```text
.
├── apps/
│   └── backend/             # NestJS backend application
│       ├── src/
│       ├── prisma/          # Prisma schema and migrations
│       └── .env.example     # Example environment variables
├── Dockerfile               # Dockerfile for building the backend image
├── docker-compose.yml       # Docker Compose for orchestrating services
├── package.json             # Root package for monorepo dependencies
└── README.md                # This file
```


## Technologies Used

* **Backend:** NestJS (TypeScript)
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Unique Identifiers:** ULIDs (Universally Unique Lexicographically Sortable Identifiers)
* **Containerization:** Docker, Docker Compose

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

* Node.js (v20 or later)
* npm (v10 or later)
* Docker and Docker Compose (if running with Docker)
* PostgreSQL database instance (if running locally without Docker Compose for the DB)

### 1. Clone the Repository

If you haven't already, clone the project repository:

```bash
git clone <your-repository-url>
cd kyc-attestation-platform
````
### 2. Install Dependencies. Navigate to the project root and install all Node.js dependencies:

```bash
npm install
```
### 3. Environment Configuration

Backend .env File

Create a `.env` file inside the `apps/backend directory`. This file will hold your database connection string and other environment-specific variables.

```bash
# apps/backend/.env

# Database connection URL for Prisma.
# If running the backend locally and connecting to a local PostgreSQL instance:
DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase?schema=public"

# If running the backend service via Docker Compose, the DATABASE_URL in docker-compose.yml
# will override this for the container, connecting to the 'db' service defined there.
```

**Important:** Replace `user`, `password`, `localhost:5432`, and `mydatabase` with your actual PostgreSQL credentials and host/port.

### 4. Database Setup (Prisma)
Navigate into the apps/backend directory to run Prisma commands.

```bash
cd apps/backend
```

### Generate Prisma Client
Generate the Prisma client based on your prisma/schema.prisma file. This is essential for your NestJS application to interact with the database.

```bash
npx prisma generate
```

### Apply Database Migrations
Apply any pending database migrations to create the necessary tables in your PostgreSQL database.

```bash
npx prisma migrate dev --name init
```

You can choose a more descriptive name than init for subsequent migrations.

### 5. Running the Application
You have two primary ways to run the application: locally (for development) or using Docker Compose (for a containerized environment).

**Option A: Running Locally (Development)**

To run the backend application directly on your host machine:

```bash
cd apps/backend
npm run start:dev
```

The application will typically start on `http://localhost:3000`.

**Option B: Running with Docker Compose (Recommended for consistency)**

This method will spin up both your PostgreSQL database and the backend application in Docker containers.

1. **Build Docker Images:**

From the project root (`~/200x/kyc-attestation-platform`), build the Docker image for your backend.

```bash
docker compose build
```

2. **Start Services:**

Start the PostgreSQL database and the backend application.

```bash
docker compose up -d
```

This will run the containers in detached mode.

3. **Run Prisma Migrations (Inside Docker Container):**

After the services are up, apply your database migrations by executing the command inside the running backend container:

```bash
docker compose exec backend npx prisma migrate dev --name init
```

4. **Access the Application:**
Your backend API should now be accessible at 1http://localhost:3000`.

### Stopping Docker Services
To stop and remove the running Docker containers:

```bash
docker compose down
```

If you also want to remove the persistent database volume (and lose all database data), add the `-v` flag:

```bash
docker compose down -v
```

### 6. Building the application
**Backend**

This creates a `dist` build in the `apps/backend` folder.
```bash
 npx nest build backend
```

### Contributing
(Optional section: Add guidelines for contributions, code style, testing, etc.)

### License

This project is licensed under the Apache License, Version 2.0.