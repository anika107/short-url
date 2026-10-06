import jwt from 'jsonwebtoken'
import { getBearerToken } from '../utils/auth.js'
import RevokedToken from '../models/revoked-token.js'

export async function requireAuth(req, res, next) {
    const token = getBearerToken(req)

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' })
    }

    let payload
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' })
    }

    if (await RevokedToken.exists({ jti: payload.jti })) {
        return res.status(401).json({ error: 'Token has been revoked' })
    }

    req.user = { id: payload.sub, jti: payload.jti, exp: payload.exp }
    next()
}
