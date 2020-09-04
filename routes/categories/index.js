import express from 'express'
import categoriesGet from './categoriesGet'

const router = express.Router()
router.get('/', categoriesGet)

export default router
