import express from 'express'
import criteriaTest from './criteriaTest'

const router = express.Router()

router.post('/criteria-test', criteriaTest)

export default router
