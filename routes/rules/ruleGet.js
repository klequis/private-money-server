import wrap from 'routes/wrap'
import { findById } from 'db/dbFunctions'
import { RULES_COLLECTION_NAME, convertFieldValuesToUi } from 'db/constants'

// @ts-ignore
import { red, green, yellow, logRequest } from 'logger'

const ruleGet = wrap(async (req, res) => {
  try {
    const { params } = req
    const { ruleid } = params
    const f = await findById(RULES_COLLECTION_NAME, ruleid)
    res.send(convertFieldValuesToUi(f))
  } catch (e) {
    throw e
  }
})

export default ruleGet
