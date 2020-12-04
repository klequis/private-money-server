import { transactionFields as tFields } from 'db/constants'
import R from 'ramda'
// import { checkField } from './importValidation'

// eslint-disable-next-line
import { green, red, redf, yellow, blue } from 'logger'

const _removeDoubleSpace = (value) => value.replace(/\s{2,}/g, ' ').trim()

const _toIsoString = (value) => {
  // yellow('_toIsoString: value', value)
  try {
    const newValue = new Date(value).toISOString()
    return newValue
  } catch (e) {
    red('_toIsoString Error:', `value=${value}`)
  }
}

// eslint-disable-next-line
const _logDataError = (msg, fieldName, account, doc) => {
  const { acctId } = account
  console.group('logDataError')
  red('error', msg)
  console.log('acctId', acctId)
  console.log('field', fieldName)
  console.log('doc', doc)
  console.groupEnd()
}

/**
 *
 * @param {object} account
 * @param {object} doc
 * @returns {number}
 */
const _getValueForAmountField = (account, doc) => {
  const { colMap } = account

  // console.group('_getAmountFromAmountField')
  // yellow('doc', doc)
  // yellow('colMap', colMap)
  const colNum = R.prop(tFields.amount.name, colMap)
  // yellow('colNum', colNum)
  const value = doc[`field${colNum}`]
  // yellow('value', value)
  // console.groupEnd()
  return value
}

// /**
//  * @param {boolean} reverseSignAmount Should fieldValue's sign be reversed or not
//  * @param {number} fieldValue
//  * @returns {number}
//  * @summary Used for source files that have credits & debits in separate column.
//  *
//  */
// const _getAmountFromCreditDebitFieldsOld = (reverseSignAmount, fieldValue) => {
//   // if receive empty string return 0
//   if (R.isEmpty(fieldValue)) {
//     return 0
//   }
//   // reverse sign or don't
//   return reverseSignAmount ? fieldValue * -1 : fieldValue
// }

/**
 *
 * @param {number} creditValue
 * @param {number} debitValue
 * @return {string} 'credit' || 'debit'
 */
const isCreditOrDebit = (creditValue, debitValue) => {
  if (isZeroOrEmpty(creditValue) && !isZeroOrEmpty(debitValue)) {
    return tFields.debit.name
  }
  if (!isZeroOrEmpty(creditValue) && isZeroOrEmpty(debitValue)) {
    return tFields.credit.name
  }
}

const getDebitValue = (account, doc) => {
  const { colMap } = account
  const colNum = R.prop(tFields.debit.name, colMap)
  return doc[`field${colNum}`]
}

const getCreditValue = (account, doc) => {
  const { colMap } = account
  const colNum = R.prop(tFields.credit.name, colMap)
  return doc[`field${colNum}`]
}

const _getValueForCreditDebitFields = (account, doc) => {
  // const { reverseSignCreditDebit } = account
  const creditValue = getCreditValue(account, doc)
  const debitValue = getDebitValue(account, doc)
  green('creditValue', creditValue)
  green('debitValue', debitValue)
  const creditOrDebit = isCreditOrDebit(creditValue, debitValue)

  if (creditOrDebit === tFields.debit.name) {
    return debitValue <= 0 ? debitValue : debitValue * -1
  }

  if (creditOrDebit === tFields.credit.name) {
    return creditValue >= 0 ? creditValue : creditValue * -1
  }
}

const isZeroOrEmpty = (value) => value === 0 || value === ''

/**
 *
 * @param {object} account
 * @param {object} doc
 * @return {number}
 */
const _getValueForAmount = (account, doc) => {
  const { hasCreditDebitFields } = account
  return hasCreditDebitFields
    ? _getValueForCreditDebitFields(account, doc)
    : _getValueForAmountField(account, doc)
}

const _getValueForOtherField = (fieldName, account, doc) => {
  const { colMap } = account

  // console.group('_getValueForOtherField')

  // green('fieldName', fieldName)

  const colNum = colMap[fieldName]
  // green('conNum', colNum)

  const value = R.prop(`field${colNum}`)(doc)
  // green('value', value)

  // console.groupEnd()

  return value
}

const _getFieldValue = R.curry((fieldName, account, doc) => {
  console.log()
  console.log('------------------------------------------------------------')
  console.log()
  // console.group('_getFieldValue')
  // blue('fieldName', fieldName)
  // blue('account', account)
  // blue('doc', doc)
  // console.groupEnd()
  // fn do data check? so not som many IFs below

  return fieldName === tFields.amount.name
    ? _getValueForAmount(account, doc)
    : _getValueForOtherField(fieldName, account, doc)
})

export const transformData = (account, data) => {
  const { acctId } = account

  const mapToFields = (doc) => {
    const ret = {
      acctId,
      date: R.pipe(
        _getFieldValue,
        _toIsoString
        // @ts-ignore
      )(tFields.date.name, account, doc),
      description: R.pipe(
        _getFieldValue,
        _removeDoubleSpace,
        R.trim
        // @ts-ignore
      )(tFields.description.name, account, doc),
      origDescription: R.pipe(
        _getFieldValue,
        _removeDoubleSpace,
        R.trim
        // @ts-ignore
      )(tFields.description.name, account, doc),
      amount: R.pipe(
        _getFieldValue
        // @ts-ignore
      )(tFields.amount.name, account, doc),
      category1: '',
      category2: '',
      checkNumber: R.pipe(
        _getFieldValue
        // @ts-ignore
      )(tFields.checkNumber.name, account, doc),
      type: _getFieldValue(tFields.type.name, account, doc),
      omit: false
    }
    return ret
  }
  const transform = R.pipe(
    mapToFields
    // R.tap(printCreditDebit('bef')),
    // R.evolve(evolver(account)),
    // R.tap(printCreditDebit('aft')),
  )
  return R.map(transform, data)
}
