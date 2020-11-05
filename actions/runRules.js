import { find, updateMany, findOneAndUpdate } from 'db'
import {
  TRANSACTIONS_COLLECTION_NAME,
  RULES_COLLECTION_NAME,
  transactionFields as tFields,
  actionTypes
} from 'db/constants'
import { filterBuilder } from 'actions/filterBuilder'
import * as R from 'ramda'
import { LOG_CRITERIA, LOG_FILTER } from 'global-constants'

// eslint-disable-next-line
import { logCriteria, logActions, logFilter, blue, green, greenf, redf, yellow } from 'logger'

// const printFilter = (filter) => {
//   console.log('// filter')
//   if (R.has('$and')(filter)) {
//     const a = filter.$and
//     // yellow('$and:', a)
//   } else {
//     // yellow('filter', filter)
//   }
//   console.log('// filter')
// }

const _createRegex = (findValue, numAdditionalChars = 0) => {
  const regExAsString =
    numAdditionalChars > 0
      ? `(${findValue}).{${numAdditionalChars}}`
      : `(${findValue})`
  return new RegExp(regExAsString)
}

const _createCategorizeUpdate = (action, rule) => {
  let update
  if (R.has(tFields.category2.name)(action)) {
    update = {
      $set: {
        category1: action.category1,
        category2: action.category2
      },
      $addToSet: { ruleIds: rule._id }
    }
  } else {
    update = {
      $set: { category1: action.category1 },
      $addToSet: { ruleIds: rule._id }
    }
  }
  return update
}

const _createReplaceAllUpdate = (action, rule) => {
  const update = {
    $set: {
      [action.field]: action.replaceWithValue
    },
    $addToSet: { ruleIds: rule._id }
  }
  return update
}

const _createStripUpdate = (action, doc, rule) => {
  const { findValue, numAdditionalChars } = action
  const regex = _createRegex(findValue, numAdditionalChars)
  const update = {
    $set: {
      [action.field]: doc[action.field].replace(regex, '').trim(),
      [`orig${action.field}`]: doc[action.field]
    },
    $addToSet: { ruleIds: rule._id }
  }
  return update
}

const _createOmitUpdate = (rule) => {
  const update = {
    $set: { omit: true },
    $addToSet: { ruleIds: rule._id }
  }
  return update
}

/**
 * 
 * @param {object} passedInRules Optional rule. 
 * @description If passedInRules.length === 0 runs all rules. Otherwise runs passed in rulles
 */
const runRules = async (passedInRules = []) => {
  // TODO: use R.pipe for processing here
  let rules
  if (passedInRules.length !== 0) {
    rules = passedInRules
  } else {
    const allRules = await find(RULES_COLLECTION_NAME, {})
    rules = allRules
  }
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i]

    const { actions, criteria } = rule

    LOG_CRITERIA && yellow('runRules.criteria', criteria)

    const filter = filterBuilder(criteria)


    if (criteria.length > 1) {
      LOG_FILTER && yellow('filter', filter)
      LOG_FILTER && filter.$and.map((v) => console.log(v))
    }
    const f = await find(TRANSACTIONS_COLLECTION_NAME, filter)
    for (let j = 0; j < actions.length; j++) {
      const action = actions[j]
      // green('action', action)
      switch (action.actionType) {
        case actionTypes.omit:
          const omitUpdate = _createOmitUpdate(rule)
          await updateMany(TRANSACTIONS_COLLECTION_NAME, filter, omitUpdate)
          break
        case actionTypes.strip:
          for (let j = 0; j < f.length; j++) {
            const doc = f[j]
            await findOneAndUpdate(
              TRANSACTIONS_COLLECTION_NAME,
              { _id: doc._id },
              _createStripUpdate(action, doc, rule)
            )
          }
          break
        case actionTypes.replaceAll:
          for (let j = 0; j < f.length; j++) {
            const doc = f[j]
            await findOneAndUpdate(
              TRANSACTIONS_COLLECTION_NAME,
              { _id: doc._id },
              _createReplaceAllUpdate(action, rule)
            )
          }
          break
        case actionTypes.categorize:
          await updateMany(
            TRANSACTIONS_COLLECTION_NAME,
            filter,
            _createCategorizeUpdate(action, rule)
          )
          break
        default:
          redf('unknown action type:', action.actionType)
          redf('rule', rule)
          redf('action', action)
      }
    }
  }
}

export default runRules
