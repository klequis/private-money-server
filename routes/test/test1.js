import wrap from 'routes/wrap'
import { executeAggregate, find } from 'db/dbFunctions'
import { TRANSACTIONS_COLLECTION_NAME } from 'db/constants'
import { ObjectID, ObjectId } from 'mongodb'

// eslint-disable-next-line
import { red, green, yellow, logRequest, _log } from 'logger'

const test = wrap(async (req, res) => {
  // Get all the _ids you want to fun the update for.
  // Use a Ramda function that applies a function to all
  // elements of arrays to convert them to ObjectIDs if
  // necessary (they may already be?).
  // Use $in as show below.
  const ret = await find(TRANSACTIONS_COLLECTION_NAME, {
    _id: { $in: [new ObjectId('5e9c76f0e6578c43f74db481')] }
  })

  res.send(ret)
})

export default test
