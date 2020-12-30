import wrap from 'routes/wrap'
import { executeAggregate, find } from 'db/dbFunctions'
import { TRANSACTIONS_COLLECTION_NAME } from 'db/constants'
import { ObjectID, ObjectId } from 'mongodb'

// eslint-disable-next-line
import { red, green, yellow, logRequest, _log } from 'logger'

const update1FieldWithAnother = wrap(async (req, res) => {
  const match1 = {
    $match: {
      ruleIds: ObjectId('5febb0c18723d6466523d5e9')
    }
  }

  const project1 = {
    $project: {
      _id: 1,
      // acctId: 1,
      // date: 1,
      origDescription: 1,
      description: 1,
      // amount: 1,
      category1: 1,
      category2: 1,
      // checkNumber: 1,
      // type: 1,
      // omit: 1,
      ruleIds: 1
    }
  }

  const unset = {
    $unset: 'ruleIds'
  }

  const set = {
    $set: {
      description: '$origDescription',
      category1: ''
    }
  }

  const q = [match1, project1, unset, set]

  const ret = await executeAggregate(TRANSACTIONS_COLLECTION_NAME, q)

  res.send({
    count: ret.length,
    data: ret
  })
})

export default update1FieldWithAnother
