import { transactionFields as tFields } from 'db/constants'
import isNilOrEmpty from 'lib/isNilOrEmpty'
import { getFieldValueFromRawData } from './getFieldValueFromRawData'
// eslint-disable-next-line
import { green, red, redf, yellow, blue, bluef } from 'logger'

const _isZeroOrEmpty = (value) => value === 0 || value === ''

const _isCredit = (creditVal, debitVal) => {
  return !_isZeroOrEmpty(creditVal) && _isZeroOrEmpty(debitVal)
}

const _getCreditOrDebit = (colMap, tx) => {
  // console.group('_getCreditOrDebit')
  // yellow('colMap', colMap)
  // yellow('tx', tx)
  // console.groupEnd()
  const creditVal = getFieldValueFromRawData({
    fieldName: tFields.credit.name,
    colMap,
    tx
  })
  const debitVal = getFieldValueFromRawData({
    fieldName: tFields.debit.name,
    colMap,
    tx
  })
  if (isNilOrEmpty(creditVal) && isNilOrEmpty(debitVal)) {
    throw new Error(
      'getAmount._getCreditOrDebit: Both credit and debit fields are null or zero'
    )
  }
  return _isCredit(creditVal, debitVal) ? creditVal : debitVal
}

export const getAmountValue = (swapAmountFieldSign, colMap, tx) => {
  // console.group('getAmountValue')
  // yellow('swapAmountFieldSign', swapAmountFieldSign)
  // yellow('colMap', colMap)
  // yellow('tx', tx)
  // console.groupEnd()
  const { credit: creditColNum, debit: debitColNum } = colMap
  redf('----------------------------')
  const value =
    creditColNum === debitColNum
      ? getFieldValueFromRawData({ fieldName: tFields.credit.name, colMap, tx })
      : _getCreditOrDebit(colMap, tx)

  return swapAmountFieldSign ? -value : value
}

// export const getAmountFieldValue = (colMap, tx) => {
//   return _getAmountValue(tFields.amount.name, colMap, tx)
// }
