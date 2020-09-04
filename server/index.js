import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import cors from 'cors'
import config from '../config'
import importData from 'routes/importData'
import categories from 'routes/categories'
import views from 'routes/views'
import rules from 'routes/rules'
import criteria from 'routes/criteria'
import exportData from 'routes/exportData'
import duplicates from 'routes/duplicates'
import test from 'routes/test'
import debug from 'debug'

// eslint-disable-next-line
import { redf, red, green } from '../logger'

const lServer = debug('server')
const lServerError = debug('server:ERROR')

const cfg = config()

const app = express()

app.use(helmet())
app.use(cors())
app.use(bodyParser.json())
app.use(morgan('dev'))

app.get('/health', async (req, res) => {
  try {
    res.send(JSON.stringify({ status: 'All good here.' }))
  } catch (e) {
    res.send()
    res.send(JSON.stringify({ status: 'Something went wrong.' }))
  }
})

app.use((req, res, next) => {
  res.header('Content-Type', 'application/json')
  next()
})

app.use('/api/import', importData)
app.use('/api/categories', categories)
app.use('/api/views', views)
app.use('/api/rules', rules)
app.use('/api/criteria', criteria)
app.use('/api/export', exportData)
app.use('/api/test', test)
app.use('/api/duplicates', duplicates)

app.get('*', function(req, res) {
  throw new Error(`unknown route: ..${req.url}`)
})

// 'debug' is not working when NODE_ENV=testLocal
// Having both redf & lServerError is a work around
const logError = (err, verbose = false) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log()
    if (verbose) {
      redf('server.error', err) // works in test
      lServerError(err) // works only in dev
    } else {
      redf('server.error', err.message) // works in test
      lServerError(err.message) // works only in dev
    }
    console.log()
  }
}

const error = (err, req, res, next) => {
  let status
  const msg = err.message.toLowerCase()

  if (msg === 'no authorization token was found') {
    status = 401
    logError(err)
  } else if (msg.includes('no document found')) {
    status = 404
    logError(err)
  } else if (msg.includes('unknown route')) {
    status = 400
    logError(err)
  } else if (msg.includes('unexpected string in json')) {
    status = 400
    logError(err)
  } else {
    status = 500
    logError(err, true)
  }

  res.status(status)
  res.send()
}

app.use(error)

if (!module.parent) {
  app.listen(cfg.port, () => {
    lServer(`Events API is listening on port ${cfg.port}`)
  })
}

export default app
