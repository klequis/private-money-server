import wrap from 'routes/wrap'
import { executeAggregate, find } from 'db/dbFunctions'
import { TRANSACTIONS_COLLECTION_NAME } from 'db/constants'
import { ObjectID, ObjectId } from 'mongodb'

// eslint-disable-next-line
import { red, green, yellow, logRequest, _log } from 'logger'

/**
 * @name de-dup-incremental-import
 */

/* PROCESS
   For each account
   1. Find overlap of dates in existing & new data.
   2. Combine into one collection
      2.1 Must add field dupType: existing || new
   3. Group with count
   For each group
   1. Get number of existing and number of new
   2. Apply rules as outlined in 'guessing.ods'
   3. Remove
*/

const test = wrap(async (req, res) => {
  const match1 = {
    $match: {}
  }

  // const project1 = {
  //   $project: {
  //     _id: 1,
  //     acctId: 1,
  //     date: 1,
  //     description: 1,
  //     origDescription: 1,
  //     amount: 1,
  //     category1: 1,
  //     category2: 1,
  //     checkNumber: 1,
  //     type: 1,
  //     omit: 1,
  //     ruleIds: 1
  //   }
  // }

  // const addFields = {
  //   $addFields: {
  //     test:
  //   }
  // }

  // const project1 = {
  //   $project: {
  //     _id: 0,
  //     category1: 1,
  //     ruleIds: 1
  //   }
  // }
  const q = [match1, project1]

  const ret = await executeAggregate(TRANSACTIONS_COLLECTION_NAME, q)

  res.send(ret)
})

export default test

// combined
// ruleRadio: {
//   $switch: {
//     branches: [
//       {
//         case: { $or: [{
//             // Check about no Company key
//             ruleIds: {
//               $exists: false
//             }
//           }, {
//             // Check for null
//             ruleIds: null
//           }, {
//             // Check for empty array
//             ruleIds: {
//               $size: 0
//             }
//           }]},
//         then: 'both'
//       }
//     ]
//   }
// }
