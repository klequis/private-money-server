import express, { response } from 'express'
import { find, insertOne } from 'db'
import { USERS_COLLECTION_NAME } from 'routes/constants'

const router = express.Router()

router.post('/', async (req, res) => {
  const { userId } = req.body
  const userExists = await find(USERS_COLLECTION_NAME, {})

  if (userExists.length === 0) {
    const userAdded = await insertOne(USERS_COLLECTION_NAME, {
      userId
    })
    res.send(userAdded)
  } else {
    res.send(userExists)
  }
})

export default router
