import express from 'express'
import exportData from './exportData'

const router = express.Router()
router.get('/', exportData)

export default router
