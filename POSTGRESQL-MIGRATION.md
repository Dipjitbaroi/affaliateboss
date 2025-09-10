# Migration from SQLite to PostgreSQL with Prisma

This guide will help you migrate your Affiliate Boss application from SQLite to PostgreSQL using Prisma ORM.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install @prisma/client prisma pg
npm uninstall better-sqlite3
```

### 2. Set Up PostgreSQL Database

Choose one of these options:

#### Option A: Local PostgreSQL
1. Install PostgreSQL on your machine
2. Create a database: `CREATE DATABASE affiliate_boss;`
3. Update `.env.local` with your connection string

#### Option B: Cloud PostgreSQL (Recommended for Production)
- **Vercel PostgreSQL**: Easy integration with Vercel deployments
- **Supabase**: Free tier with excellent dashboard
- **Railway**: Simple setup with automatic backups
- **PlanetScale**: Serverless with branching (MySQL-compatible)

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and update:

```bash
# PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/affiliate_boss?schema=public"

# Other environment variables...
```

### 4. Run Prisma Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (creates tables)
npm run db:migrate

# Seed with demo data
npm run db:seed
```

### 5. Update Application Code

The new database connection is already set up in `lib/prisma.js`. The API endpoints should work with minimal changes since the new Prisma client maintains similar query patterns.

## 📋 Migration Steps Details

### Step 1: Database Setup

#### Local Development Setup
```bash
# Install PostgreSQL (on Windows)
# Download from: https://www.postgresql.org/download/windows/

# Create database
psql -U postgres
CREATE DATABASE affiliate_boss;
\q
```

#### Production Setup Options

**Vercel PostgreSQL:**
```bash
# In your Vercel dashboard:
# 1. Go to Storage tab
# 2. Create PostgreSQL database
# 3. Copy connection string to environment variables
```

**Supabase:**
```bash
# 1. Create account at supabase.com
# 2. Create new project
# 3. Go to Settings > Database
# 4. Copy connection string (use connection pooling URL for production)
```

### Step 2: Environment Configuration

Update your `.env.local` file:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/affiliate_boss?schema=public"

# Application
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
API_PORT=3002

# Optional services (keep existing values)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
OPENAI_API_KEY=your_openai_key
```

### Step 3: Run Migrations

```bash
# Install new dependencies
npm install

# Generate Prisma client
npm run db:generate

# Create and run migration
npm run db:migrate

# Seed database with demo data
npm run db:seed
```

### Step 4: Verify Setup

```bash
# Start the application
npm run dev

# Test API health
curl http://localhost:3002/api/health

# Check demo data
curl http://localhost:3002/api/auth/me -H "Authorization: Bearer api_key_john_123456789"
```

## 🔄 Data Migration (If You Have Existing Data)

If you have existing SQLite data to migrate:

### Option 1: Export/Import Script

```bash
# Create data export script (you'll need to create this)
node scripts/export-sqlite-data.js > data.json

# Import to PostgreSQL
node scripts/import-to-postgresql.js < data.json
```

### Option 2: Manual Data Transfer

1. Export key data from SQLite using the old API
2. Use Prisma Studio to inspect the new database: `npm run db:studio`
3. Create import scripts using the new Prisma client

## 📊 Database Schema Changes

### Key Improvements:
- **Enums**: Replaced TEXT constraints with proper PostgreSQL enums
- **Indexes**: Optimized for PostgreSQL query patterns
- **Relationships**: Proper foreign key constraints with cascading
- **Data Types**: Using appropriate PostgreSQL types (DECIMAL, TIMESTAMP, etc.)

### Schema Mapping:
- SQLite `INTEGER PRIMARY KEY AUTOINCREMENT` → PostgreSQL `SERIAL PRIMARY KEY`
- SQLite `TEXT` → PostgreSQL `TEXT` or `VARCHAR`
- SQLite `DECIMAL(15,2)` → PostgreSQL `DECIMAL(15,2)`
- SQLite `DATETIME` → PostgreSQL `TIMESTAMP(3)`
- SQLite `BOOLEAN` → PostgreSQL `BOOLEAN`

## 🚀 Deployment

### For Vercel:
1. Connect your PostgreSQL database in Vercel dashboard
2. Add `DATABASE_URL` environment variable
3. Deploy: `vercel --prod`

### For Railway/Render:
1. Add PostgreSQL service
2. Set `DATABASE_URL` environment variable
3. Add build command: `npm run db:generate && npm run build`
4. Add start command: `npm start`

## 📝 API Changes

### Minimal Code Changes Required:

The new `lib/prisma.js` provides backward-compatible methods:

```javascript
// Old SQLite way
const db = require('./lib/database');
const users = db.prepare('SELECT * FROM users').all();

// New Prisma way (similar pattern)
const { prisma } = require('./lib/prisma');
const users = await prisma.user.findMany();

// Or using the QueryBuilder helper
const userQuery = new QueryBuilder('user');
const users = await userQuery.findAll();
```

### Updated Authentication:
```javascript
// lib/prisma.js already handles this
const user = await authenticateUser(apiKey);
const admin = await authenticateAdmin(adminKey);
```

## 🔧 Troubleshooting

### Common Issues:

1. **Connection Refused**
   - Check PostgreSQL is running
   - Verify connection string format
   - Check firewall settings

2. **Migration Errors**
   - Ensure database exists
   - Check user permissions
   - Verify schema name

3. **Prisma Generate Issues**
   - Run `npm run db:generate` after schema changes
   - Clear node_modules and reinstall if needed

4. **Environment Variables**
   - Double-check `.env.local` format
   - Ensure no trailing spaces in DATABASE_URL
   - Use double quotes for connection strings with special characters

### Debug Commands:
```bash
# Check database connection
npx prisma db pull

# View database in browser
npm run db:studio

# Reset database (caution: deletes all data)
npm run db:reset

# View migration status
npx prisma migrate status
```

## 📈 Performance Improvements

PostgreSQL offers several advantages over SQLite:

1. **Concurrent Access**: Multiple users can access simultaneously
2. **Advanced Indexing**: Better query optimization
3. **JSON Support**: Native JSON operations for complex data
4. **Full-Text Search**: Built-in search capabilities
5. **Scalability**: Handle larger datasets efficiently

## 🎯 Next Steps

After migration:

1. **Test All Endpoints**: Verify all API functions work correctly
2. **Performance Testing**: Monitor query performance
3. **Backup Strategy**: Set up automated backups
4. **Monitoring**: Add database monitoring (connection pooling, slow queries)
5. **Optimization**: Add additional indexes based on usage patterns

## 📚 Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Vercel PostgreSQL](https://vercel.com/docs/storage/vercel-postgres)
- [Supabase Database](https://supabase.com/docs/guides/database)

## ⚠️ Important Notes

- **Backup First**: Always backup your SQLite data before migration
- **Test Locally**: Test the migration process in development first
- **Environment Variables**: Keep your production DATABASE_URL secure
- **Connection Limits**: PostgreSQL has connection limits; consider connection pooling for high traffic
- **Prisma Studio**: Great for debugging and viewing data during development

## 🆘 Need Help?

If you encounter issues during migration:

1. Check the console for specific error messages
2. Verify your PostgreSQL connection with a simple client
3. Test Prisma connection: `npx prisma db pull`
4. Review the migration logs in `prisma/migrations/`

The migration should be straightforward with the provided setup. The application logic remains largely the same, with the database layer now powered by Prisma and PostgreSQL.
