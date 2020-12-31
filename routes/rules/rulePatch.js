import wrap from 'routes/wrap'
import {
  convertCriteriaValuesToDb,
  // TRANSACTIONS_COLLECTION_NAME,
  RULES_COLLECTION_NAME
} from 'db/constants'
import * as R from 'ramda'
import { findOneAndUpdate } from 'db'
import runRules from 'actions/runRules'
import { toString } from 'lib'
import { ObjectId } from 'mongodb'
// import { wdCategory1, wdCategory2, wdDescription, wdRuleIds } from 'appWords'
import { resetTx } from './resetTx'

// eslint-disable-next-line
import { red, redf, green, yellow, logRequest } from 'logger'

const rulePatch = wrap(async (req, res) => {
  const { body, params } = req

  // body is a rule
  const { _id, criteria, actions } = body
  const { ruleid: paramsId } = params

  if (toString(paramsId) !== toString(_id)) {
    throw new Error(
      `_id in params ${paramsId} does not match _id in body ${_id}`
    )
  }

  const convertedCriteria = convertCriteriaValuesToDb(criteria)

  // TODO check if is likely mongodb_id before trying to convert
  const ruleObjId = ObjectId.createFromHexString(_id)

  // const ret = await updateMany(
  //   TRANSACTIONS_COLLECTION_NAME,
  //   { ruleIds: ruleObjId },
  //   [
  //     {
  //       $set: {
  //         category1: '',
  //         category2: '',
  //         ruleIds: [],
  //         description: '$origDescription'
  //       }
  //     }
  //   ]
  // )
  const ret = resetTx(ruleObjId)
  console.log('ret', ret)

  // await updateMany

  await findOneAndUpdate(
    RULES_COLLECTION_NAME,
    { _id: _id },
    {
      $set: { criteria: convertedCriteria, actions: actions }
    },
    false
  )

  await runRules(_id)
  res.send(ret)
  // res.send(updatedRule[0])
})

export default rulePatch
