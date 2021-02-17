import express from 'express'
import upload from './upload'

const router = express.Router()

router.get('/', upload)

export default router
