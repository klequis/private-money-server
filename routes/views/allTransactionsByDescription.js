import wrap from 'routes/wrap'
import { find } from 'db'
import {
  TRANSACTIONS_COLLECTION_NAME,
  convertFieldValuesToUi
} from 'db/constants'
// @ts-ignore
import { yellow, red, redf } from 'logger'

const moreThan2Rules = (data) => data.filter(t => {
  if (t.ruleIds === undefined) {
    // console.log(t.ruleIds)
    return true
  }
  if (t.ruleIds.length > 1) {
    return true
  }
  return false
})

const noRules = (data) => data.filter(t => {
  if (t.ruleIds === undefined) {
    return true
  } else if (t.ruleIds.length === 0) {
    return true
  }
  return false
})

const hasRules = (data) => data.filter(t => {
  if (t.ruleIds === undefined) {
    return false
  }
  if (t.ruleIds.length === 0) {
    return false
  }
  return true
})


const allDataByDescription = wrap(async (req, res) => {
  // try {
  const data = await find(TRANSACTIONS_COLLECTION_NAME, {})
  // TODO: tmp code
  // const filtered = hasRules(data)
  res.send({ data: convertFieldValuesToUi(data), error: null })
  // } catch (e) {
  //   // redf('views/allDataByDescription', e.message)
  //   throw e
  //   // console.log(e)
  // }
})

export default allDataByDescription

// TODO: 
