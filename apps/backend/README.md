# Prisma

## Database Migrations

We changed our default location so use the `--schema=prisma/schema/schema.prisma` flag

This project uses Prisma for database management. The schema is organized using the `prismaSchemaFolder` feature, with models split across multiple files in the `prisma/models/` directory.

### Prerequisites

1. **Database Connection**: Ensure your database is running and accessible
   - For local development: `DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase?schema=public"`
   - For Docker: Database should be running via `docker-compose up db`

2. **Environment Setup**: Make sure your `.env` file is configured with the correct `DATABASE_URL`

### Creating Migrations

#### Create and Apply a New Migration
```bash
# Navigate to the backend directory
cd apps/backend

# Create and apply a new migration
npx prisma migrate dev --name <migration_name>

# Example:
npx prisma migrate dev --name add_user_profile
```

#### Create Migration Without Applying
```bash
# Create migration file only (useful for review before applying)
npx prisma migrate dev --create-only --name <migration_name>

# Then apply the migration
npx prisma migrate dev
```

### Applying Migrations

#### Apply Pending Migrations
```bash
# Apply all pending migrations
npx prisma migrate dev

# Apply migrations in production (without interactive prompts)
npx prisma migrate deploy
```

#### Apply Specific Migration
```bash
# Apply migrations up to a specific migration
npx prisma migrate resolve --applied <migration_name>
```

### Rolling Back Migrations

#### Reset Database (Development Only)
```bash
# Reset database and apply all migrations from scratch
npx prisma migrate reset

# Force reset (bypass confirmation)
npx prisma migrate reset --force
```

#### Rollback to Specific Migration
```bash
# Mark a migration as rolled back
npx prisma migrate resolve --rolled-back <migration_name>

# Then apply migrations up to desired point
npx prisma migrate deploy
```

### Working with Docker

#### Run Migrations Inside Docker Container
```bash
# Execute migration command inside the backend container
docker compose exec backend npx prisma migrate dev --name <migration_name> --schema=apps/backend/prisma/schema.prisma
```

#### Apply Migrations in Docker Environment
```bash
# Apply migrations in Docker
docker compose exec backend npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma
```

### Schema Management

#### Generate Prisma Client
```bash
# Generate the Prisma client after schema changes
npx prisma generate
```

#### Introspect Database
```bash
# Pull schema from existing database
npx prisma db pull
```

#### Push Schema Changes (Development)
```bash
# Push schema changes directly to database (bypass migrations)
npx prisma db push
```

### Migration Best Practices

1. **Always create migrations for schema changes** - Don't use `db push` in production
2. **Review migration files** - Check the generated SQL before applying
3. **Test migrations** - Always test migrations in development before production
4. **Use descriptive names** - Migration names should clearly describe the change
5. **Backup before major changes** - Always backup your database before applying migrations

### Common Migration Commands

```bash
# Check migration status
npx prisma migrate status

# View migration history
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma

# Validate schema
npx prisma validate

# Format schema files
npx prisma format
```

### Troubleshooting

#### Migration Issues
- **"Already in sync"**: Database schema matches your Prisma schema
- **"Database is empty"**: Run `npx prisma migrate reset` to start fresh
- **Connection errors**: Check your `DATABASE_URL` and ensure database is running

#### Schema Issues
- **"Preview feature deprecated"**: Remove `previewFeatures = ["prismaSchemaFolder"]` from schema.prisma
- **Client generation errors**: Run `npx prisma generate` after schema changes

### File Structure

```
apps/backend/prisma/
├── schema.prisma          # Main schema file
├── models/                # Organized model files
│   ├── user/
│   │   ├── user.prisma
│   │   └── enums/
│   │       └── role.prisma
│   ├── client/
│   │   └── client.prisma
│   └── profile/
│       └── profile.prisma
└── migrations/            # Generated migration files
    └── YYYYMMDDHHMMSS_migration_name/
        └── migration.sql
```