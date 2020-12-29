import wrap from 'routes/wrap'
import {
  convertCriteriaValuesToDb,
  TRANSACTIONS_COLLECTION_NAME,
  RULES_COLLECTION_NAME
} from 'db/constants'

import { findOneAndUpdate, find } from 'db'
import runRules from 'actions/runRules'
import { toString } from 'lib'
import { ObjectId } from 'mongodb'

/*
  rulePatch can receive a rule with
  a. updated criteria
  b. updated action
  c. new action
  d. removed action

  1. remove the ruleId of the passed in rule from all docs in data that have it
     - it will get added back when the rules are run
  2. update the rule
  3. run all rules

  Since runRules always modifies 'origDescription', there is no need to restore
  'description' to 'origDescription'

*/

// eslint-disable-next-line
import { red, redf, green, yellow, logRequest } from 'logger'

const rulePatch = wrap(async (req, res) => {
  yellow('rulePatch', 'PATCH')
  const { body, params } = req

  const newRule = body
  const { _id, criteria, actions } = newRule
  const { ruleid: paramsId } = params

  if (toString(paramsId) !== toString(_id)) {
    throw new Error(
      `_id in params ${paramsId} does not match _id in body ${_id}`
    )
  }

  const convertedCriteria = convertCriteriaValuesToDb(criteria)

  // TODO check if is likely mongodb_id before trying to convert
  const id = ObjectId.createFromHexString(_id)

  const f = await find(TRANSACTIONS_COLLECTION_NAME, {
    ruleIds: id
  })

  for (let i = 0; i < f.length; i++) {
    const doc = f[i]
    const { _id, origDescription } = doc
    await findOneAndUpdate(
      TRANSACTIONS_COLLECTION_NAME,
      { _id: _id },
      {
        $pull: { ruleIds: id },
        $unset: { category1: '', category2: '' },
        $set: { description: origDescription }
      }
    )
  }

  await findOneAndUpdate(
    RULES_COLLECTION_NAME,
    { _id: paramsId },
    {
      $set: { criteria: convertedCriteria, actions: actions }
    },
    false
  )

  await runRules()
  // findOneAndUpdate returns an array even though it always returns one item.
  // Send only the item to the client

  // TODO: incorrect data format
  res.send({ tmp: 'hi' })
  // res.send(updatedRule[0])
})

export default rulePatch
