import wrap from 'routes/wrap'
import { find } from 'db'
import {
  TRANSACTIONS_COLLECTION_NAME,
  convertFieldValuesToUi
} from 'db/constants'
import isNilOrEmpty from 'lib/isNilOrEmpty'

/* eslint-disable */
import { yellow, red, redf } from 'logger'
import * as R from 'ramda'

/* eslint-enable */

// const moreThan2Rules = (data) =>
//   data.filter((t) => {
//     if (t.ruleIds === undefined) {
//       // console.log(t.ruleIds)
//       return true
//     }
//     if (t.ruleIds.length > 1) {
//       return true
//     }
//     return false
//   })

// const noRules = (data) =>
//   data.filter((t) => {
//     if (t.ruleIds === undefined) {
//       return true
//     } else if (t.ruleIds.length === 0) {
//       return true
//     }
//     return false
//   })

// const hasRules = (data) =>
//   data.filter((t) => {
//     if (t.ruleIds === undefined) {
//       return false
//     }
//     if (t.ruleIds.length === 0) {
//       return false
//     }
//     return true
//   })

const allDataByDescription = wrap(async (req, res) => {
  const { params } = req
  const { showOmitted, year, month } = params

  // yellow('params', params)
  yellow('year', year)
  yellow('month', R.type(month))
  const f1 =
    showOmitted === 'true' ? { omit: { $eq: true } } : { omit: { $eq: false } }

  // const f2 = !isNilOrEmpty(year) ? R.merge(f1, { })

  const data = await find(TRANSACTIONS_COLLECTION_NAME, f1)
  // TODO: tmp code here
  // const limit = R.take(5, data)
  // yellow('limit100', limit100)
  // res.send({ data: convertFieldValuesToUi(limit), error: null })

  res.send({ data: convertFieldValuesToUi(data), error: null })
})

export default allDataByDescription
