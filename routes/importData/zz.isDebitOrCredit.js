import { transactionFields as tFields } from 'db/constants'
import R from 'ramda'

/**
 *
 * @param {string} fieldName The name of a transaction field
 * @returns {boolean}
 */
export const isDebitOrCredit = (fieldName) => {
  return R.includes(fieldName, [tFields.credit.name, tFields.debit.name])
}
