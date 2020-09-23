import wrap from 'routes/wrap'
import { find } from 'db'
import { convertCriteriaValuesToDb, TRANSACTIONS_COLLECTION_NAME } from 'db/constants'
import { filterBuilder } from 'actions/filterBuilder'
import criteriaValidation from './criteriaTest.validation'
// import { mergeRight } from 'ramda'

// eslint-disable-next-line
import { redf, green, logRequest } from 'logger'

const criteriaTest = wrap(async (req, res) => {
  
  try {
    const { body } = req
    // body is an array
    // green('criteriaTest: body', body)

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
      res.status(400).send({ result: null, errors: valid})
    } else {
      const convertedCriteria = convertCriteriaValuesToDb(body)

      // green('convertedCriteria', convertedCriteria)
  
      const filter = filterBuilder(convertedCriteria)
      // green('criteriaTest: filter', filter)
      const data = await find(TRANSACTIONS_COLLECTION_NAME, filter)
      // 2020.09.14 - change from descriptionOnly to _idOnly
      // const descriptionsOnly = data.map(doc => doc.origDescription)
      // res.send(descriptionsOnly)
      const idOnly = data.map(doc => doc._id)
      res.send(idOnly)
    }

    
  } catch (e) {
    throw e
    // redf('criteriaTest ERROR', e.message)
    // console.log(e)
  }
})

export default criteriaTest
