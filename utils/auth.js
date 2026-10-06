export function isValidEmail(value) {
    return typeof value === 'string' && /^\S+@\S+\.\S+$/.test(value)
}

export function getBearerToken(req) {
    const header = req.headers.authorization ?? ''
    return header.startsWith('Bearer ') ? header.slice(7) : null
}
