import wrap from 'routes/wrap'
import { find } from 'db'
import {
  TRANSACTIONS_COLLECTION_NAME,
  convertFieldValuesToUi
} from 'db/constants'
// eslint-disable-next-line
import { yellow, red, redf } from 'logger'

const allDataByDescription = wrap(async (req, res) => {
  try {
    const data = await find(TRANSACTIONS_COLLECTION_NAME, {})
    // const noRule = data.map(t => {
    //   if (ruleIds === undefined) {
    //     console.log(t.ruleIds)

    //   }
    // })

    // data.forEach(t => {
    //   if (t.ruleIds === undefined) {
    //     console.log(ruleIds)
    //   } else if (t.ruleIds.length < 1) {
    //     console.log(ruleIds)
    //   }
    // })
    const moreThan2 = data.filter(t => {
      if (t.ruleIds === undefined) {
        // console.log(t.ruleIds)
        return true
      }
      if (t.ruleIds.length > 1) {
        return true
      }
      return false
    })
    // yellow('moreThan2', moreThan2.length)

    // TODO: remove slice
    // const d1 = data.slice(1, 5, data)
    // red(`TODO: results truncated to ${d1.length} transactions`)
    res.send(convertFieldValuesToUi(moreThan2))
  } catch (e) {
    redf('views/allDataByDescription', e.message)
    console.log(e)
  }
})

export default allDataByDescription
