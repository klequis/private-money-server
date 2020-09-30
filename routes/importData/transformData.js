import {
    transactionFields as tFields
} from 'db/constants'
import R from 'ramda'
import { checkField } from './importValidation'
import { isDebitOrCredit } from './isDebitOrCredit'
// @ts-ignore
// eslint-disable-next-line
import { green, red, redf, yellow } from 'logger'

const removeDoubleSpace = (value) => value.replace(/\s{2,}/g, ' ').trim()
const toIsoString = (value) => {
    const newValue = new Date(value).toISOString()
    return newValue
}

const _stripDollarSign = (value) => {
    if (R.type(value) === 'String' && value.startsWith('$')) {
        return Number(value.slice(1))
    }
    return value
}

const logDataError = (msg, fieldName, account, doc) => {
    const { acctId } = account
    console.group('logDataError')
    red('error', msg)
    console.log('acctId', acctId)
    console.log('field', fieldName)
    console.log('doc', doc)
    console.groupEnd()
}

const replaceEmptyStringWithZero = (value) => {
    return R.isEmpty(value) ? 0 : value
}

const getFieldValue = R.curry((fieldName, account, doc) => {

    const { acctId, colMap, hasAmountField } = account

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
        finalValue = replaceEmptyStringWithZero(rawValue)
    } else {
        finalValue = rawValue
    }

    const { good, error } = checkField(fieldName, finalValue)

    if (!good) {
        logDataError(error, fieldName, account, doc)
    }
    return finalValue
})

export const _transformData = (account, data) => {
    const { colMap, acctId } = account

    const mapToFields = (doc) => {
        const ret = {
            acctId,

            date: R.pipe(
                getFieldValue,
                toIsoString
                // @ts-ignore
            )(tFields.date.name, account, doc),
            description: R.pipe(
                getFieldValue,
                removeDoubleSpace,
                R.trim
                // @ts-ignore
            )(tFields.description.name, account, doc),
            origDescription: R.pipe(
                getFieldValue,
                removeDoubleSpace,
                R.trim
                // @ts-ignore
            )(tFields.description.name, account, doc),
            credit: R.pipe(
                getFieldValue,
                _stripDollarSign,
                // @ts-ignore
            )(tFields.credit.name, account, doc),
            debit: R.pipe(
                getFieldValue,
                _stripDollarSign
                // @ts-ignore
            )(tFields.debit.name, account, doc),
            category1: 'none',
            category2: '',
            checkNumber: getFieldValue(tFields.checkNumber.name, account, doc),
            type: getFieldValue(tFields.type.name, account, doc),
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
