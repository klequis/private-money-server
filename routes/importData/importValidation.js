import { transactionFields as tFields } from 'db/constants'
import R from 'ramda'
import { isDate } from 'date-fns'
import dataTypes from 'db/dataTypes'

// eslint-disable-next-line
import { yellow, green, redf } from 'logger'

const isDateType = (value) => isDate(new Date(value))
    ? 'Date'
    : R.type(value)

/**
 * 
 * @param {string} fieldName 
 * @param {any} fieldValue 
 * @returns {object} { good: boolean, error: null || string }
 * @description Returns true if fieldValue is the correct type for fieldName
 *              'type' & 'checkNumber' fields are optional
 */
export const checkField = (fieldName, fieldValue) => {
    
    const expectedType = tFields[fieldName].type
    if (expectedType === dataTypes.Any) {
        return { good: true, error: null }
    }
    const receivedType = fieldName === tFields.date.name
        ? isDateType(fieldValue)
        : R.type(fieldValue)
    if (fieldName === tFields.type.name || fieldName === tFields.checkNumber.name) {
        if (fieldValue === undefined) {
            return { good: true, error: null }
        }
    }
    const good = receivedType === expectedType
        ? { good: true, error: null }
        : { good: false, error: `checkField: field=${fieldName}: Expected ${expectedType} but received ${receivedType}` }

    return good

}