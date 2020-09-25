import wrap from 'routes/wrap'
import { find } from 'db'
import {
  TRANSACTIONS_COLLECTION_NAME,
  convertFieldValuesToUi
} from 'db/constants'
// @ts-ignore
import { yellow, red, redf } from 'logger'

const allDataByDescription = wrap(async (req, res) => {
  // try {
    const data = await find(TRANSACTIONS_COLLECTION_NAME, {})
    // TODO: tmp code
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
    res.send({ data: convertFieldValuesToUi(moreThan2), error: null })
  // } catch (e) {
  //   // redf('views/allDataByDescription', e.message)
  //   throw e
  //   // console.log(e)
  // }
})

export default allDataByDescription

// TODO: 
