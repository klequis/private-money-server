import express from 'express'
import dataGet from './dataGet'
import dataGetByCriteria from './dataGetByCriteria'

const router = express.Router()

// TODO: not sure which routes are in use
// TODO: some have been replaced by routes in /views

router.get('/', dataGet)
router.get('/:description', dataGet)
router.get('/showOmitted/:showOmitted', dataGet)
router.get('/description/:description/showOmitted/:showOmitted', dataGet)
router.get('/view/viewid', dataGet)
router.post('/criteria', dataGetByCriteria)

export default router
