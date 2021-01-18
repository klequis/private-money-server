import { find } from 'db'
import fs from 'fs'
import { parse } from 'json2csv'

// eslint-disable-next-line
import { yellow, redf } from 'logger'

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
  return `${datePart}.raw-data.csv`
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

const rawDataToCsv = async () => {
  try {
    const data = await find('raw-data')
    const csv = parse(data)
    const fileName = await writeFile(csv)
    return { fileName, rows: 999 }
  } catch (e) {
    redf('writeCsvFile ERROR', e.message)
    console.log(e)
    return { message: e.message }
  }
}

export default rawDataToCsv
