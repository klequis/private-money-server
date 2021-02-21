import express from 'express'

// duplicates
import { duplicatesCheckNew } from './duplicatesCheckNew'
import { duplicatesByAccountGet } from './duplicatesByAccountGet'

const router = express.Router()

router.get('/duplicates-by-account', duplicatesByAccountGet)
router.get('/check-new-duplicates', duplicatesCheckNew)

export default router
