import wrap from 'routes/wrap'
import { executeAggregate } from 'db/dbFunctions'
import { TRANSACTIONS_COLLECTION_NAME /*, RULES_COLLECTION_NAME */ } from 'db/constants'
import { sortBy, compose, toLower, prop } from 'ramda'

// eslint-disable-next-line
import { red, green, logRequest, yellow } from 'logger'

// const sortByNameCaseInsensitive = sortBy(compose(toLower, prop('name')))

const sortByOrig = sortBy(compose(toLower, prop('_id')))

const originalValues = wrap(async (req, res, next) => {
  const group1 = {
    $group: {
      _id: '$origDescription',
      cat1: { $addToSet: '$category1' },
      cat2: { $addToSet: '$category2' },
      orig: { $push: '$origDescription' },
      ruleIds: { $addToSet: '$ruleIds' }
    }
  }
  const q = [group1]

  const ret = await executeAggregate(TRANSACTIONS_COLLECTION_NAME, q)

  const a = ret.map(r => {
    const flatRules = r.ruleIds.flat()
    green('flatRules', flatRules)
    green('r', r)
    const x = {
      _id: r._id,
      orig: r.orig,
      category1: r.cat1,
      category2: r.cat2,
      ruleIds: flatRules
    }
    return x
  })
  const b = sortByOrig(a)
  yellow('WARN', 'should convert values ToUi?')
  res.send(b)
})

export default originalValues
