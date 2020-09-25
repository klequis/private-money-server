import express from 'express'
import rulesGet from './rulesGet'
import ruleGet from './ruleGet'
import rulePatch from './rulePatch'
import rulePost from './rulePost'
import ruleDelete from './ruleDelete'

const router = express.Router()

router.get('/', rulesGet)
router.get('/ruleid/:ruleid', ruleGet)
router.patch('/ruleid/:ruleid', rulePatch)
router.post('/new-rule', rulePost)
router.delete('/ruleid/:ruleid', ruleDelete)

export default router
