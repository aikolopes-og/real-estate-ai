/**
 * PM2 Ecosystem Configuration
 * Manages backend and frontend processes for Real Estate Platform
 * 
 * Usage:
 *   pm2 start ecosystem.config.js     - Start all processes
 *   pm2 stop ecosystem.config.js      - Stop all processes
 *   pm2 restart ecosystem.config.js   - Restart all processes
 *   pm2 logs                          - View all logs
 *   pm2 status                        - Check process status
 *   pm2 delete all                    - Remove all processes
 */

module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: './backend',
      script: './node_modules/.bin/tsx.cmd',
      args: 'watch src/server.ts',
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 8001,
      },
      watch: false,
      autorestart: true,
      max_memory_restart: '500M',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
    {
      name: 'frontend',
      cwd: './main-app',
      script: './node_modules/.bin/next.cmd',
      args: 'dev --turbopack --port 3000',
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      watch: false,
      autorestart: true,
      max_memory_restart: '1G',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
