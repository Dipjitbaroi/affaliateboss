// Prisma Database utility for PostgreSQL
// Bangladesh dev style - practical, efficient, and production-ready

import { PrismaClient } from '@prisma/client';

// Global prisma instance for serverless compatibility
let prisma;

// Initialize Prisma client
function initDatabase() {
  if (prisma) return prisma;
  
  try {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
      errorFormat: 'minimal',
    });
    
    console.log('Prisma client initialized successfully');
    return prisma;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Get database instance (singleton pattern)
function getDatabase() {
  if (!prisma) {
    initDatabase();
  }
  return prisma;
}

// Close database connection (for cleanup)
async function closeDatabase() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

// Authentication utilities
async function authenticateUser(apiKey) {
  const db = getDatabase();
  try {
    const user = await db.user.findFirst({
      where: {
        apiKey: apiKey,
        status: 'ACTIVE'
      }
    });
    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

async function authenticateAdmin(adminKey) {
  const db = getDatabase();
  try {
    // Check if it's a valid admin key - user with admin privileges or special admin key
    const user = await db.user.findFirst({
      where: {
        OR: [
          { apiKey: adminKey },
          { apiKey: adminKey }
        ],
        AND: [
          {
            OR: [
              { tier: { in: ['PLATINUM', 'DIAMOND'] } },
              { apiKey: { startsWith: 'admin_' } }
            ]
          },
          { status: 'ACTIVE' }
        ]
      }
    });
    return user;
  } catch (error) {
    console.error('Admin authentication error:', error);
    return null;
  }
}

// Utility functions for common operations
function generateShortCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateApiKey(prefix = 'api_key') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `${prefix}_${timestamp}_${random}`;
}

// Error response helper
function createErrorResponse(message, statusCode = 400, details = null) {
  return {
    error: true,
    message,
    statusCode,
    details,
    timestamp: new Date().toISOString()
  };
}

// Success response helper
function createSuccessResponse(data, message = 'Success') {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

// Bangladesh dev helper - practical query builder for common operations with Prisma
class QueryBuilder {
  constructor(model) {
    this.model = model;
    this.db = getDatabase();
  }
  
  async findById(id) {
    try {
      return await this.db[this.model].findUnique({
        where: { id: parseInt(id) }
      });
    } catch (error) {
      console.error(`Error finding ${this.model} by id:`, error);
      return null;
    }
  }
  
  async findByColumn(column, value) {
    try {
      return await this.db[this.model].findFirst({
        where: { [column]: value }
      });
    } catch (error) {
      console.error(`Error finding ${this.model} by ${column}:`, error);
      return null;
    }
  }
  
  async findAll(where = {}, options = {}) {
    try {
      return await this.db[this.model].findMany({
        where,
        ...options
      });
    } catch (error) {
      console.error(`Error finding all ${this.model}:`, error);
      return [];
    }
  }
  
  async create(data) {
    try {
      return await this.db[this.model].create({
        data
      });
    } catch (error) {
      console.error(`Error creating ${this.model}:`, error);
      throw error;
    }
  }
  
  async update(id, data) {
    try {
      return await this.db[this.model].update({
        where: { id: parseInt(id) },
        data
      });
    } catch (error) {
      console.error(`Error updating ${this.model}:`, error);
      throw error;
    }
  }
  
  async delete(id) {
    try {
      return await this.db[this.model].delete({
        where: { id: parseInt(id) }
      });
    } catch (error) {
      console.error(`Error deleting ${this.model}:`, error);
      throw error;
    }
  }
  
  async count(where = {}) {
    try {
      return await this.db[this.model].count({
        where
      });
    } catch (error) {
      console.error(`Error counting ${this.model}:`, error);
      return 0;
    }
  }
  
  async exists(where) {
    try {
      const count = await this.db[this.model].count({
        where
      });
      return count > 0;
    } catch (error) {
      console.error(`Error checking if ${this.model} exists:`, error);
      return false;
    }
  }
}

// Database health check
async function healthCheck() {
  try {
    const db = getDatabase();
    await db.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { 
      status: 'unhealthy', 
      error: error.message, 
      timestamp: new Date().toISOString() 
    };
  }
}

// Transaction helper
async function withTransaction(callback) {
  const db = getDatabase();
  try {
    return await db.$transaction(callback);
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

// Batch operations helper
async function batchOperation(operations) {
  const db = getDatabase();
  try {
    return await db.$transaction(operations);
  } catch (error) {
    console.error('Batch operation failed:', error);
    throw error;
  }
}

// Migration helper to check if database is ready
async function isDatabaseReady() {
  try {
    const db = getDatabase();
    // Try to query the users table to see if migrations have run
    await db.user.count();
    return true;
  } catch (error) {
    console.error('Database not ready:', error);
    return false;
  }
}

export {
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
  isDatabaseReady
};

// Export Prisma client for direct access when needed
export function getPrisma() {
  return getDatabase();
}
