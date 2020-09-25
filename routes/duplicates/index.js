import express from 'express'
import duplicatesGet from './duplicatesGet'

const router = express.Router()
router.get('/', duplicatesGet)

export default router
