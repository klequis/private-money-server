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
import { green, red, redf, yellow, greenf } from 'logger'

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

const _chkAcctFilesExist = async (accounts) => {
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

const zipFn = (data, acct) => {
  return {
    account: acct,
    data: data.data
  }
}

const mergeAccountsAndData = (data, accounts) => {
  return R.zipWith(zipFn, data, accounts)
}

const _printAcctNumChk = (acctWithData) => {
  const { account, data } = acctWithData
  const { acctId, expectedTxCount } = account
  /* data shape is
    {
      acctid: '1234'
      data: [
        {}, {}
      ]
    }

    Pick just the data
  */

  const dataLen = data.length
  const msg = `expected ${expectedTxCount}, actual ${dataLen}`
  dataLen === expectedTxCount ? greenf(acctId, msg) : redf(acctId, msg)
}

const dataImport = async () => {
  await _dropDatabases()

  const allAccts = await _getAccounts() // a database call

  const validAccts = await _chkAcctFilesExist(allAccts)

  /*
      returns [
        {
          acctId: '1234'
          data: [
            {}, {}
          ]
        }
      ]
  */
  const allData = await Promise.all(R.map(readCsvFile, validAccts))

  /*
      returns [
        {
          account: {}
          data: [
            {}, {}
          ]
        }
      ]
  */
  const acctsWithData = mergeAccountsAndData(allData, validAccts)

  R.forEach(_printAcctNumChk, acctsWithData)

  const finalData = R.unnest(R.map(transformData, acctsWithData))
  const inserted = await insertMany(TRANSACTIONS_COLLECTION_NAME, finalData)
  await _createIndices()
  // TODO: re-enable
  await runRules()
  return inserted
}

export default dataImport
