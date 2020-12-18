import express from 'express'
import amountByCategory from './amountByCategory'
import transactionsChanges from './transactionsChanges'
import originalValues from './originalValues'
import allTransactionsByDescription from './allTransactionsByDescription'

const router = express.Router()

router.get('/amount-by-category', amountByCategory)
router.get('/data-changes', transactionsChanges)
router.get('/original-values', originalValues)
router.get('/all-data-by-description/:showOmitted', allTransactionsByDescription)
router.get('/raw-data', allTransactionsByDescription)

export default router
