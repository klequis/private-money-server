import express from 'express'
import upload from './upload'
import test from './test'

const router = express.Router()

router.post('/upload', upload)
router.get('/test', test)

export default router
