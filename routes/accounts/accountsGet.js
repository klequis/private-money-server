import { wrap } from 'routes/wrap'
import { find } from 'db/dbFunctions'
import { ACCOUNTS_COLLECTION_NAME } from 'db/constants'

// eslint-disable-next-line
import { red, green, yellow, logRequest } from 'logger'

const accountsGet = wrap(async (req, res) => {
  const f = await find(ACCOUNTS_COLLECTION_NAME, {})
  res.send({ data: f, error: null })
})

export default accountsGet
