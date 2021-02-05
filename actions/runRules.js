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
import {
  logCriteria,
  logActions,
  logFilter,
  blue,
  green,
  greenf,
  redf,
  yellow
} from 'logger'
import isNilOrEmpty from '../lib/isNilOrEmpty'
import { findById } from '../db'

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

const reportCount = (count) => {
  console.log('count', count)
}

const getRules = async (ruleId = '') => {
  if (isNilOrEmpty(ruleId)) {
    return find(RULES_COLLECTION_NAME, {})
  } else {
    return findById(RULES_COLLECTION_NAME, ruleId)
  }
}

/**
 *
 * @param {string} ruleId optional _id of a rule to run.
 * @description If passed a rule _id will run that one rul. Otherwise runs all rules.
 *
 */
const runRules = async (ruleId) => {
  // TODO: use R.pipe for processing here
  const count = {
    omit: 0,
    strip: 0,
    replaceAll: 0,
    categorize: 0,
    rulesRun: 0,
    total: 0
  }
  const incrementCount = (prop) => {
    switch (prop) {
      case 'omit':
        count.omit = count.omit + 1
        break
      case 'strip':
        count.strip = count.strip + 1
        break
      case 'replaceAll':
        count.replaceAll = count.replaceAll + 1
        break
      case 'categorize':
        count.categorize = count.categorize + 1
        break
      case 'rule':
        count.rulesRun = count.rulesRun + 1
        break
      default:
      // do nothing
    }
    count.total = count.total + 1
  }
  // let rules
  // if (passedInRules.length !== 0) {
  //   rules = passedInRules
  // } else {
  //   const allRules = await find(RULES_COLLECTION_NAME, {})
  //   rules = allRules
  // }
  const rules = await getRules(ruleId)
  // blue('runRules: num rules to run', rules.length)
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i]
    incrementCount('rule')

    // blue('runRules: running _id', rule._id)

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
          await updateMany(
            TRANSACTIONS_COLLECTION_NAME,
            filter,
            _createOmitUpdate(rule)
          )
          incrementCount('omit')
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
          incrementCount('strip')
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
          incrementCount('replaceAll')
          break
        case actionTypes.categorize:
          await updateMany(
            TRANSACTIONS_COLLECTION_NAME,
            filter,
            _createCategorizeUpdate(action, rule)
          )
          incrementCount('categorize')
          break
        default:
          console.group('Unknown action type')
          redf('actionType:', action.actionType)
          redf('rule', rule)
          redf('action', action)
          console.groupEnd()
      }
    }
  }
  reportCount(count)
}

export default runRules
