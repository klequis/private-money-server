import wrap from 'routes/wrap'
import { find } from 'db'
import { convertCriteriaValuesToDb, TRANSACTIONS_COLLECTION_NAME } from 'db/constants'
import { filterBuilder } from 'actions/filterBuilder'
import criteriaValidation from './criteriaTest.validation'

// @ts-ignore
import { redf, green, logRequest } from 'logger'

const criteriaTest = wrap(async (req, res) => {
  
  // try {
    const { body } = req
    // body is an array

    if (body.length < 1) {
      redf('criteriaTest', 'body.length is 0')
    }

    
    const valid = criteriaValidation(body)
    green('valid', valid)
    // if (valid.length === 0) {
    //   green('criteriaTest.criteriaValidation', 'no errors')
    // } else {
    //   redf('ERROR: criteriaTest.criteriaValidation', valid)
    // }

    if (valid.length > 0) {
      res.status(400).send({ data: null, error: 'Invalid criteria'})
    } else {
      const convertedCriteria = convertCriteriaValuesToDb(body)
      const filter = filterBuilder(convertedCriteria)
      const data = await find(TRANSACTIONS_COLLECTION_NAME, filter)
      // 2020.09.14 - change from descriptionOnly to _idOnly
      // const descriptionsOnly = data.map(doc => doc.origDescription)
      // res.send(descriptionsOnly)
      const idOnly = data.map(doc => doc._id)
      res.send({ data: idOnly, error: null})
    }

    
  // } catch (e) {g
  //   throw e
  // }
})

export default criteriaTest
