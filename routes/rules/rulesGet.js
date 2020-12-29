import wrap from 'routes/wrap'
import { find } from 'db/dbFunctions'
import { RULES_COLLECTION_NAME } from 'db/constants'

// eslint-disable-next-line
import { red, green, yellow, logRequest } from 'logger'

const rulesGet = wrap(async (req, res) => {
  const f = await find(RULES_COLLECTION_NAME, {})
  res.send({ data: f, error: null })
})

export default rulesGet
