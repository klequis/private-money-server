import express from 'express'
import test1 from './test1'
import convertDebitValueToNumber from './convertDebitValueToNumber'
import update1FieldWithAnother from './update1fieldWithAnother'

const router = express.Router()

router.get('/test1', test1)
router.get('/convert-debit-value-to-number', convertDebitValueToNumber)
router.get('/update-1-field-with-another', update1FieldWithAnother)

export default router
