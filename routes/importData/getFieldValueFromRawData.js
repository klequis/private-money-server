import isNilOrEmpty from 'lib/isNilOrEmpty'
import R from 'ramda'
// eslint-disable-next-line
import { yellow } from 'logger'

export const getFieldValueFromRawData = R.curry(({ fieldName, colMap, tx }) => {
  // console.group('getFieldValueFromRawData')
  // yellow('fieldName', fieldName)
  // yellow('colMap', colMap)
  // yellow('tx', tx)
  // console.groupEnd()
  const colNum = R.prop(fieldName, colMap)
  const val = tx[`field${colNum}`]
  return isNilOrEmpty(val) ? '' : val
})
