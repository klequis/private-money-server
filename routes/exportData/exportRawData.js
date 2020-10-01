import wrap from 'routes/wrap'
import rawDataToCsv from './rawDataToCsv'

// @ts-ignore
// eslint-disable-next-line
import { red, green, yellow } from 'logger'

const exportRawData = wrap(async (req, res, next) => {
  try {
    const ret = await rawDataToCsv()
    // yellow('ret', ret)
    res.send(JSON.stringify({ status: 'success', fileName: ret.fileName, rows: ret.rows }))
  } catch (e) {
    red('exportData ERROR', e.message)
    console.log(e)

    // TODO: incorrect data format
    res.send(JSON.stringify({ status: 'failure' }))
  }
})

export default exportRawData
