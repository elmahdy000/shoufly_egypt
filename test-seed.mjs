#!/usr/bin/env node
import { spawn } from 'child_process';

const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const proc = spawn(cmd, ['run', 'db:seed'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true
});

proc.on('exit', (code) => {
  process.exit(code);
});
