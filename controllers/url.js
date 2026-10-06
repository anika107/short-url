import { MAX_ID_ATTEMPTS } from '../constants/constant.js'
import UrlModel from '../models/url.js'
import { parseExpiresIn } from '../utils/time.js'
import { generateShortId, isValidHttpUrl } from '../utils/url.js'

export async function handleGenerateNewShortUrl(req, res) {
    const { url, expiresIn } = req.body ?? {}

    if (!isValidHttpUrl(url)) {
        return res.status(400).json({ error: 'A valid http(s) URL is required' })
    }

    let expiresAt
    if (expiresIn !== undefined) {
        expiresAt = parseExpiresIn(expiresIn)
        if (!expiresAt) {
            return res.status(400).json({ error: 'expiresIn must be a duration like "30m", "2h", "7d"' })
        }
    }

    for (let attempt = 0; attempt < MAX_ID_ATTEMPTS; attempt++) {
        const shortId = generateShortId()
        try {
            const entry = await UrlModel.create({
                shortId,
                redirectUrl: url,
                owner: req.user.id,
                expiresAt,
            })
            return res.status(201).json({ id: entry.shortId })
        } catch (err) {
            const isDuplicate = err?.code === 11000
            if (!isDuplicate || attempt === MAX_ID_ATTEMPTS - 1) throw err
        }
    }
}

export async function handleRedirect(req, res) {
    const entry = await UrlModel.findOneAndUpdate(
        { shortId: req.params.shortId },
        { $push: { visitHistory: { timestamp: Date.now() } } }
    )

    if (!entry) {
        return res.status(404).json({ error: 'Short URL not found' })
    }

    if (entry.expiresAt && entry.expiresAt < new Date()) {
        return res.status(410).json({ error: 'This short URL has expired' })
    }

    return res.redirect(entry.redirectUrl)
}

export async function handleGetAnalytics(req, res) {
    const entry = await UrlModel.findOne({
        shortId: req.params.shortId,
        owner: req.user.id,
    })

    if (!entry) {
        return res.status(404).json({ error: 'Short URL not found' })
    }

    return res.json({
        totalClicks: entry.visitHistory.length,
        visitHistory: entry.visitHistory,
    })
}
