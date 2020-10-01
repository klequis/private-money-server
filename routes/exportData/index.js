import express from 'express'
import exportTransactions from './exportTransactions'
import exportRawData from './exportRawData'

const router = express.Router()
router.get('/transactions', exportTransactions)
router.get('/raw-data', exportRawData)

export default router
