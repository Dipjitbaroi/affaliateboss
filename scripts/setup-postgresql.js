#!/usr/bin/env node

// Setup script for PostgreSQL migration
// Bangladesh dev style - one-command setup

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function createEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const examplePath = path.join(__dirname, '..', '.env.example');
  
  if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
    console.log('\n📝 Creating .env.local from .env.example...');
    fs.copyFileSync(examplePath, envPath);
    console.log('✅ .env.local created');
    console.log('⚠️  Please update DATABASE_URL in .env.local with your PostgreSQL connection string');
  } else if (fs.existsSync(envPath)) {
    console.log('✅ .env.local already exists');
  }
}

function main() {
  console.log('🚀 Setting up Affiliate Boss with PostgreSQL + Prisma\n');
  
  // Install dependencies
  runCommand('npm install', 'Installing dependencies');
  
  // Create environment file
  createEnvFile();
  
  // Generate Prisma client
  runCommand('npx prisma generate', 'Generating Prisma client');
  
  console.log('\n✅ Setup completed!\n');
  
  console.log('📋 Next steps:');
  console.log('1. Update DATABASE_URL in .env.local with your PostgreSQL connection string');
  console.log('2. Run: npm run db:migrate (to create database tables)');
  console.log('3. Run: npm run db:seed (to add demo data)');
  console.log('4. Run: npm run dev (to start the application)\n');
  
  console.log('📚 For detailed migration guide, see: POSTGRESQL-MIGRATION.md\n');
  
  console.log('🎯 Example DATABASE_URL formats:');
  console.log('Local: postgresql://postgres:password@localhost:5432/affiliate_boss');
  console.log('Vercel: postgres://user:pass@ep-xyz.region.postgres.vercel-storage.com/db');
  console.log('Supabase: postgresql://postgres:pass@db.project.supabase.co:5432/postgres');
}

if (require.main === module) {
  main();
}

module.exports = { main };
