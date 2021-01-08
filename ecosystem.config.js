module.exports = {
  apps: [
    {
      name: 'server',
      script: './server/index.js',
      instances: 1,
      env: {
        NODE_ENV: 'development' // local db
        // NODE_ENV: 'production' // atlas
        // NODE_ENV: 'demo' // local
      }
    }
  ]
}
