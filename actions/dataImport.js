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
import R, { isNil } from 'ramda'
import runRules from './runRules'

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

const removeDoubleSpace = (value) => value.replace(/\s{2,}/g, ' ').trim()
const toIsoString = (value) => {
  const newValue = new Date(value).toISOString()
  return newValue
}

const evolver = {
  description: R.pipe(removeDoubleSpace, R.trim),
  origDescription: R.pipe(removeDoubleSpace, R.trim),
  date: toIsoString,
  credit: R.pipe(
    R.cond([
      [R.gt(R.__, 0), (x) => x],
      [R.T, R.always(0)]
    ])
  ),
  debit: R.pipe(
    R.cond([
      [R.lt(R.__, 0), (x) => x],
      [R.T, R.always(0)]
    ])
  )
}

const parseFieldValue = (parse, value) => {
  if (parse === '>0') {
    return value > 0 ? value : 0
  }
  if (parse === '<0') {
    return value < 0 ? value : 0
  }
  if (parse === 'reverseSign') {
    return value * -1
  }
}

const _stripDollarSign = (value) => {
  if (R.type(value) === 'String' && value.startsWith('$')) {
    return Number(value.slice(1))
  }
  return value
}

const getFieldValue = (fieldCol) => (doc) => {
  if (R.type(fieldCol) === 'Undefined') {
    return ''
  }
  const { col, parse } = fieldCol
  const value = _stripDollarSign(R.prop(`field${col}`)(doc)) || ''
  if (!isNil(parse)) {
    return parseFieldValue(parse, value)
  }
  return value
}

const _transformData = (account, data) => {
  const { fieldToCol, acctId } = account
  // console.log('fieldToCol', fieldToCol)
  console.log('acctId', acctId);
  try {
    const mapToFields = (doc) => {
      red('doc', doc)
      const ret = {
        acctId,
        date: getFieldValue(R.prop(tFields.date.name)(fieldToCol))(doc),
        description: getFieldValue(
          R.prop(tFields.description.name)(fieldToCol)
        )(doc),
        origDescription: getFieldValue(
          R.prop(tFields.description.name)(fieldToCol)
        )(doc),
        credit: getFieldValue(R.prop(tFields.credit.name)(fieldToCol))(doc),
        debit: getFieldValue(R.prop(tFields.debit.name)(fieldToCol))(doc),
        category1: 'none',
        category2: '',
        checkNumber: getFieldValue(R.prop(tFields.checkNumber)(fieldToCol))(
          doc
        ),
        type: getFieldValue(R.prop(tFields.type.name.name)(fieldToCol))(doc),
        omit: false
      }
      return ret
    }

    const transform = R.compose(
      R.evolve(evolver),
      mapToFields
    )
    return R.map(transform, data)
  } catch (e) {
    red(tFields.acctId.name, acctId)
    red('ftc', fieldToCol)
    redf('_transformDataNew ERROR', e.message)
    console.log(e)
  }
}

const dataImport = async (loadRaw = false) => {
  try {
    let docsInserted = 0
    await dropCollection(TRANSACTIONS_COLLECTION_NAME)
    if (loadRaw) {
      await dropCollection('data-all')
    }
    const accounts = await find(ACCOUNTS_COLLECTION_NAME, {
      active: { $ne: false }
    })

    for (let i = 0; i < accounts.length; i++) {
      const { name: dataFileName, hasHeaders } = accounts[i].dataFile
      const dataFileHasHeaders = hasHeaders === false ? hasHeaders : true
      const rawData = await readCsvFile(dataFileName, dataFileHasHeaders)
      
      if (loadRaw) {
        await insertMany('raw-data', rawData)
      }
      red('1. **********************')
      const transformedData = _transformData(accounts[i], rawData)
      const inserted = await insertMany(TRANSACTIONS_COLLECTION_NAME, transformedData)
      docsInserted += inserted.length
      // }
    }
    await createIndex(TRANSACTIONS_COLLECTION_NAME, tFields.description.name, {
      collation: { caseLevel: true, locale: 'en_US' }
    })
    await createIndex(TRANSACTIONS_COLLECTION_NAME, tFields.type.name, {
      collation: { caseLevel: true, locale: 'en_US' }
    })
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
