// Legacy Database utility - DEPRECATED
// This file maintains backward compatibility for existing code
// Please migrate to lib/prisma.js for new development

console.warn('⚠️  DEPRECATED: lib/database.js is deprecated. Please use lib/prisma.js instead.');

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

// Export everything from the new Prisma module
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

📚 See POSTGRESQL-MIGRATION.md for complete migration guide.
    `);
  }
};