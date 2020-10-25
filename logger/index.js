/* istanbul ignore file */
import chalk from 'chalk'
import * as R from 'ramda'

const log = console.log

const checkValue = (value) => {
  if (R.isEmpty(value) || R.isNil(value)) {
    return ''
  } else {
    return value
  }
}



export const red = R.curry((message, value) => {
  log(chalk.bgRed(` ${message} `), checkValue(value))
})

export const green = R.curry((message, value) => {
  log(chalk.bgGreen(` ${message} `), checkValue(value))
})
export const yellow = R.curry((message, value) => {
  log(chalk.bgYellow(chalk.black(` ${message} `)), checkValue(value))
})
export const blue = R.curry((message, value) => {
  log(chalk.bgBlue(` ${message} `), checkValue(value))
})
export const redf = R.curry((message, value) => {
  log(chalk.red(`${message}`), checkValue(value))
})
export const greenf = R.curry((message, value) => {
  log(chalk.green(`${message}`), checkValue(value))
})
export const yellowf = R.curry((message, value) => {
  log(chalk.yellow(`${message}`), checkValue(value))
})
export const bluef = R.curry((message, value) => {
  log(chalk.blue(`${message}`), checkValue(value))
})

export const logResponse = (res) => {
  console.log('******************')
  const r = {
    text: res.text,
    body: res.body,
    headers: res.headers,
    status: res.status,
    ok: res.ok,
    clientError: res.clientError,
    serverError: res.serverError,
    // error: res.error,
    type: res.type,
    charset: res.charset
  }
  if (res.ok) {
    log(chalk.bgGreen('response'), r)
  } else {
    log(chalk.bgRed('response'), r)
  }
}

export const logRequest = (req) => {
  // console.Group('** logRequest **')
  const r = {
    // method: req.method,

    text: req.text,
    body: req.body,
    params: req.params
    // headers: req.headers,
    // clientError: res.clientError,
    // serverError: res.serverError,
    // error: res.error,
    // type: req.type,
    // charset: res.charset
  }
  console.log('***************************************')

  log(chalk.bgGreen('request'), r)
  // if (res.ok) {
  //   log(chalk.bgGreen('response'), r)
  // } else {
  //   log(chalk.bgRed('response'), r)
  // }
}

export const _log = (label) => (message) => {
  if (label === 'start') {
    console.log()
    return green('start ----------------------- /n')
  }
  if (label === 'end') {
    return green('end -----------------------')
  }
  if (label === 'initial') {
    return yellow(label, message)
  }
  return yellow(label, message)
}

export const logCriteria = (callerName, criteria) =>
  yellow(`${callerName}.criteria`, criteria)

export const logActions = (callerName, actions) =>
  yellow(`${callerName}.actions`, actions)

export const logFilter = (callerName, filter) => {
  console.log('-------------------------------')
  if (R.has('$and')(filter)) {
    yellow('filter', filter)
    filter.$and.map((v) => console.log(v))
  } else {
    yellow(`${callerName}.filter`, filter)
  }
  console.log('-------------------------------')
}
