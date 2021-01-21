import wrap from 'routes/wrap'
import { find } from 'db/dbFunctions'
import {
  TRANSACTIONS_COLLECTION_NAME,
  convertFieldValuesToUi
} from 'db/constants'

// eslint-disable-next-line
import { redf, yellow } from 'logger'

const duplicatesGet = wrap(async (req, res) => {
  const data = await find(TRANSACTIONS_COLLECTION_NAME, { duplicate: true })
  res.send({ data: convertFieldValuesToUi(data), error: null })
})

export default duplicatesGet
