#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

console.log('🧪 Validating seed script...\n');
console.log(`📁 Project root: ${projectRoot}\n`);

// Run npm run db:seed
const proc = spawn('npm', ['run', 'db:seed'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

proc.on('exit', (code) => {
  if (code === 0) {
    console.log('\n✅ Seed validation passed!');
  } else {
    console.log(`\n❌ Seed validation failed with code ${code}`);
  }
  process.exit(code);
});

proc.on('error', (error) => {
  console.error('❌ Error running seed:', error);
  process.exit(1);
});
