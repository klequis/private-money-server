import wrap from 'routes/wrap'
import { RULES_COLLECTION_NAME } from 'db/constants'
import { findOneAndDelete } from 'db'
import { ObjectId } from 'mongodb'
import { isValidMongoStringId } from 'lib/isValidMongoStringId'
import { resetTx } from './resetTx'

/* eslint-disable */
import { green, redf } from 'logger'
import { yellow } from '../../logger'
/* eslint-enable */

const ruleDelete = wrap(async (req, res) => {
  const { params } = req
  const { ruleid } = params

  if (!isValidMongoStringId(ruleid)) {
    throw new Error(`Param ruleid: ${ruleid} is not a valid ObjectID`)
  }

  const ruleObjId = ObjectId.createFromHexString(ruleid)

  const resetRet = resetTx(ruleObjId)

  yellow('resetRet', resetRet)

  const deleteRuleRet = await findOneAndDelete(RULES_COLLECTION_NAME, {
    _id: ruleObjId
  })

  yellow('deleteRuleRet', deleteRuleRet)

  // TODO: incorrect data format
  res.send({ value: 'test' })
})

export default ruleDelete
