import wrap from 'routes/wrap'
import { find } from 'db'
import {
  TRANSACTIONS_COLLECTION_NAME,
  convertFieldValuesToUi
} from 'db/constants'

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
  const data = await find(TRANSACTIONS_COLLECTION_NAME, {})

  // TODO: tmp code here
  // const limit100 = R.take(100, data)
  // res.send({ data: convertFieldValuesToUi(limit100), error: null })

  res.send({ data: convertFieldValuesToUi(data), error: null })
})

export default allDataByDescription
