/*
  This version of send request has been modified
  to exclude functionality related to tokens

*/

import app from 'server'
import request from 'supertest'

// eslint-disable-next-line
import { green, yellow, redf } from 'logger'

const invalidMethodErrMsg = receivedMethod => {
  return `'method' must be one of ['post', 'delete', 'get', 'patch']. Received ${receivedMethod}`
}

const logSendRequest = (method, uri, status, body) => {
  console.log()
  console.group('logSendRequest')
  green('method', method)
  green('uri', uri)
  green('status', status)
  green('body', body)
  console.groupEnd()
  console.log()
}

const sendRequest = async ({
  method = '',
  uri = '',
  status,
  body,
  contentType = /json/,
  log = false
}) => {
  try {
    if (log) {
      logSendRequest(method, uri, status, body, contentType)
    }

    const methodToLower = method.toLowerCase()

    const validMethod = ['post', 'delete', 'get', 'patch'].includes(
      methodToLower
    )

    if (!validMethod) {
      throw new Error(invalidMethodErrMsg(method))
    }

    if (status === undefined || typeof status !== 'number') {
      throw new Error(`'status' must be a number`)
    }

    if (methodToLower === 'post') {
      const r = await request(app)
        .post(uri)
        .set('Accept', 'application/json')
        .send(body)
        .expect(status)
        .expect('Content-Type', contentType)
      return r
    }

    if (methodToLower === 'delete') {
      const r = await request(app)
        .delete(uri)
        .set('Accept', 'application/json')
        .send()
        .expect(status)
        .expect('Content-Type', /json/)
      return r
    }

    if (methodToLower === 'get') {
      const r = await request(app)
        .get(uri)
        .set('Accept', 'application/json')
        .send()
        .expect(status)
        .expect('Content-Type', /json/)
      return r
    }

    if (methodToLower === 'patch') {
      const r = await request(app)
        .patch(uri)
        .set('Accept', 'application/json')
        .send(body)
        .expect(status)
        .expect('Content-Type', /json/)
      return r
    }
  } catch (e) {
    redf('sendRequest ERROR', e.message)
    console.log(e)
  }
}

export default sendRequest
