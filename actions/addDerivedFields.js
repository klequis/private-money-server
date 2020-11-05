import { updateMany } from 'db'
import { TRANSACTIONS_COLLECTION_NAME } from 'db/constants'
import * as R from 'ramda'

// filter = {}

// set hasRule = ruleIds.length > 0

// set hasCategory = notIsNilOrEmpty(category1)

const addDerivedFields = () => {
  const transformations = (t) => {
    return {
      hasRule: x => t.ruleIds.length > 0
    }
  }
}


