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
import R, { empty, isNil } from 'ramda'
import runRules from './runRules'
import isNilOrEmpty from 'lib/isNilOrEmpty'

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
const convertEmptyToZero = (value) => R.isEmpty(value) ? 0 : value
const _stripDollarSign = (value) => {
  if (R.type(value) === 'String' && value.startsWith('$')) {
    return Number(value.slice(1))
  }
  return value
}
const parseFieldValue = (reverseSign, value) => {
  // console.log('parseFieldValue: reverseSign', reverseSign)
  // console.log('parseFieldValue: value', value)

  return reverseSign ? value * -1 : value

  // I think this was to swap the values and isn't needed?
  // if (parse === '>0') {
  //   return value > 0 ? value : 0
  // }
  // if (parse === '<0') {
  //   return value < 0 ? value : 0
  // }
  // if (parse === 'reverseSign') {
  //   return value * -1
  // }
}

const evolver = (fieldToCol) => {
  // console.log('evolver: fieldToCol', fieldToCol)

  const { reverseSign: creditSign } = fieldToCol.credit
  const reverseSignCredit = creditSign == undefined ? false : true

  const { reverseSign: debitSign } = fieldToCol.debit
  const reverseSignDebit = debitSign == undefined ? false : true

  return {
    description: R.pipe(removeDoubleSpace, R.trim),
    origDescription: R.pipe(removeDoubleSpace, R.trim),
    date: toIsoString,
    credit: R.pipe(
      _stripDollarSign,
      convertEmptyToZero,
      x => reverseSignCredit ? parseFieldValue(reverseSignCredit, x) : x
    ),
    debit: R.pipe(
      _stripDollarSign,
      convertEmptyToZero,
      x => reverseSignDebit ? parseFieldValue(reverseSignDebit, x) : x
    ),
  }
}

// const getFieldValue = (account) => (doc) => {
//   // receives a field from an account and a doc
//   console.group('getFieldValue')
//   console.log('account', account)
//   console.log('doc', doc)
//   console.groupEnd()
//   const { hasAmountField, reversSignAmount } = account


//   // const fieldName = `field${col}`
//   // const value = R.prop(`field${col}`)(doc)
//   // const value = R.prop()
//   // if (!isNil(parse)) {
//   //   return parseFieldValue(parse, value)
//   // }
//   // return value
// }

const getColNum = (fieldName, account) => {
  // console.log('--------------------------------')
  const { colMap } = account
  // console.group('getColNum')
  // console.log('getColNumb: account', account)
  // console.log('fieldName', fieldName)
  const num = colMap[fieldName]
  // console.log('getColNumb: num', num)
  // console.groupEnd()
  return num

}

const getFieldValue = (colNum, doc) => {
  console.log('--------------------------------')
  console.group('getFieldValue')
  console.log('getFieldValue: colNum', colNum)
  // console.log('getFieldValue: doc', doc)
  const value = R.prop(`field${colNum}`)(doc)
  console.log('getFieldValue: value', value)
  console.groupEnd()
  return value
}

const _transformData = (account, data) => {
  const { colMap, acctId } = account

  try {
    const mapToFields = (doc) => {
      // console.group(`_transformData: acctId: ${acctId}`)
      // console.log('fieldToCol', fieldToCol)
      // console.log('doc', doc)
      // console.groupEnd()
      const ret = {
        acctId,
        // sending it a field from an account and a doc

        // date: getFieldValue(R.prop(tFields.date.name)(account))(doc),
        date: getFieldValue(
          
            getColNum(tFields.date.name, account),
            doc
          ),
      

        // description: getFieldValue(
        //   R.prop(tFields.description.name)(account)
        // )(doc),
        description: getFieldValue(getColNum(tFields.description.name), doc),

        // origDescription: getFieldValue(
        //   R.prop(tFields.description.name)(account)
        // )(doc),
        origDescription: getFieldValue(getColNum(tFields.description.name), doc),

        // credit: getFieldValue(R.prop(tFields.credit.name)(account))(doc),
        credit: getFieldValue(getColNum(tFields.credit.name), doc),

        // debit: getFieldValue(R.prop(tFields.debit.name)(account))(doc),
        debit: getFieldValue(getColNum(tFields.debit.name), doc),
        category1: 'none',
        category2: '',
        // checkNumber: getFieldValue(R.prop(tFields.checkNumber)(account))(
        //   doc
        // ),
        checkNumber: getFieldValue(getColNum(tFields.checkNumber.name), doc),
        // type: getFieldValue(R.prop(tFields.type.name.name)(account))(doc),
        type: getFieldValue(getColNum(tFields.type.name), doc),
        omit: false
      }
      return ret
    }
    // yellow('fieldToCol', fieldToCol)

    // const { reverseSign } = colMap
    // console.log('acctId', acctId)
    // console.log('fieldToCol', colMap)
    // console.log('reverseSign', reverseSign)
    const transform = R.pipe(
      mapToFields,
      // R.tap(printCreditDebit('bef')),
      // R.evolve(evolver(account)),
      // R.tap(printCreditDebit('aft')),
    )
    return R.map(transform, data)
  } catch (e) {
    red(tFields.acctId.name, acctId)
    red('ftc', colMap)
    redf('_transformDataNew ERROR', e.message)
    console.log(e)
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

const dataImport = async () => {
  try {
    let docsInserted = 0
    await dropDatabases()
    const accounts = await getAccounts()

    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i]

      const { dataFilename, hasHeaders } = accounts[i]

      // if (accounts[i].acctId === 'sb.citi.costco-visa.2791') {
      const rawData = await readCsvFile(dataFilename, hasHeaders)

      green('rawData.length', rawData.length)
      loadRawData(rawData)

      const transformedData = _transformData(account, rawData)
      green('transformeData.length', transformedData.length)

      const inserted = await insertMany(TRANSACTIONS_COLLECTION_NAME, transformedData)
      green('inserted.length', inserted.length)

      docsInserted += inserted.length
      console.log('------------------------------------------')
      // }

    }
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
