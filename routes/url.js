import express from 'express'
import {
    handleGenerateNewShortUrl,
    handleRedirect,
    handleGetAnalytics,
} from '../controllers/url.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.post('/', requireAuth, handleGenerateNewShortUrl)
router.get('/analytics/:shortId', requireAuth, handleGetAnalytics)
router.get('/:shortId', handleRedirect)

export default router
