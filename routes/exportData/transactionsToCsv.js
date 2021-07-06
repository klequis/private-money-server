import { find } from 'db'
import {
  TRANSACTIONS_COLLECTION_NAME,
  transactionFields as tFields
} from 'db/constants'
import fs from 'fs'
import * as R from 'ramda'
import { format } from 'date-fns'

// eslint-disable-next-line
import { yellow, redf } from 'logger'

const jsonToCsv = (json) => {
  const replacer = (key, value) => (value === null ? '' : value) // specify how you want to handle null values here
  const header = [
    tFields.txType.name,
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

const getMonthPlusOne = (date) => {
  const a = date.getMonth() + 1
  return a.toString().padStart(2, '0')
}

const makeFileName = () => {
  // yes this is ugly
  const d = new Date()
  const year = d.getFullYear()
  const month = getMonthPlusOne(d)
  const day = d.getDate().toString().padStart(2, '0')
  const hour = d.getHours().toString().padStart(2, '0')
  const minute = d.getMinutes().toString().padStart(2, '0')
  const second = d.getSeconds().toString().padStart(2, '0')
  const datePart = `${year}${month}${day}-${hour}${minute}${second}`
  return `${datePart}.income-expense.csv`
}

const writeFile = async (csv) => {
  const fileName = `/home/klequis/Documents/${makeFileName()}`
  await fs.promises.writeFile(
    // `/home/klequis/Downloads/${format(new Date(), 'ddMMyyyy')}data.csv`,
    fileName,
    csv,
    'utf8'
  )
  return fileName
}

// const addDiff = (doc) => {
//   const { debit, credit } = doc
//   const ret = R.mergeRight(doc, { amount: R.sum([debit, credit]) })
//   return ret
// }

const transactionsToCsv = async () => {
  try {
    const data = await find(TRANSACTIONS_COLLECTION_NAME, { omit: false })
    const dataFormatted = data.map((row) => {
      return R.mergeRight(row, {
        date: format(new Date(row.date), 'MM/dd/yyyy'),
        txType: row.category1 === 'income' ? 'income' : 'expense'
      })
    })
    // const a = R.map(addDiff, data)
    const csvData = jsonToCsv(dataFormatted)
    const fileName = await writeFile(csvData)
    return { fileName, rows: data.length }
  } catch (e) {
    redf('writeCsvFile ERROR', e.message)
    console.log(e)
    return { message: e.message }
  }
}

export default transactionsToCsv
