module.exports = {
  apps: [
    {
      name: 'rankers-backend',
      script: './dist/index.js',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
      },
      restart_delay: 4000,
    },
    {
      name: 'rankers-frontend',
      script: './node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
      },
      restart_delay: 4000,
    },
  ],
};
