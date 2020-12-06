import wrap from 'routes/wrap'
import { executeAggregate } from 'db/dbFunctions'
import { TRANSACTIONS_COLLECTION_NAME } from 'db/constants'

// eslint-disable-next-line
import { red, green, yellow, logRequest } from 'logger'

const amountByCategory = wrap(async (req, res) => {
  const match1 = {
    $match: { omit: false }
  }

  const addFields = {
    $addFields: {
      // amount: '$debit'
      amount: { 
        $cond: { 
          if: { $gt: ['$credit', 0] }, then: '$credit', else: '$debit' 
        } 
      },
      type: { 
        $cond: { 
          if: { $gt: ['$credit', 0] }, then: 'credit', else: 'debit' 
        } 
      }
    }
  }

  const project1 = {
    $project: {
      _id: 0,
      date: 1,
      description: 1,
      credit: 1,
      debit: 1,
      category1: 1,
      amount: 1,
      type: 1
    }
  }


  const group1 = {
    $group: {
      _id: '$category1',
      // debit: { $sum: '$debit' },
      // credit: { $sum: '$credit' }
      amount: { $sum: '$amount' }
      // count: { sum: 1 }
    }
  }

  // const q = [match1, addFields, project1, group1]
  const q = [match1, addFields, project1, group1]

  const ret = await executeAggregate(TRANSACTIONS_COLLECTION_NAME, q)
  yellow('WARN', 'should convert values ToUi?')
  res.send(ret)
})

export default amountByCategory
