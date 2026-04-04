module.exports = {
  apps: [
    {
      name: 'lumen-api',
      script: 'src/server.ts',
      interpreter: 'ts-node',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      log_file: 'logs/combined.log',
      time: true,
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
}