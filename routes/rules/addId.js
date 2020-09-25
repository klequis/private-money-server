/*
    Add
    - dbFunctions.repalceOne
    Write code to
    1. read each rule
    2. add _id: new ObjectID() to all criteria and actions
    3. use replaceOne to updtae it
*/

import wrap from 'routes/wrap'
import { RULES_COLLECTION_NAME } from 'db/constants'
import { find, findOneAndReplace } from 'db/dbFunctions'
import { mergeRight } from 'ramda'

// @ts-ignore
import { red, redf, green, yellow, logRequest } from 'logger'
import { ObjectID } from 'mongodb'

const addId = wrap(async (req, res) => {
  try {
    const f = await find(RULES_COLLECTION_NAME, {})

    f.forEach(doc => {
      const { _id, criteria, actions, acct } = doc
      const newCriteria = criteria.map(c =>
        mergeRight(c, { _id: new ObjectID() })
      )

      const newActions = actions.map(a =>
        mergeRight(a, { _id: new ObjectID() })
      )

      findOneAndReplace(
        RULES_COLLECTION_NAME,
        { _id: _id },
        {
          acctId: acct,
          criteria: newCriteria,
          actions: newActions
        }
      )
    })
    res.send('success')
  } catch (e) {
    throw e
  }
})

export default addId
