import wrap from 'routes/wrap'
import { find } from 'db'
import {
  convertCriteriaValuesToDb,
  TRANSACTIONS_COLLECTION_NAME
} from 'db/constants'
import { filterBuilder } from 'actions/filterBuilder'
import criteriaValidation from './criteriaTest.validation'

import { redf, green, logRequest } from 'logger'

const criteriaTest = wrap(async (req, res) => {
  const { body } = req

  if (body.length < 1) {
    redf('criteriaTest', 'body.length is 0')
  }

  const valid = criteriaValidation(body)

  if (valid.length > 0) {
    res.status(400).send({ data: null, error: 'Invalid criteria' })
  } else {
    const convertedCriteria = convertCriteriaValuesToDb(body)
    const filter = filterBuilder(convertedCriteria)
    const data = await find(TRANSACTIONS_COLLECTION_NAME, filter)
    const idOnly = data.map((doc) => doc._id)
    res.send({ data: idOnly, error: null })
  }
})

export default criteriaTest
