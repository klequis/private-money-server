import { createIndex, dropCollection, find, insertMany } from 'db'
import {
  ACCOUNTS_COLLECTION_NAME,
  TRANSACTIONS_COLLECTION_NAME,
  transactionFields as tFields
} from 'db/constants'
import csv from 'csvtojson'
import runRules from 'actions/runRules'
import { transformData } from './transformData'
import R from 'ramda'
import { fileExists } from 'lib/fileExists'
const path = require('path')

// eslint-disable-next-line
import { green, red, redf, yellow } from 'logger'

const _dropDatabases = async (loadRaw) => {
  await dropCollection(TRANSACTIONS_COLLECTION_NAME)
  await dropCollection('raw-data')
}

const _getAccounts = async () => {
  return find(ACCOUNTS_COLLECTION_NAME, {
    active: { $ne: false }
  })
}

/**
 *
 * @param {string} acctId
 * @param {array} rawData
 */
const _loadRawData = async (acctId, rawData) => {
  const data = R.map((doc) => R.mergeRight(doc, { acctId }), rawData)
  await insertMany('raw-data', data)
}

const _createIndices = async () => {
  await createIndex(TRANSACTIONS_COLLECTION_NAME, tFields.description.name, {
    collation: { caseLevel: true, locale: 'en_US' }
  })
  await createIndex(TRANSACTIONS_COLLECTION_NAME, tFields.type.name, {
    collation: { caseLevel: true, locale: 'en_US' }
  })
}
const chkAcctFilesExist = async (accounts) => {
  const all = await Promise.all(
    accounts.map(async (a) => {
      const fullName = path.join('data', a.dataFilename)
      return R.mergeRight(a, {
        fullName: fullName,
        exists: await fileExists(fullName)
      })
    })
  )

  return all.filter((a) => a.exists)
}

const _readCsvFile = async (account) => {
  const { dataFilename, hasHeaders } = account

  if (hasHeaders) {
    const json = await csv({
      trim: true,
      checkType: true,
      noheader: false,
      headers: []
    }).fromFile(`data/${dataFilename}`)
    return json
  } else {
    const json = await csv({
      trim: true,
      checkType: true,
      noheader: true,
      headers: []
    }).fromFile(`data/${dataFilename}`)
    return json
  }
}

const _insertToTransactionsCollection = async (data) => {
  await insertMany(TRANSACTIONS_COLLECTION_NAME, data)
  // return += inserted.length
}

const getAccountRawData = async (account) => _readCsvFile(account)

const mergeAccountsAndData = (data, accounts) => {
  let ret = []

  for (let i = 0; i < accounts.length; i++) {
    ret.push({
      account: accounts[i],
      data: data[i]
    })
  }
  return ret
}

const dataImport = async () => {
  await _dropDatabases()

  // const transformPipe = await R.pipe(
  //   _readCsvFile,

  //   // R.andThen(transformData)
  //   // R.andThen(_insertToTransactionsCollection)
  // )
  // const b = R.map(transformPipe, accounts)
  // yellow('b', b)
  // await _createIndices()
  // await runRules()

  const allAccts = await _getAccounts() // a database call
  const validAccts = await chkAcctFilesExist(allAccts)

  const allData = await Promise.all(R.map(getAccountRawData, validAccts))
  // yellow('allData', allData)
  const acctsWithData = mergeAccountsAndData(allData, validAccts)
  yellow('acctsWithData', acctsWithData)
  // yellow('o', allData.length)
  // const acct1 = accounts[0]

  // const p = R.mergeRight(

  // )

  // R.mergeRight(accounts, { data: o })
  // yellow('p', p)

  // yellow('o', o.length) // yellow is console.log with color
  // yellow('o', o[0][0])
  // yellow('acct1', acct1)

  return JSON.stringify([
    {
      operation: 'load data',
      status: 'success'
      // numDocsLoaded: docsInserted
    }
  ])
}

export default dataImport
