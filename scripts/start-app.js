import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');

console.log('Starting Employee Tracking System...');

// Start Backend
const server = spawn('node', ['server/index.js'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true
});

// Start Frontend
const frontend = spawn('npm', ['run', 'dev', '--', '--host'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true
});

const cleanup = () => {
    server.kill();
    frontend.kill();
    process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
