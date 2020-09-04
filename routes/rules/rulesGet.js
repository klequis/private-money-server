import wrap from 'routes/wrap'
import { find } from 'db/dbFunctions'
import { RULES_COLLECTION_NAME } from 'db/constants'

// eslint-disable-next-line
import { red, green, yellow, logRequest } from 'logger'

const rulesGet = wrap(async (req, res) => {
  const f = await find(RULES_COLLECTION_NAME, {})
  // f.forEach(r => {
  //   const { criteria } = r
  // })
  res.send(f)
})

export default rulesGet
