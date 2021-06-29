import express from 'express'
// import importData from './importData'
import importPost from './importPost'

const router = express.Router()

// TODO: once Dropzone import is done should I delete this route which
// was used to import from the data/
// router.get('/', importData)
router.post('/', importPost)

export default router
