module.exports = {
  apps: [
    {
      name: 'server',
      script: './server/index.js',
      instances: 1,
      env: {
        NODE_ENV: 'development'
        // NODE_ENV: 'production'
      }
    }
  ]
}
