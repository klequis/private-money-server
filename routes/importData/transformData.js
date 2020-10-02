import {
    transactionFields as tFields
} from 'db/constants'
import R from 'ramda'
import { checkField } from './importValidation'
import { isDebitOrCredit } from './isDebitOrCredit'
// @ts-ignore
// eslint-disable-next-line
import { green, red, redf, yellow } from 'logger'

const _removeDoubleSpace = (value) => value.replace(/\s{2,}/g, ' ').trim()

const _toIsoString = (value) => {
    try {
        const newValue = new Date(value).toISOString()
        return newValue
    } catch (e) {
        red('_toIsoString Error:', `value=${value}`)
    }
}

const _stripDollarSign = (value) => {
    if (R.type(value) === 'String' && value.startsWith('$')) {
        return Number(value.slice(1))
    }
    return value
}

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
 * @param {string} fieldName possible values debit || credit
 * @param {number} fieldValue
 * @return {number}
 * @summary Used for source files that have credits & debits in a signle 'amount' column
 */
const _getValueHasAmountTrue = (fieldName, fieldValue) => {
    // has
    if (fieldName === tFields.credit.name) {
        return fieldValue > 0 ? fieldValue : 0
    }
    if (fieldName = tFields.debit.name) {
        return fieldValue < 0 ? fieldValue : 0
    }
    throw new Error(`
        _getValueHasAmountTrue: Valid values for fieldName are 'credit or 'debit',
        but received ${fieldName}.
    `)
}

/**
 * @param {boolean} reverseSignAmount Should fieldValue's sign be reversed or not
 * @param {number} fieldValue
 * @returns {number}
 * @summary Used for source files that have credits & debits in separate column. 
 * 
 */
const _getValueHasAmountFalse = (reverseSignAmount, fieldValue) => {
    // if receive empty string return 0
    if (R.isEmpty(fieldValue)) {
        return 0
    }
    // reverse sign or don't
    return reverseSignAmount ? fieldValue * -1 : fieldValue
}

const _getFieldValue = R.curry((fieldName, account, doc) => {
    const { acctId, colMap, hasAmountField, reverseSignAmount } = account

    if (!R.has('amountField')(account)) {
        red(`Account ${acctId} is missing field 'hasAmountField'`)
    }

    if (!R.has('colMap')(account)) {
        red(`Account ${acctId} is missing field 'colMap'`)
    }

    if (!R.has(`${fieldName}`)(colMap)) {
        red(`'colMap' for account ${acctId} is missing a mapping for field ${fieldName}`)
    }

    const colNum = colMap[fieldName]
    if (!Number.isInteger(colNum)) {
        red(`acctId: ${acctId}: '${colNum} is not a valid value for colMap' field ${fieldName} has in for account ${acctId} is missing a mapping for field ${fieldName}`)
    }


    const rawValue = R.prop(`field${colNum}`)(doc)

    let finalValue

    if (isDebitOrCredit(fieldName)) {
        finalValue = hasAmountField
            ? _getValueHasAmountTrue(fieldName, rawValue)
            : _getValueHasAmountFalse(reverseSignAmount, rawValue)
    } else {
        finalValue = rawValue
    }

    const { good, error } = checkField(fieldName, finalValue)

    if (!good) {
        _logDataError(error, fieldName, account, doc)
    }

    return finalValue
})

export const _transformData = (account, data) => {
    const { colMap, acctId } = account

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
            credit: R.pipe(
                _getFieldValue,
                _stripDollarSign,
                // @ts-ignore
            )(tFields.credit.name, account, doc),
            debit: R.pipe(
                _getFieldValue,
                _stripDollarSign
                // @ts-ignore
            )(tFields.debit.name, account, doc),
            category1: 'none',
            category2: '',
            checkNumber: R.pipe(
                _getFieldValue,
                // @ts-ignore
            )(tFields.checkNumber.name, account, doc),
            type: _getFieldValue(tFields.type.name, account, doc),
            omit: false
        }
        return ret
    }
    const transform = R.pipe(
        mapToFields,
        // R.tap(printCreditDebit('bef')),
        // R.evolve(evolver(account)),
        // R.tap(printCreditDebit('aft')),
    )
    return R.map(transform, data)

}
