import wrap from 'routes/wrap'
import { executeAggregate, find, updateMany } from 'db/dbFunctions'
import { TRANSACTIONS_COLLECTION_NAME } from 'db/constants'
import { ObjectID, ObjectId } from 'mongodb'
import {
  wdCategory1,
  wdCategory2,
  wdDescription,
  wdRuleIds
} from '../../appWords'

// eslint-disable-next-line
import { red, green, yellow, logRequest, _log } from 'logger'

const update1FieldWithAnother = wrap(async (req, res) => {
  // db.students.updateMany({ _id: 3 }, [
  //   { $set: { test3: 98, modified: '$$NOW' } }
  // ])

  const objId = ObjectId('5febf3d0debc0e6d35aee579')

  const ret = updateMany(TRANSACTIONS_COLLECTION_NAME, { ruleIds: objId }, [
    {
      $set: {
        category1: '',
        category2: '',
        // ruleIds: [],
        description: '$origDescription'
      }
    }
  ])

  res.send(ret)
  // res.send({
  //   count: ret.length,
  //   data: ret
  // })
})

export default update1FieldWithAnother
