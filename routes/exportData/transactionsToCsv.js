import { find } from 'db'
import { TRANSACTIONS_COLLECTION_NAME, transactionFields as tFields } from 'db/constants'
import fs from 'fs'
import * as R from 'ramda'

// eslint-disable-next-line
import { yellow, redf } from 'logger'

const jsonToCsv = (json) => {
  const replacer = (key, value) => (value === null ? '' : value) // specify how you want to handle null values here
  const header = [
    tFields.acctId.name,
    tFields.date.name,
    tFields.description.name,
    // tFields.debit.name,
    // tFields.credit.name,
    tFields.amount.name,
    tFields.category1.name,
    tFields.category2.name,
    tFields.checkNumber.name,
    tFields.origDescription.name,
    tFields.type.name,
    tFields.omit.name,
    '_id'
  ]

  // let csv = json
  //   .map(row =>
  //     header.map(fieldName => {
  //       const d =
  //         fieldName === 'date'
  //           ? format(new Date(row[fieldName]), 'MM/dd/yyyy')
  //           : row[fieldName]
  //       return JSON.stringify(d, replacer)
  //     })
  //   )
  //   .join(',')

  let csv = json.map((row) =>
    header
      .map((fieldName) => JSON.stringify(row[fieldName], replacer))
      .join(',')
  )
  csv.unshift(header.join(','))
  csv = csv.join('\r\n')
  return csv
}

const getMonthPlusOne = date => {
  const a = date.getMonth() + 1
  return a.toString().padStart(2, '0')
}

const makeFileName = () => {
  // yes this is ugly
  const d = new Date()
  const year = d.getFullYear()
  // yellow('year', year)
  const month = getMonthPlusOne(d)
  // yellow('month', month)
  const day = d.getDate().toString().padStart(2, '0')
  // yellow('day', day)
  const hour = d.getHours().toString().padStart(2, '0')
  // yellow('hour', hour)
  const minute = d.getMinutes().toString().padStart(2, '0')
  // yellow('minutes', minute)
  const second = d.getSeconds().toString().padStart(2, '0')
  // yellow('seconds', second)
  const datePart = `${year}${month}${day}-${hour}${minute}${second}`
  return `${datePart}.income-expense.csv`
}

const writeFile = async (csv) => {
  const fileName = `/home/klequis/Documents/income-expense.wk/${makeFileName()}`
  await fs.promises.writeFile(
    // `/home/klequis/Downloads/${format(new Date(), 'ddMMyyyy')}data.csv`,
    fileName,
    csv,
    'utf8'
  )
  return fileName
}

const addDiff = (doc) => {
  // yellow('doc', doc)
  const { debit, credit } = doc
  const ret = R.mergeRight(doc, { amount: R.sum([debit, credit]) })
  // yellow('ret', ret)
  return ret
}

const transactionsToCsv = async () => {
  try {
    const data = await find(TRANSACTIONS_COLLECTION_NAME, { omit: false })
    // const a = R.map(addDiff, data)
    const csvData = jsonToCsv(data)
    const fileName = await writeFile(csvData)
    return { fileName, rows: data.length }
  } catch (e) {
    redf('writeCsvFile ERROR', e.message)
    console.log(e)
    return { message: e.message }
  }
}

export default transactionsToCsv
