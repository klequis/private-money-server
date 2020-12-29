import { transactionFields, operators } from 'db/constants'
import escapeStringRegexp from 'escape-string-regexp'
import { LOG_FILTER } from 'global-constants'
// eslint-disable-next-line
import { blue, green, greenf, redf, yellow } from 'logger'

const operatorBeginsWith = (field, value) => {
  const escapedStr = escapeStringRegexp(value)
  return { [field]: new RegExp(`^${escapedStr}`, 'im') }
}

const operatorContains = (field, value) => {
  const escapedStr = escapeStringRegexp(value)
  return { [field]: new RegExp(`${escapedStr}`, 'im') }
}

const operatorEquals = (field, value) => {
  return { [field]: { $eq: value } }
}

const operatorRegex = (field, value) => {
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

// const operatorIn = (field, value) => {
//   const regex = new RegExp(value)
//   return { [field]: { $in: [regex] } }
// }

const operatorDoesNotContain = (field, value) => {
  const escapedStr = escapeStringRegexp(value)
  return { [field]: { $not: { $regex: escapedStr } } }
}

export const conditionBuilder = (criterion) => {
  // takes a single criterion object
  // TODO: hard coding descriptions  => origDescription. Where should this logic be?

  const { field: origField, operator, value } = criterion

  const field =
    origField === transactionFields.description.name
      ? transactionFields.origDescription.name
      : origField

  LOG_FILTER && yellow('operator', operator)

  switch (operator) {
    case operators.beginsWith.name:
      return operatorBeginsWith(field, value)
    case operators.contains.name:
      return operatorContains(field, value)
    case operators.doesNotContain.name:
      return operatorDoesNotContain(field, value)
    case operators.equals.name:
      return operatorEquals(field, value)
    case operators.regex.name:
      return operatorRegex(field, value)
    default:
      redf('deleteAction ERROR: ', `operator ${operator} not covered in switch`)
      throw new Error(`conditionBuilder ERROR: unknown operator '${operator}'`)
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
