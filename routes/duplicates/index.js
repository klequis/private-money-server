import express from 'express'
// import duplicatesCheckNew from './duplicatesCheckNew'
// import duplicatesByAccountGet from './duplicatesByAccountGet'
import duplicatesGet from './duplicatesGet'

const router = express.Router()
router.get('/', duplicatesGet)
// router.get('/check-new-duplicates', duplicatesCheckNew)
// router.get('/duplicates-by-account', duplicatesByAccountGet)

export default router
