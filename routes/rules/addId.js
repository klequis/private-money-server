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

// eslint-disable-next-line
import { red, redf, green, yellow, logRequest } from 'logger'
import { ObjectID } from 'mongodb'

// const omit = inputAction => {
//   const { action } = inputAction
//   // return { _id: new ObjectID(), action: 'omit' }
//   return mergeRight(inputAction, { _id: new ObjectID() })
// }

// const strip = inputAction => {
//   const { action, field, findValue, numAdditionalChars } = inputAction
//   return {
//     _id: new ObjectID(),
//     action: action,
//     field: field,
//     findValue: findValue,
//     numAdditionalChars: numAdditionalChars
//   }
// }

// const categorize = inputAction => {
//   const { action, category1, category2 } = inputAction
//   return {
//     _id: new Object()
//   }
// }

const addId = wrap(async (req, res) => {
  try {
    const f = await find(RULES_COLLECTION_NAME, {})

    f.forEach(doc => {
      const { _id, criteria, actions, acct } = doc
      // const { field, operation, value } = criteria
      // const newCriteria = criteria.map(c => ({
      //   _id: new ObjectID(),
      //   field: field,
      //   operation: operation,
      //   value: value
      // }))

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
          // _id: _id,
          acctId: acct,
          criteria: newCriteria,
          actions: newActions
        }
      )
    })
    res.send('success')
  } catch (e) {
    redf('addIn ERROR', e.message)
    console.log(e)
    res.send('failure')
  }
})

export default addId
