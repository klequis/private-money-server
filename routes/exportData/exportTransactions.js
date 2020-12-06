import wrap from 'routes/wrap'
import transactionsToCsv from './transactionsToCsv'

// eslint-disable-next-line
import { red, green, yellow } from 'logger'

const exportTransactions = wrap(async (req, res, next) => {
  try {
    const ret = await transactionsToCsv()
    res.send(JSON.stringify({ status: 'success', fileName: ret.fileName, rows: ret.rows }))
  } catch (e) {
    red('exportData ERROR', e.message)
    console.log(e)

    // TODO: incorrect data format
    res.send(JSON.stringify({ status: 'failure' }))
  }
})

export default exportTransactions
