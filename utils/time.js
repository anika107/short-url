import { UNIT_MS } from '../constants/constant.js'

export function parseExpiresIn(value) {
    const match = /^(\d+)([smhdw])$/.exec(value)
    if (!match) return null
    return new Date(Date.now() + Number(match[1]) * UNIT_MS[match[2]])
}
