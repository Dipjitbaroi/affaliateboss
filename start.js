#!/usr/bin/env node

const { spawn } = require('child_process');
const os = require('os');

console.log('🚀 Starting Affiliate Boss Development Environment...\n');

const isWindows = os.platform() === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('🧩 Spawning `npm run dev` (workspace) ...');
const child = spawn(npmCmd, ['run', 'dev'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: false
});

child.on('exit', (code) => {
    console.log(`\n👋 Dev process exited with code ${code}`);
    process.exit(code);
});

child.on('error', (err) => {
    console.error('Failed to start dev script:', err && err.message ? err.message : err);
    console.log('\n💡 Try running manually:');
    console.log('   npm run api');
    console.log('   npm run frontend');
});