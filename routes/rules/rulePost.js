import wrap from 'routes/wrap'
import {
  RULES_COLLECTION_NAME,
  convertCriteriaValuesToDb,
  TRANSACTIONS_COLLECTION_NAME
} from 'db/constants'
import { insertOne, find, updateMany } from 'db/dbFunctions'
import { ObjectID } from 'mongodb'
import runRules from 'actions/runRules'
import { filterBuilder } from 'actions/filterBuilder'
import * as R from 'ramda'

// eslint-disable-next-line
import { yellow, redf, blue } from 'logger'
// import {} from '../../db/constants'

const replaceTmpId = (obj) => {
  return R.mergeRight(obj, { _id: ObjectID() })
}

const rulePost = wrap(async (req, res) => {
  yellow('rulePost', 'POST')
  const { body } = req
  // new rule could be sent with tmp ids. Remove them
  const { criteria, actions } = body

  // Change number types to number
  const convertedCriteria = convertCriteriaValuesToDb(criteria)

  // blue('actions', actions)
  // yellow('criteria', criteria)

  const filter = filterBuilder(convertedCriteria)
  // yellow('filter', filter)
  const affectedTxIds = await find(TRANSACTIONS_COLLECTION_NAME, filter, {
    _id: 1
  })
  // yellow('affectedTx', affectedTxIds)
  // { _id: { $in: []}}
  const updateFilter = {
    _id: { $in: R.map((x) => ObjectID(x._id), affectedTxIds) }
  }
  // yellow('updateFilter', updateFilter)
  // const test = await find(TRANSACTIONS_COLLECTION_NAME, updateFilter)
  // yellow('test', test)

  const ret = await updateMany(TRANSACTIONS_COLLECTION_NAME, updateFilter, [
    {
      $set: {
        category1: '',
        category2: '',
        ruleIds: [],
        description: '$origDescription'
      }
    }
  ])

  console.log('ret', ret)
  /* ----------------------------------------------------- */

  const newRule = {
    criteria: convertedCriteria.map((c) => replaceTmpId(c)),
    actions: actions.map((a) => replaceTmpId(a))
  }

  const i = await insertOne(RULES_COLLECTION_NAME, newRule)
  yellow('rulePost: inserted', i)
  const { _id } = i[0]
  await runRules(_id)

  // TODO: incorrect data format
  // res.send({ _id: _id })
  res.send({ a: 'b' })
})

export default rulePost

/*

const rulePost = wrap(async (req, res) => {
  yellow('rulePost', 'POST')
  const { body } = req
  // new rule could be sent with tmp ids. Remove them
  const { criteria, actions } = body

  // Change number types to number
  const convertedCriteria = convertCriteriaValuesToDb(criteria)

  const newRule = {
    criteria: convertedCriteria.map((c) => replaceTmpId(c)),
    actions: actions.map((a) => replaceTmpId(a))
  }

  const i = await insertOne(RULES_COLLECTION_NAME, newRule)
  yellow('rulePost: inserted', i)
  const { _id } = i[0]
  await runRules(_id)

  // TODO: incorrect data format
  res.send({ _id: _id })
})

*/
