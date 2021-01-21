import { transactionFields as tFields } from 'db/constants'
import R from 'ramda'
import { getFieldValueFromRawData } from './getFieldValueFromRawData'
import { getAmountValue } from './getAmountValue'

// eslint-disable-next-line
import { green, red, redf, yellow, blue, bluef } from 'logger'
// import isNilOrEmpty from '../../lib/isNilOrEmpty'

const _removeDoubleSpace = (value) => value.replace(/\s{2,}/g, ' ').trim()

const _toIsoString = (value) => {
  try {
    const newValue = new Date(value).toISOString()
    return newValue
  } catch (e) {
    red('_toIsoString Error:', `value=${value}`)
  }
}

// const _log = (message) => (value) => console.log(message, value)
const _getDateValue = (colMap, tx) => {
  bluef('_getDateValue')
  return R.pipe(
    getFieldValueFromRawData,
    _toIsoString
  )({
    fieldName: tFields.date.name,
    colMap,
    tx
  })
}

const _getDescriptionValue = (colMap, tx) => {
  bluef('_getDescriptionValue')
  return R.pipe(
    getFieldValueFromRawData,
    _removeDoubleSpace,
    R.trim
  )({
    fieldName: tFields.description.name,
    colMap,
    tx
  })
}

const _getOrigDescriptionValue = (colMap, tx) => {
  bluef('_getOrigDescriptionValue')
  return R.pipe(
    getFieldValueFromRawData,
    _removeDoubleSpace,
    R.trim
  )({
    fieldName: tFields.description.name,
    colMap,
    tx
  })
}

const _getCheckNumber = (colMap, tx) => {
  bluef('_getCheckNumber')
  return R.pipe(getFieldValueFromRawData)({
    fieldName: tFields.checkNumber.name,
    colMap,
    tx
  })
}

const _getType = (colMap, tx) => {
  bluef('_getType')
  return getFieldValueFromRawData({ fieldName: tFields.type.name, colMap, tx })
}

export const transformData = (accountWithData) => {
  const { account, data } = accountWithData

  const { swapAmountFieldSign, acctId, colMap } = account

  const mapToFields = (tx) => {
    const ret = {
      acctId,
      date: _getDateValue(colMap, tx),
      description: _getDescriptionValue(colMap, tx),
      origDescription: _getOrigDescriptionValue(colMap, tx),
      amount: getAmountValue(swapAmountFieldSign, colMap, tx),
      category1: '',
      category2: '',
      checkNumber: _getCheckNumber(colMap, tx),
      type: _getType(colMap, tx),
      omit: false
    }
    return ret
  }

  return R.map(mapToFields, data)
}
