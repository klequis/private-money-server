import wrap from 'routes/wrap'
import { find, findOneAndReplace } from 'db/dbFunctions'
import { RULES_COLLECTION_NAME } from 'db/constants'
import { ObjectID, ObjectId } from 'mongodb'
import * as R from 'ramda'

// eslint-disable-next-line
import { red, green, yellow, logRequest, _log } from 'logger'

const convertValueField = (criterion) => {
  return criterion.field === 'debit'
    ? R.merge(criterion, { value: Number(criterion.value) })
    : criterion
}

// const modDebitValue = R.pipe(
//   R.tap(_log('initial')),
//   R.prop('criteria'),
//   R.tap(_log('criteria')),
//   R.map(convertValueField),
//   R.tap(_log('next'))
//   // R.map(_log('map criteria'))
//   // R.map(_log(''))
// )

const modDebitValue1 = R.pipe(
  R.tap(_log('initial')),
  R.map(convertValueField)
)

const test = wrap(async (req, res) => {
  const rulesToMod = await find(RULES_COLLECTION_NAME, {
    $and: [
      { 'criteria.field': { $eq: 'debit' } },
      { 'criteria.value': { $type: 'string' } }
    ]
  })

  const s = R.map(x => R.mergeRight(x, { criteria: modDebitValue1(x.criteria) }), rulesToMod)
  for (let i = 0; i < s.length; i++) {
    await findOneAndReplace(RULES_COLLECTION_NAME, { _id: s[i]._id }, s[i])
    // const t = await find(RULES_COLLECTION_NAME, { _id: s[i]._id })
    // yellow('t', t)
  }
  // TODO: incorrect data format
  res.send(s)
})

export default test
