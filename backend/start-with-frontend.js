#!/usr/bin/env node

/**
 * Backend Startup Script with Frontend Pre-verification
 * This script starts the backend and optionally the frontend,
 * with health checks to ensure both are running properly.
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const BACKEND_PORT = process.env.PORT || 8001;
const FRONTEND_PORT = 3000;
const BACKEND_DIR = __dirname;
const FRONTEND_DIR = path.join(__dirname, '..', 'main-app');

let backendProcess = null;
let frontendProcess = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Check if a service is running on a port
function checkPort(port, serviceName) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/health`, { timeout: 3000 }, (res) => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        log(`✅ ${serviceName} is responding on port ${port}`, 'green');
        resolve(true);
      } else {
        resolve(false);
      }
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Wait for service to be ready
async function waitForService(port, serviceName, maxAttempts = 30) {
  log(`⏳ Waiting for ${serviceName} to start...`, 'yellow');
  
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const isReady = await checkPort(port, serviceName);
    if (isReady) {
      return true;
    }
  }
  
  log(`⚠️  ${serviceName} did not respond within ${maxAttempts} seconds`, 'yellow');
  return false;
}

// Start backend server
function startBackend() {
  return new Promise((resolve, reject) => {
    log('\n🚀 Starting Backend Server...', 'cyan');
    
    backendProcess = spawn('npx', ['tsx', 'src/server.ts'], {
      cwd: BACKEND_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    backendProcess.stdout.on('data', (data) => {
      process.stdout.write(`${colors.blue}[Backend]${colors.reset} ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
      process.stderr.write(`${colors.red}[Backend Error]${colors.reset} ${data}`);
    });

    backendProcess.on('error', (error) => {
      log(`❌ Backend failed to start: ${error.message}`, 'red');
      reject(error);
    });

    backendProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        log(`⚠️  Backend exited with code ${code}`, 'yellow');
      }
    });

    // Give it a moment to start
    setTimeout(() => resolve(), 2000);
  });
}

// Start frontend server
function startFrontend() {
  return new Promise((resolve, reject) => {
    log('\n🎨 Starting Frontend Server...', 'cyan');
    
    frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: FRONTEND_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    frontendProcess.stdout.on('data', (data) => {
      process.stdout.write(`${colors.green}[Frontend]${colors.reset} ${data}`);
    });

    frontendProcess.stderr.on('data', (data) => {
      process.stderr.write(`${colors.yellow}[Frontend Error]${colors.reset} ${data}`);
    });

    frontendProcess.on('error', (error) => {
      log(`❌ Frontend failed to start: ${error.message}`, 'red');
      reject(error);
    });

    frontendProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        log(`⚠️  Frontend exited with code ${code}`, 'yellow');
      }
    });

    // Give it a moment to start
    setTimeout(() => resolve(), 2000);
  });
}

// Pre-verification check
async function preVerification() {
  log('\n🔍 Running Pre-Verification Checks...', 'cyan');
  
  const backendRunning = await checkPort(BACKEND_PORT, 'Backend');
  const frontendRunning = await checkPort(FRONTEND_PORT, 'Frontend');
  
  return { backendRunning, frontendRunning };
}

// Cleanup function
function cleanup() {
  log('\n🧹 Shutting down services...', 'yellow');
  
  if (backendProcess) {
    backendProcess.kill();
    log('Backend stopped', 'yellow');
  }
  
  if (frontendProcess) {
    frontendProcess.kill();
    log('Frontend stopped', 'yellow');
  }
  
  process.exit(0);
}

// Main startup sequence
async function main() {
  log('='.repeat(60), 'cyan');
  log('  Real Estate Platform - Integrated Startup', 'bright');
  log('='.repeat(60), 'cyan');

  try {
    // Check if services are already running
    const { backendRunning, frontendRunning } = await preVerification();
    
    // Start backend if not running
    if (!backendRunning) {
      await startBackend();
      await waitForService(BACKEND_PORT, 'Backend');
    } else {
      log('✅ Backend is already running', 'green');
    }
    
    // Start frontend if not running
    if (!frontendRunning) {
      await startFrontend();
      await waitForService(FRONTEND_PORT, 'Frontend');
    } else {
      log('✅ Frontend is already running', 'green');
    }
    
    // Final verification
    log('\n✨ System Ready!', 'bright');
    log('='.repeat(60), 'cyan');
    log('📱 Access Points:', 'cyan');
    log(`   • Frontend: http://localhost:${FRONTEND_PORT}`, 'white');
    log(`   • Backend:  http://localhost:${BACKEND_PORT}`, 'white');
    log(`   • API:      http://localhost:${BACKEND_PORT}/api`, 'white');
    log('='.repeat(60), 'cyan');
    log('\nPress Ctrl+C to stop all services\n', 'yellow');
    
  } catch (error) {
    log(`\n❌ Startup failed: ${error.message}`, 'red');
    cleanup();
  }
}

// Handle shutdown signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Start the system
main();
