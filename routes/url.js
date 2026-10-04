import express from 'express'
import {
    handleGenerateNewShortUrl,
    handleRedirect,
    handleGetAnalytics,
} from '../controllers/url.js'

const router = express.Router()

router.post('/', handleGenerateNewShortUrl)
router.get('/analytics/:shortId', handleGetAnalytics)
router.get('/:shortId', handleRedirect)

export default router
