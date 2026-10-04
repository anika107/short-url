import { randomBytes } from 'node:crypto'

export function generateShortId() {
    return randomBytes(6).toString('base64url')
}

export function isValidHttpUrl(value) {
    try {
        const { protocol } = new URL(value)
        return protocol === 'http:' || protocol === 'https:'
    } catch {
        return false
    }
}
