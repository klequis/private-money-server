import wrap from 'routes/wrap'
import { TRANSACTIONS_COLLECTION_NAME, RULES_COLLECTION_NAME } from 'db/constants'
import { findOneAndDelete, find, findOneAndReplace } from 'db'
import runRules from 'actions/runRules'
import { ObjectId } from 'mongodb'
import { isValidMongoStringId } from 'lib/isValidMongoStringId'
import { mergeRight, dissoc } from 'ramda'
import { green, redf } from 'logger'

// const a = [
//   {
//     $addFields: {
//       FullName: { $concat: ['$StudentFirstName', ' ', '$StudentLastName'] }
//     }
//   },
//   { $out: 'name' }
// ]

// const b = [
//   {
//     ruleIds: id
//   },
//   {
//     $pull: {
//       ruleIds: id
//     },
//     $set: {
//       description: '$origDescription'
//     }
//   }
// ]

// const updateDataCollection = async id => {
//   const find = {
//     $match: { ruleIds: id }
//   }
//   const pull = {
//     $project: {
//       _id: '$_id',
//       acctId: '$acctId',
//       date: '$date',
//       description: '$origDescription',
//       cridit
//     }
//   }
//   const set = {
//     $set: {
//       description: '$origDescription'
//     }
//   }
//   const q = [find, pull, set]
//   const ret = await executeAggregate(TRANSACTIONS_COLLECTION_NAME, q)
//   green('updateDataCollection: ret', ret)
// }

const ruleDelete = wrap(async (req, res) => {
  /* TODO: confirm this is OK
      This function sets the description of each data doc
      which has 'ruleid' associated with it back to origDescription.
      It ignores that other rules may have also changed that rule.
      HOWEVER: at the end it runs all the rules so that should
      allow any other rules that effect the description after
      description is restored to origDescription[]
  */
  try {
    const { params } = req
    const { ruleid } = params

    green('ruleid', ruleid)
    if (!isValidMongoStringId(ruleid)) {
      throw new Error(`Param ruleid: ${ruleid} is not a valid ObjectID`)
    }
    const id = ObjectId.createFromHexString(ruleid)

    // Check if the rule exists
    const rulesFound = await find(RULES_COLLECTION_NAME, { _id: id })
    green('rulesFound', rulesFound)

    // Find docs from data collection that have the rule._id
    const dataFound = await find(TRANSACTIONS_COLLECTION_NAME, { ruleIds: id })
    green('dataFound', dataFound)

    const newDataDocs = dataFound.map(doc => {
      const { origDescription, ruleIds } = doc
      const newRuleIds = ruleIds.filter(filterRuleId => {
        // compare 'ruleid' from params to current 'ruleId' of filter
        const filterRuleIdAsString = filterRuleId.toHexString()
        return filterRuleIdAsString !== ruleid
      })

      if (newRuleIds.length > 0) {
        return mergeRight(doc, {
          ruleIds: newRuleIds,
          description: origDescription
        })
      } else {
        return mergeRight(dissoc('ruleIds', doc), { description: origDescription })
      }
    })

    green('newDataDocs', newDataDocs)

    for (let i = 0; i < newDataDocs.length; i++) {
      const doc = newDataDocs[i]
      const { _id } = doc
      const foar = findOneAndReplace(TRANSACTIONS_COLLECTION_NAME, { _id }, doc)
      green(`${i}.${foar}`)
    }

    // delete the rule
    const foad = await findOneAndDelete(RULES_COLLECTION_NAME, { _id: id })
    green('delete rule result', foad)

    // return rules
    await runRules()

    res.send({ value: 'test' })

  } catch (e) {
    redf('ruleDelete ERROR', e.message)
    console.log(e)
  }
})

export default ruleDelete
