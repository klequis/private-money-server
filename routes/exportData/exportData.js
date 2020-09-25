import wrap from 'routes/wrap'
import writeToCsvFile from './jsonToCsv'

// eslint-disable-next-line
import { red, green, yellow } from 'logger'

const exportData = wrap(async (req, res, next) => {
  try {
    const ret = await writeToCsvFile()
    // yellow('ret', ret)
    res.send(JSON.stringify({ status: 'success', fileName: ret.fileName, rows: ret.rows }))
  } catch (e) {
    red('exportData ERROR', e.message)
    console.log(e)

    // TODO: incorrect data format
    res.send(JSON.stringify({ status: 'failure' }))
  }
})

export default exportData
