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

const _getAmountFieldValue = (account, doc) => {
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
    const creditVal = _getFieldValueFromRawData(
      tFields.credit.name,
      account,
      doc
    )
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

const _getFieldValueFromRawData = R.curry(({ fieldName, colMap, tx }) => {
  const colNum = R.prop(fieldName, colMap)
  const val = tx[`field${colNum}`]
  return isNilOrEmpty(val) ? '' : val
})

// const _log = (message) => (value) => console.log(message, value)
const getDateValue = (colMap, tx) => {
  // const a = _getFieldValueFromRawData(tFields.date.name, colMap, tx)
  // const r = _toIsoString(a)

  const a = R.pipe(
    _getFieldValueFromRawData,
    _toIsoString
  )({
    fieldName: tFields.date.name,
    colMap,
    tx
  })
  green('a', a)
  return a
}

export const transformData = (accountWithData) => {
  const { account, data } = accountWithData
  // green('account', account)

  const { acctId, colMap } = account

  const mapToFields = (tx) => {
    const ret = {
      acctId,
      date: getDateValue(colMap, tx),
      description: R.pipe(
        _getFieldValueFromRawData,
        _removeDoubleSpace,
        R.trim
      )(tFields.description.name, account, tx),
      origDescription: R.pipe(
        _getFieldValueFromRawData,
        _removeDoubleSpace,
        R.trim
      )(tFields.description.name, account, tx),
      amount: R.pipe(_getAmountFieldValue)(tFields.amount.name, account, tx),
      category1: '',
      category2: '',
      checkNumber: R.pipe(_getFieldValueFromRawData)(
        tFields.checkNumber.name,
        account,
        tx
      ),
      type: _getFieldValueFromRawData(tFields.type.name, account, tx),
      omit: false
    }
    return ret
  }

  return R.map(mapToFields, data)
}
