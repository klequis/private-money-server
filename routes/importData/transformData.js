import { transactionFields as tFields } from 'db/constants'
import R from 'ramda'

// eslint-disable-next-line
import { green, red, redf, yellow, blue } from 'logger'
import isNilOrEmpty from '../../lib/isNilOrEmpty'

const _removeDoubleSpace = (value) => value.replace(/\s{2,}/g, ' ').trim()

const _toIsoString = (value) => {
  try {
    const newValue = new Date(value).toISOString()
    return newValue
  } catch (e) {
    red('_toIsoString Error:', `value=${value}`)
  }
}

const _isZeroOrEmpty = (value) => value === 0 || value === ''



const _getFieldValueFromRawData = R.curry((fieldName, account, doc) => {
  const { colMap } = account
  const colNum = R.prop(fieldName, colMap)
  const val = doc[`field${colNum}`]
  return isNilOrEmpty(val) ? '' : val
})

const _getAmountFieldValue = (field, account, doc) => {
  // will be passed `field` but it is not needed

  const { swapAmountFieldSign, colMap } = account
  const { credit: creditColNum, debit: debitColNum } = colMap

  let value

  if (creditColNum === debitColNum) {
    // there is only one amount field
    // getting value for credit || debit will return value from same doc field
    // so use credit
    value = _getFieldValueFromRawData(tFields.credit.name, account, doc)
  } else {
    // there are separate credit & debit fields
    // one of which should be non-zero && !== ''
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
