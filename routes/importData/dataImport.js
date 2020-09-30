import {
  createIndex,
  dropCollection,
  find,
  insertMany
} from 'db'
import {
  ACCOUNTS_COLLECTION_NAME,
  TRANSACTIONS_COLLECTION_NAME,
  transactionFields as tFields
} from 'db/constants'
import csv from 'csvtojson'
import runRules from 'actions/runRules'
import { _transformData } from './transformData'
import R from 'ramda'

// eslint-disable-next-line
import { green, red, redf, yellow } from 'logger'

const readCsvFile = async (file, hasHeaders) => {
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


const dropDatabases = async (loadRaw) => {
  await dropCollection(TRANSACTIONS_COLLECTION_NAME)
  if (loadRaw) {
    await dropCollection('raw-data')
  }
}

const getAccounts = async () => {
  return await find(ACCOUNTS_COLLECTION_NAME, {
    active: { $ne: false }
  })
}

const loadRawData = async (rawData) => {
  await insertMany('raw-data', rawData)
}

// const getRawData = 

const createIndices = async () => {
  await createIndex(TRANSACTIONS_COLLECTION_NAME, tFields.description.name, {
    collation: { caseLevel: true, locale: 'en_US' }
  })
  await createIndex(TRANSACTIONS_COLLECTION_NAME, tFields.type.name, {
    collation: { caseLevel: true, locale: 'en_US' }
  })
}

// TODO: debug
const accountCounts = (acctId) => {
  yellow('acctId', acctId)
  switch (acctId) {
    case 'cb.chase.amazon-visa.9497':
      return 55
    case 'cb.chase.checking.2465':
      return 199
    case 'cb.chase.saphire.8567':
      return 24
    case 'cb.chase.savings.2401': 
      return 23
    case 'sb.chase.business-visa.4468': 
      return 17
    case 'sb.chase.fredoom-visa.8820': 
      return 114
    case 'sb.citi.costco-visa.2791': 
      return 1032
    case 'sb.wells-farg.bu-market-rate-savings.09220': 
      return 25
    case 'sb.wells-fargo.checking.7795': 
      return 22
    case 'sb.wells-fargo.custom-management.3761': 
      return 64
    case 'sb.wells-fargo.way2save.6223': 
      return 18
    default: 
      return `${acctId} not found`
  }
  

}

const dataImport = async () => {
  try {
    let docsInserted = 0
    await dropDatabases()
    const accounts = await getAccounts()

    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i]

      const { dataFilename, hasHeaders } = accounts[i]

      // if (accounts[i].acctId === 'sb.citi.costco-visa.2791') {
      console.group(`account: ${accounts[i].acctId}`)
      const rawData = await readCsvFile(dataFilename, hasHeaders)
      loadRawData(rawData)

      const transformedData = _transformData(account, rawData)
      

      const inserted = await insertMany(TRANSACTIONS_COLLECTION_NAME, transformedData)
      green('rawData.length', rawData.length)
      green('transformeData.length', transformedData.length)
      green('inserted.length', inserted.length)
      // R.equals([1, 2, 3], [1, 2, 3]);

      const rowLen = accountCounts(accounts[i].acctId)
      if (rawData.length !== rowLen) red(`rawData: expected ${rowLen} rows but found ${rawData.length}`)
      if (transformedData.length !== rowLen) red(`transformedData: Expected ${rowLen} rows but found ${rawData.length}`)
      if (inserted.length !== rowLen) red(`inserted: expected ${rowLen} rows but found ${rawData.length}`)
      if (!R.equals([rawData.length, transformedData.length, inserted.length])) red(`row lengths do not match`)
      docsInserted += inserted.length
      console.groupEnd()
    }

    // }
    await createIndices()


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