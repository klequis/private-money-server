import express from 'express'
import importData from './importData'

const router = express.Router()
router.get('/', importData)

export default router
