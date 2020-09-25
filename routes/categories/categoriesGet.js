import wrap from 'routes/wrap'
import { find } from 'db'
import { CATEGORIES_COLLECTION_NAME } from 'db/constants'

// eslint-disable-next-line
import { green, logRequest } from 'logger'

const categories = wrap(async (req, res, next) => {
  const data = await find(CATEGORIES_COLLECTION_NAME, {})
  // TODO: incorrect data format
  res.send(data)
})

export default categories
