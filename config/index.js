// settings are in keybase

import settings from './config.settings'
import debug from 'debug'
import ecosystem from 'ecosystem.config.js'

// eslint-disable-next-line
import { green } from 'logger'

export const TEST_LOCAL = 'testLocal'
export const DEV = 'development'
export const PROD = 'production'
export const DEMO = 'demo'

const unknowEnvName = (env) =>
  `ERROR: config/index.js: unknown environment name: ${env}. Must be ${TEST_LOCAL}, ${DEV} or ${PROD}`

const lConfig = debug('server:config')

const mongoUri = (env) => {
  switch (env) {
    case DEMO:
      return settings.db.demo.mongoUri
    case DEV:
      lConfig('env: ', env)
      lConfig('monguUri: ', settings.db.development.mongoUri)
      return settings.db.development.mongoUri
    case PROD:
      return settings.db.production.mongoUri
    case TEST_LOCAL:
      lConfig('env: ', env)
      lConfig('monguUri: ', settings.db.testLocal.mongoUri)
      return settings.db.testLocal.mongoUri
    default:
      throw new Error(unknowEnvName())
  }
}

const dbName = (env) => {
  switch (env) {
    case DEMO:
      return settings.db[DEMO].dbName
    case DEV:
      return settings.db[DEV].dbName
    case PROD:
      return settings.db[PROD].dbName
    case TEST_LOCAL:
      return settings.db[TEST_LOCAL].dbName
    default:
      throw new Error(unknowEnvName())
  }
}

// const apiRoot = (env) => {
//   switch (env) {
//     case DEMO:
//       return settings.apiRoot.local
//     case DEV:
//       return settings.apiRoot.local
//     case PROD:
//       return settings.apiRoot.remote
//     case TEST_LOCAL:
//       return settings.apiRoot.local

//     default:
//       throw new Error(unknowEnvName())
//   }
// }

const port = (env) => {
  switch (env) {
    case DEMO:
      return settings.serverPort.local
    case DEV:
      return settings.serverPort.local
    case PROD:
      return settings.serverPort.remote
    case TEST_LOCAL:
      return settings.serverPort.local
    default:
      throw new Error(unknowEnvName())
  }
}

// const setNodeEnv = (env) => {
//   if (env) {
//     return env
//   } else if (process.env.NODE_ENV) {
//     const ret = process.env.NODE_ENV
//     return ret
//   } else {
//     return PROD
//   }
// }

const config = () => {
  const _env = ecosystem.apps[0].env.NODE_ENV
  green('_env', _env)
  const envExists = [DEMO, DEV, PROD, TEST_LOCAL].findIndex((i) => i === _env)

  if (!(envExists >= 0)) {
    throw new Error(unknowEnvName())
  }

  const ret = {
    env: _env,
    dbName: dbName(_env),
    mongoUri: mongoUri(_env),
    port: port(_env),
    testUser: settings.testUser
  }
  return ret
}

export default config
