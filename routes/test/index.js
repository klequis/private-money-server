import express from 'express'
import test1 from './test1'
import convertDebitValueToNumber from './convertDebitValueToNumber'

const router = express.Router()

router.get('/test1', test1)
router.get('/convert-debit-value-to-number', convertDebitValueToNumber)

export default router
