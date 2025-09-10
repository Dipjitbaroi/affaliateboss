// Legacy Database utility - now using Prisma with PostgreSQL
// This file maintains backward compatibility for existing code

const { PrismaClient } = require('@prisma/client');

// Re-export Prisma utilities for backward compatibility
const {
  initDatabase,
  getDatabase,
  closeDatabase,
  authenticateUser,
  authenticateAdmin,
  generateShortCode,
  generateApiKey,
  createErrorResponse,
  createSuccessResponse,
  QueryBuilder,
  healthCheck,
  withTransaction,
  batchOperation,
  isDatabaseReady,
  prisma
} = require('./prisma');

// Legacy compatibility wrapper
class LegacyDatabase {
  constructor() {
    this.db = getDatabase();
  }

  // Legacy prepare method - converts to Prisma queries
  prepare(sql) {
    console.warn('⚠️  DEPRECATED: prepare() method is deprecated. Please use Prisma queries instead.');
    
    return {
      get: async (...params) => {
        console.warn('Legacy SQLite query detected. Please migrate to Prisma.');
        // This would need custom implementation based on the specific SQL
        throw new Error('Legacy SQL queries not supported. Please migrate to Prisma.');
      },
      all: async (...params) => {
        console.warn('Legacy SQLite query detected. Please migrate to Prisma.');
        throw new Error('Legacy SQL queries not supported. Please migrate to Prisma.');
      },
      run: async (...params) => {
        console.warn('Legacy SQLite query detected. Please migrate to Prisma.');
        throw new Error('Legacy SQL queries not supported. Please migrate to Prisma.');
      }
    };
  }

  // Legacy exec method
  exec(sql) {
    console.warn('⚠️  DEPRECATED: exec() method is deprecated. Please use Prisma migrations instead.');
    throw new Error('Raw SQL execution not supported. Please use Prisma migrations.');
  }

  // Legacy pragma method
  pragma(setting) {
    console.warn('⚠️  DEPRECATED: pragma() method is deprecated. PostgreSQL settings should be configured at database level.');
    // No-op for PostgreSQL
    return this;
  }

  // Legacy transaction method
  transaction(callback) {
    console.warn('⚠️  DEPRECATED: transaction() method is deprecated. Please use withTransaction() from prisma.js.');
    return withTransaction(callback);
  }

  // Legacy close method
  close() {
    return closeDatabase();
  }
}

// Legacy initialization function
function isSchemaInitialized() {
  console.warn('⚠️  DEPRECATED: Use isDatabaseReady() from prisma.js instead.');
  return isDatabaseReady();
}

// Legacy schema initialization (now handled by Prisma migrations)
function initSchema() {
  console.warn('⚠️  DEPRECATED: Schema initialization is now handled by Prisma migrations.');
  console.log('Run: npm run db:migrate to apply schema changes');
  throw new Error('Please use Prisma migrations: npm run db:migrate');
}

// Legacy seeding (now in scripts/prisma-seed.js)
function seedDatabase() {
  console.warn('⚠️  DEPRECATED: Use npm run db:seed instead.');
  console.log('Run: npm run db:seed to seed the database');
  throw new Error('Please use the new seed script: npm run db:seed');
}

// For backward compatibility, export a database instance that throws helpful errors
const legacyDb = new LegacyDatabase();

// Export legacy interface with migration warnings
module.exports = {
  // New Prisma-based exports (recommended)
  initDatabase,
  getDatabase,
  closeDatabase,
  authenticateUser,
  authenticateAdmin,
  generateShortCode,
  generateApiKey,
  createErrorResponse,
  createSuccessResponse,
  QueryBuilder,
  healthCheck,
  withTransaction,
  batchOperation,
  isDatabaseReady,
  prisma,

  // Legacy exports (deprecated but maintained for compatibility)
  isSchemaInitialized,
  initSchema,
  seedDatabase,
  
  // Default export for legacy require() calls
  default: legacyDb,
  
  // Migration helper
  migrationGuide: () => {
    console.log(`
🔄 MIGRATION REQUIRED

Your code is using the legacy SQLite database interface.
Please migrate to the new Prisma PostgreSQL interface:

OLD WAY (SQLite):
  const db = require('./lib/database');
  const users = db.prepare('SELECT * FROM users').all();

NEW WAY (Prisma):
  const { prisma } = require('./lib/prisma');
  const users = await prisma.user.findMany();

OR use the QueryBuilder helper:
  const { QueryBuilder } = require('./lib/prisma');
  const userQuery = new QueryBuilder('user');
  const users = await userQuery.findAll();

📚 See POSTGRESQL-MIGRATION.md for complete migration guide.
    `);
  }
};