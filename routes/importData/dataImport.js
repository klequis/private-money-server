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

const _readCsvFile = async (file, hasHeaders) => {
  try {
    if (hasHeaders) {
      const json = await csv({
        trim: true,
        checkType: true,
        noheader: false,
        headers: []
      }).fromFile(`data/${file}`)
      return json
    } else {
      const json = await csv({
        trim: true,
        checkType: true,
        noheader: true,
        headers: []
      }).fromFile(`data/${file}`)
      return json
    }
  } catch (e) {
    redf('readCSVFile ERROR:', `File ${file} not found.`)
  }
}

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

const dataImport = async () => {
  try {
    await _dropDatabases()
    const a = await _getAccounts()
    const accounts = await chkAcctFilesExist(a)
    let docsInserted = 0
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i]
      const { acctId, dataFilename, hasHeaders } = account
      console.group(`account: ${account.acctId}`)
      const rawData = await _readCsvFile(dataFilename, hasHeaders)
      _loadRawData(acctId, rawData)
      const transformedData = transformData(account, rawData)
      const inserted = await insertMany(
        TRANSACTIONS_COLLECTION_NAME,
        transformedData
      )
      // eslint-disable-next-line
      if (true) {
        green('rawData.length', rawData.length)
        green('transformeData.length', transformedData.length)
        green('inserted.length', inserted.length)
      }
      docsInserted += inserted.length
      console.groupEnd()
    }
    await _createIndices()

    // TODO: re-enable
    await runRules()

    return JSON.stringify([
      {
        operation: 'load data',
        status: 'success',
        numDocsLoaded: docsInserted
      }
    ])
  } catch (e) {
    redf('dataImport ERROR:', e.message)
    console.log(e)
    return JSON.stringify([{}])
  }
}

export default dataImport
