import wrap from 'routes/wrap'
import dataImport from './dataImport'

// @ts-ignore
// eslint-disable-next-line
import { green, yellow } from 'logger'

const importData = wrap(async (req, res, next) => {
  const ld = await dataImport()
  res.send(JSON.stringify({ dataLoaded: ld }))
})

export default importData
