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

// /**
//  *
//  * @param {object} account
//  * @param {object} doc
//  * @returns {number}
//  */
// const _getValueForAmountField = (account, doc) => {

//   // console.group('_getAmountFromAmountField')
//   // yellow('doc', doc)
//   // yellow('colMap', colMap)
//   const colNum = _getFieldColMapNumber(tFields.amount.name, account)
//   // yellow('colNum', colNum)
//   const value = _getValueFromRadData(colNum)
//   // yellow('value', value)
//   // console.groupEnd()
//   return value
// }

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

// /**
//  *
//  * @param {number} creditValue
//  * @param {number} debitValue
//  * @return {string} 'credit' || 'debit'
//  */
// const isCreditOrDebit = (creditValue, debitValue) => {
//   // if creditValue === debitValue
//   // --> is 1 Amount field
//   // else
//   // --> is credit & debit field
//   let swapSign // tmp should come from acct
//   //
//   if (creditValue === debitValue) {
//     // is 1 amount field
//     // creditValue === debitValue so return creditValue for both
//     if (swapSign) {
//       return -creditValue
//     } else {
//       return creditValue
//     }
//   } else {
//     // is credit & debit fields
//     if (isZeroOrEmpty(creditValue)) {
//       // it is a debit
//       if (isZeroOrEmpty(debitValue)) {
//         throw new Error('Debit & Credit are both 0 or empty string')
//       }
//       if (swapSign) {
//         return
//       }
//     }
//     if (isZeroOrEmpty(debitValue)) {
//       // it is a credit
//     }
//     if (isZeroOrEmpty(creditValue)) {

//     }
//   }

//
//   if (isZeroOrEmpty(creditValue) && !isZeroOrEmpty(debitValue)) {
//     return tFields.debit.name
//   }
//   if (!isZeroOrEmpty(creditValue) && isZeroOrEmpty(debitValue)) {
//     return tFields.credit.name
//   }
// }

const getDebitValue = (account, doc) => {
//   const colNum = tFields.amount.name(tFields.debit.name, account)
//   return _getValueFromRawData(colNum)
// }

// const getCreditValue = (account, doc) => {
//   const colNum = _getFieldColMapNumber(tFields.credit.name, account)
//   return _getValueFromRawData(colNum)
// }


// returns one value for either credit or debit
// const _getValueForCreditOrDebitField = (fieldName, account, doc) => {

// /*
//     - 1. determine if hasCreditDebitFields
//     - 2. separate paths for hasCreditDebitFields & !hasCreditDebitFields
//          - will be less confusing
// */

//   const { hasCreditDebitFields, swapCreditDebitFieldSign } = account
//   let colNum = _getFieldColMapNumber(fieldName, account)
//   // const val = 
//   if ( fieldName === tFields.credit.name ) {

//   }













//   // const { reverseSignCreditDebit } = account
//   const creditValue = getCreditValue(account, doc)
//   const debitValue = getDebitValue(account, doc)
//   green('creditValue', creditValue)
//   green('debitValue', debitValue)


//   const creditOrDebit = isCreditOrDebit(creditValue, debitValue)

//   if (creditOrDebit === tFields.debit.name) {
//     return debitValue <= 0 ? debitValue : debitValue * -1
//   }

//   if (creditOrDebit === tFields.credit.name) {
//     return creditValue >= 0 ? creditValue : creditValue * -1
//   }
// }

const _isZeroOrEmpty = (value) => value === 0 || value === ''

// /**
//  *
//  * @param {object} account
//  * @param {object} doc
//  * @return {number}
//  */
// const _getValueForAmount = (fieldName, account, doc) => {
//   const { hasCreditDebitFields } = account
//   return hasCreditDebitFields
//     ? _getValueForCreditOrDebitField(fieldName, account, doc)
//     : _getValueForAmountField(account, doc)
// }

// const _getValueForOtherField = (fieldName, account, doc) => {

//   // console.group('_getValueForOtherField')

//   // green('fieldName', fieldName)

//   const colNum = _getFieldColMapNumber(fieldName, account)
//   // green('conNum', colNum)

//   const value = R.prop(`field${colNum}`)(doc)
//   // green('value', value)

//   // console.groupEnd()

//   return value
// }

// const _getFieldValue = R.curry((fieldName, account, doc) => {
//   console.log()
//   console.log('------------------------------------------------------------')
//   console.log()
//   // console.group('_getFieldValue')
//   // blue('fieldName', fieldName)
//   // blue('account', account)
//   // blue('doc', doc)
//   // console.groupEnd()
//   // fn do data check? so not som many IFs below

//   return fieldName === tFields.amount.name
//     ? _getValueForAmount(fieldName, account, doc)
//     : _getValueForOtherField(fieldName, account, doc)
// })

const _swapSign = (field, account, doc) => {
  const { swapAmountFieldSign } = account
  
  return swapAmountFieldSign
    ? -value
    : value
}

const _getFieldValueFromRawData = (fieldName, account, doc) => {
  const { colMap } = account
  const colNum = R.prop(fieldName, colMap)
  return doc[`field${colNum}`]
}

const _getAmountFieldValue = (field, account, doc) => {
  const { hasCreditDebitFields, swapAmountFieldSign } = account

  let value

  if (hasCreditDebitFields) {
    const creditVal = _getFieldValueFromRawData(tFields.credit.name, account, doc)
    const debitVal = _getFieldValueFromRawData(tFields.debit.name, account, doc)
    if (_isZeroOrEmpty(creditVal) && !_isZeroOrEmpty(debitVal)) {
      // amount is a debit
      value = debitVal
    } else if (!_isZeroOrEmpty(creditVal) && _isZeroOrEmpty(debitVal)) {
      // amount is a credit
      value = creditVal
    } else {
      throw new Error('both credit & debit are zero (0)')
    }
  }
  return swapAmountFieldSign ? -value : value
}

export const transformData = (account, data) => {
  const { acctId } = account

  const mapToFields = (doc) => {
    const ret = {
      acctId,
      date: R.pipe(
        _getFieldValueFromRawData,
        _toIsoString
      )(tFields.date.name, account, doc),
      description: R.pipe(
        _getFieldValueFromRawData,
        _removeDoubleSpace,
        R.trim
      )(tFields.description.name, account, doc),
      origDescription: R.pipe(
        _getFieldValueFromRawData,
        _removeDoubleSpace,
        R.trim
      )(tFields.description.name, account, doc),
      amount: R.pipe(
        _getAmountFieldValue
      )(tFields.amount.name, account, doc),
      category1: '',
      category2: '',
      checkNumber: R.pipe(
        _getFieldValueFromRawData
      )(tFields.checkNumber.name, account, doc),
      type: _getFieldValueFromRawData(tFields.type.name, account, doc),
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
