import wrap from 'routes/wrap'
import dataImport from 'actions/dataImport'

// eslint-disable-next-line
import { green, yellow } from 'logger'

const importData = wrap(async (req, res, next) => {
  const ld = await dataImport(true)
  res.send(JSON.stringify({ dataLoaded: ld }))
})

export default importData
