import { updateMany } from 'db'
import { TRANSACTIONS_COLLECTION_NAME } from 'db/constants'

export const resetTx = async (ruleObjId) => {
  return updateMany(TRANSACTIONS_COLLECTION_NAME, { ruleIds: ruleObjId }, [
    {
      $set: {
        category1: '',
        category2: '',
        ruleIds: [],
        description: '$origDescription'
      }
    }
  ])
}
