import UrlModel from '../models/url.js'
import { generateShortId, isValidHttpUrl } from '../utils/url.js'

const MAX_ID_ATTEMPTS = 5

export async function handleGenerateNewShortUrl(req, res) {
    const { url } = req.body ?? {}

    if (!isValidHttpUrl(url)) {
        return res.status(400).json({ error: 'A valid http(s) URL is required' })
    }

    for (let attempt = 0; attempt < MAX_ID_ATTEMPTS; attempt++) {
        const shortId = generateShortId()
        try {
            const entry = await UrlModel.create({ shortId, redirectUrl: url })
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

    return res.redirect(entry.redirectUrl)
}

export async function handleGetAnalytics(req, res) {
    const entry = await UrlModel.findOne({ shortId: req.params.shortId })

    if (!entry) {
        return res.status(404).json({ error: 'Short URL not found' })
    }

    return res.json({
        totalClicks: entry.visitHistory.length,
        visitHistory: entry.visitHistory,
    })
}
