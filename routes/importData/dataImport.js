import { createIndex, dropCollection, find, insertMany } from 'db'
import {
  ACCOUNTS_COLLECTION_NAME,
  TRANSACTIONS_COLLECTION_NAME,
  transactionFields as tFields
} from 'db/constants'
import { readCsvFile } from './readCvsFile'
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

const _insertToTransactionsCollection = async (data) => {
  await insertMany(TRANSACTIONS_COLLECTION_NAME, data)
  // return += inserted.length
}

const getAccountRawData = async (account) => readCsvFile(account)

const zipFn = (data, acct) => {
  return {
    account: acct,
    data: data
  }
}

const mergeAccountsAndData = (data, accounts) => {
  return R.zipWith(zipFn, data, accounts)
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
  const a = R.sum(R.map((x) => R.append(x.length, []), allData))
  yellow('allData.length', a)
  const acctsWithData = mergeAccountsAndData(allData, validAccts)

  const finalData = R.unnest(R.map(transformData, acctsWithData))
  yellow('finalData.length', finalData.length)
  const inserted = await insertMany(TRANSACTIONS_COLLECTION_NAME, finalData)
  yellow('inserted.length', inserted.length)

  // yellow('acctsWithData', acctsWithData)
  // yellow('o', allData.length)
  // const acct1 = accounts[0]

  // const p = R.mergeRight(

  // )

  // R.mergeRight(accounts, { data: o })
  // yellow('p', p)

  // yellow('o', o.length) // yellow is console.log with color
  // yellow('o', o[0][0])
  // yellow('acct1', acct1)

  // return JSON.stringify([
  //   {
  //     operation: 'load data',
  //     status: 'success'
  //     // numDocsLoaded: docsInserted
  //   }
  // ])
  // return JSON.stringify(allAccts)
  return inserted
}

export default dataImport
