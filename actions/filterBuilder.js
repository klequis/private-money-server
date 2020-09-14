import {
  transactionFields,
  convertOneFieldValue,
  operators
} from 'db/constants'
import escapeStringRegexp from 'escape-string-regexp'
import { LOG_FILTER } from 'global-constants'
// eslint-disable-next-line
import { blue, green, greenf, redf, yellow } from 'logger'

const operationBeginsWith = (field, value) => {
  // return { [field]: { $regex: `^${value}`, $options: 'im' } }
  // AMZN MKTP US\*MN5TE1R51 AMAMZN.COM\/BILLWA
  // const regEx = new RegExp(`^${value}`, 'im')
  const escapedStr = escapeStringRegexp(value)
  return { [field]: new RegExp(`^${escapedStr}`, 'im') }
}

const operationContains = (field, value) => {
  // return { [field]: { $regex: `${value}`, $options: 'im' } }
  const escapedStr = escapeStringRegexp(value)
  return { [field]: new RegExp(`${escapedStr}`, 'im') }
}

const operationEquals = (field, value) => {
  return { [field]: { $eq: value } }
  // return { [field]: { $eq: value } }
}

const operationRegex = (field, value) => {
  // return { [field]: { $regex: `${value}`, $options: 'im' } }
  const escapedStr = escapeStringRegexp(value)
  return { [field]: new RegExp(escapedStr, 'im') }
}

// const createRegex = (findValue, numAdditionalChars = 0) => {
//   const regExAsString =
//     numAdditionalChars > 0
//       ? `(${findValue}).{${numAdditionalChars}}`
//       : `(${findValue})`
//   return new RegExp(regExAsString)
// }

// const operationIn = (field, value) => {
//   const regex = new RegExp(value)
//   return { [field]: { $in: [regex] } }
// }

const operationDoesNotContain = (field, value) => {
  const escapedStr = escapeStringRegexp(value)
  return { [field]: { $not: { $regex: escapedStr } } }
}

export const conditionBuilder = (criterion) => {
  // takes a single criterion object
  // TODO: hard coding descriptions  => origDescription. Where should this logic be?

  const { field: origField, operation, value } = criterion

  const field =
    origField === transactionFields.description.name
      ? transactionFields.origDescription.name
      : origField

  LOG_FILTER && yellow('operation', operation)
  
  switch (operation) {
    case operators.beginsWith.name:
      return operationBeginsWith(field, value)
    case operators.contains.name:
      return operationContains(field, value)
    case operators.doesNotContain.name:
      return operationDoesNotContain(field, value)
    case operators.equals.name:
      return operationEquals(field, value)
    case operators.regex.name:
      return operationRegex(field, value)
    default:
      redf(
        'deleteAction ERROR: ',
        `operation ${operation} not covered in switch`
      )
      throw new Error(
        `conditionBuilder ERROR: unknown operation '${operation}'`
      )
  }
}

export const filterBuilder = (criteria) => {
  if (criteria.length === 1) {
    const o = conditionBuilder(criteria[0])
    return o
  } else {
    const b = criteria.map((criterion) => conditionBuilder(criterion))
    const c = { $and: b }
    return c
  }
}

export const printResult = (id, expectRows, actualRows) => {
  expectRows === actualRows
    ? greenf(`OK: id: ${id}, expected: ${expectRows}, actual: ${actualRows}`)
    : redf(`ERROR: id: ${id}, expected: ${expectRows}, actual: ${actualRows}`)
}
