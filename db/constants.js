import * as R from 'ramda'
import dataTypes from './dataTypes'
import { format } from 'date-fns'

// eslint-disable-next-line
import { yellow, green, redf } from 'logger'

const _log = (label) => (message) => {
  // if (label === 'start') {
  //   return green('start ----------------------- /n')
  // }
  // if (label === 'end') {
  //   return green('end -----------------------')
  // }
  // if (label === 'initial') {
  //   return yellow(label, message)
  // }

  return yellow(label, message)
}

export const TRANSACTIONS_COLLECTION_NAME = 'transactions'
export const CATEGORIES_COLLECTION_NAME = 'categories'
export const TRANSACTIONS_RULE_MAP_COLLECTION_NAME = 'transactions-rule-map'
export const ACCOUNTS_COLLECTION_NAME = 'accounts'
export const RULES_COLLECTION_NAME = 'rules'

export const duplicateStatus = {
  duplicateNew: 'duplicateNew',
  duplicatePending: 'duplicatePending',
  duplicateRefunded: 'duplicateRefunded',
  duplicateNotRefunded: 'duplicateNotRefunded',
  duplicateNot: 'duplicateNot'
}

export const transactionFields = {
  _id: {
    name: '_id',
    type: dataTypes.String // TODO: should this be ObjectID?
  },
  acctId: {
    name: 'acctId',
    type: dataTypes.String,
    isCriteriaField: true
  },
  amount: {
    // field for export only
    name: 'amount',
    type: dataTypes.Number
  },
  category1: {
    name: 'category1',
    type: dataTypes.String
  },
  category2: {
    name: 'category2',
    type: dataTypes.String
  },
  checkNumber: {
    name: 'checkNumber',
    type: dataTypes.Any
  },
  credit: {
    name: 'credit',
    type: dataTypes.Number,
    isCriteriaField: true
  },
  date: {
    name: 'date',
    type: dataTypes.Date,
    isCriteriaField: true
  },
  debit: {
    name: 'debit',
    type: dataTypes.Number,
    isCriteriaField: true
  },
  description: {
    name: 'description',
    type: dataTypes.String,
    isCriteriaField: true
  },
  omit: {
    name: 'omit',
    type: dataTypes.Boolean
  },
  origDescription: {
    name: 'origDescription',
    type: dataTypes.String
  },
  ruleIds: {
    name: 'ruleIds',
    type: dataTypes.Array
  },
  type: {
    name: 'type',
    type: dataTypes.String,
    isCriteriaField: true
  },
  txType: {
    name: 'txType',
    type: dataTypes.String,
    isCriteriaField: false
  }
}

export const criteriaSelectFields = R.values(
  R.filter((x) => x.isCriteriaField === true, transactionFields)
)

export const criteriaSelectFieldNames = R.map(
  (f) => f.name,
  criteriaSelectFields
)

export const actionTypes = {
  categorize: 'categorize',
  omit: 'omit',
  replaceAll: 'replaceAll',
  strip: 'strip'
}

export const operators = {
  beginsWith: {
    name: 'beginsWith',
    type: dataTypes.String
  },
  contains: {
    name: 'contains',
    type: dataTypes.String
  },
  doesNotContain: {
    name: 'doesNotContain',
    type: dataTypes.String
  },
  equals: {
    name: 'equals',
    type: dataTypes.String
  }
  // regex: {
  //   name: 'regex',
  //   type: dataTypes.String
  // }
  // in: 'in'
}

export const operatorSelectFields = R.values(operators)
export const operatorSelectFieldNames = R.map(
  (f) => f.name,
  operatorSelectFields
)

export const actionFields = {
  category1: {
    name: 'category1',
    type: dataTypes.String
  },
  category2: {
    name: 'category2',
    type: dataTypes.String
  },
  field: {
    name: 'field',
    type: dataTypes.String
  },
  findValue: {
    name: 'findValue',
    type: dataTypes.Any
  },
  numAdditionalChars: {
    name: 'numAdditionalChars',
    type: dataTypes.Number
  },
  replaceWithValue: {
    name: 'replaceWithValue',
    type: dataTypes.Any
  }
}

const criteriaFields = {
  _id: {
    name: '_id',
    type: dataTypes.String
  },
  action: {
    name: 'action',
    type: dataTypes.String
  },
  field: {
    name: 'field',
    type: dataTypes.String
  },
  findValue: {
    name: 'findValue',
    type: dataTypes.String
  },
  operator: {
    name: 'operator',
    type: dataTypes.String
  },
  value: {
    name: 'value',
    type: dataTypes.Any
  }
}

const allFields = () => {
  const merged = R.mergeAll([
    transactionFields,
    actionFields,
    operators,
    criteriaFields
  ])
  return merged
}

const stringToBoolean = (value) => {
  if (R.type(value) === dataTypes.Boolean) {
    return value
  }
  if (value.toLowerCase() === 'true') {
    return true
  }
  if (value.toLowerCase() === 'false') {
    return false
  }
}

// toDb

const convertValueToDb = (fieldValuePair) => {
  const [field, value] = fieldValuePair
  const type = R.path([field, transactionFields.type.name], allFields())
  switch (type) {
    case dataTypes.String:
      return [field, value]
    case dataTypes.Number:
      return [field, Number(value)]
    case dataTypes.Boolean:
      return [field, stringToBoolean(value)]
    case dataTypes.Array:
      return [field, value]
    case dataTypes.Any:
      return [field, value]
    case dataTypes.Date:
      return [field, new Date(value).toISOString()]
    default:
      redf('field', field)
      redf('value', value)
      throw new Error(`db.constants.convertValue: unknown field type: ${type}.`)
  }
}

const convertValuesToDb = R.pipe(
  R.toPairs,
  R.map(convertValueToDb),
  R.fromPairs
)

export const convertFieldValuesToDb = (fields) => {
  const ret = R.map(convertValuesToDb, fields)
  return ret
}

const convertCriterionToDb = (criterion) => {
  const { field, value } = criterion
  const valueConverted = convertValueToDb([field, value])
  return R.mergeRight(criterion, { value: valueConverted[1] })
}

export const convertCriteriaValuesToDb = (criteria) => {
  const ret = R.map(convertCriterionToDb, criteria)
  return ret
}

// toUi

const convertValueToUi = (fieldValuePair) => {
  const [field, value] = fieldValuePair
  const type = R.path([field, transactionFields.type.name], allFields())
  switch (type) {
    case dataTypes.String:
      return [field, value]
    case dataTypes.Number:
      return [field, Number(value)]
    case dataTypes.Boolean:
      return [field, stringToBoolean(value)]
    case dataTypes.Array:
      return [field, value]
    case dataTypes.Any:
      return [field, value]
    case dataTypes.Date:
      // return [field, format(new Date(value), 'MM/DD/YYYY')]
      return [field, format(new Date(value), 'MM/dd/yyyy')]
    default:
      redf('field', field)
      redf('value', value)
      throw new Error(`db.constants.convertValue: unknown field type: ${type}.`)
  }
}

const convertValuesToUi = R.pipe(
  R.toPairs,
  R.map(convertValueToUi),
  R.fromPairs
)

export const convertFieldValuesToUi = (fields) => {
  const ret = R.map(convertValuesToUi, fields)
  return ret
}

const convertCriterionToUi = (criterion) => {
  const { field, value } = criterion
  const valueConverted = convertValueToUi([field, value])
  return R.mergeRight(criterion, { value: valueConverted[1] })
}

export const convertCriteriaValuesToUi = (criteria) => {
  const ret = R.map(convertCriterionToUi, criteria)
  return ret
}
