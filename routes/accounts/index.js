import express from 'express'
import accountsGet from './accountsGet'

const router = express.Router()

router.get('/', accountsGet)

export default router
