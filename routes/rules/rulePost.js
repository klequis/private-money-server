import wrap from 'routes/wrap'
import { RULES_COLLECTION_NAME, convertCriteriaValuesToDb } from 'db/constants'
import { insertOne } from 'db/dbFunctions'
import { mergeRight } from 'ramda'
import { ObjectID } from 'mongodb'
import runRules from 'actions/runRules'

// eslint-disable-next-line
import { yellow, redf } from 'logger'

const replaceTmpId = obj => {
  return mergeRight(obj, { _id: ObjectID() })
}

const rulePost = wrap(async (req, res) => {
  try {
    const { body } = req
    // new rule could be sent with tmp ids. Remove them
    const { criteria, actions } = body
    // yellow('rulePost: criteria', criteria)
    // yellow('rulePost: actions', actions)

    // Change number types to number
    const convertedCriteria = convertCriteriaValuesToDb(criteria)
    // yellow('rulePost: convertedCriteria', convertedCriteria)

    const newRule = {
      criteria: convertedCriteria.map(c => replaceTmpId(c)),
      actions: actions.map(a => replaceTmpId(a))
    }
    // yellow('rulePost: newRule', newRule)

    const i = await insertOne(RULES_COLLECTION_NAME, newRule)
    yellow('rulePost: inserted', i)
    const { _id } = i[0]
    await runRules()
    res.send({ _id: _id })
  } catch (e) {
    throw e
    // redf('rules.newRule.rulePost: ERROR', e.message)
    // console.log(e)
  }
})

export default rulePost
