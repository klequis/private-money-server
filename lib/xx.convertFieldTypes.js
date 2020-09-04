import { mergeRight } from 'ramda'
import { dataFields, actionFields } from 'db/constants'

const convertDate = (value) => {
  return new Date(value).toISOString()
}

const convertFieldTypes = (criteria) => {
  return criteria.map((c) => {
    const { field, value } = c

    // if it is 'credit'
    if (field === dataFields.credit.name) {
      // if it is credit || debit || numAdditionalChars
      if (
        [
          dataFields.credit.name,
          dataFields.debit.name,
          actionFields.numAdditionalChars.name
        ].includes(field)
      ) {
        // all it does is convert to Number :(
        return mergeRight(c, { value: Number(value) })
      }
    }

    // if it is date
    if (field === dataFields.date.name) {
      return convertDate(value)
    }
    return c
  })
}

export default convertFieldTypes
