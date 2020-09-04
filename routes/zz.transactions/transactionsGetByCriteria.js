import wrap from 'routes/wrap'
import { find } from 'db'
import { TRANSACTIONS_COLLECTION_NAME, convertFieldValuesToUi } from 'db/constants'
import { filterBuilder } from 'actions/filterBuilder'

// eslint-disable-next-line
import { red, green, logRequest } from 'logger'

const dataGetByCriteria = wrap(async (req, res, next) => {
  const { body } = req
  // body is an array

  const { field, operation, value } = body
  const filter = filterBuilder([{ field, operation, value }])
  const data = await find(TRANSACTIONS_COLLECTION_NAME, filter)
  res.send(convertFieldValuesToUi(data))
})

export default dataGetByCriteria
