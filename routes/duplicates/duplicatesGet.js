import wrap from 'routes/wrap'
import { find } from 'db/dbFunctions'
import { TRANSACTIONS_COLLECTION_NAME, convertFieldValuesToUi } from 'db/constants'

// @ts-ignore
import { redf, yellow } from 'logger'

const duplicatesGet = wrap(async (req, res) => {
  try {
    const data = await find(TRANSACTIONS_COLLECTION_NAME, { duplicate: true })
    res.send(convertFieldValuesToUi(data))
  } catch (e) {
    redf('duplicates/duplicatesGet', e.message)
    console.log(e)
  }
})

export default duplicatesGet
