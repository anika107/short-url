import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'node:crypto'
import { MIN_PASSWORD_LENGTH } from '../constants/constant.js'
import { getBearerToken, isValidEmail } from '../utils/auth.js'
import RevokedToken from '../models/revoked-token.js'
import User from '../models/user.js'

function signToken(userId) {
    return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
        jwtid: randomUUID(),
    })
}

export async function handleRegister(req, res) {
    const { email, password } = req.body ?? {}

    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'A valid email is required' })
    }
    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` })
    }

    const existing = await User.findOne({ email })
    if (existing) {
        return res.status(409).json({ error: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    try {
        const user = await User.create({ email, password: hashedPassword })
        return res.status(201).json({ token: signToken(user._id) })
    } catch (err) {
        if (err?.code === 11000) {
            return res.status(409).json({ error: 'Email already registered' })
        }
        throw err
    }
}

export async function handleLogin(req, res) {
    const { email, password } = req.body ?? {}

    if (!isValidEmail(email) || typeof password !== 'string') {
        return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await User.findOne({ email }).select('+password')
    const matches = user ? await bcrypt.compare(password, user.password) : false

    if (!matches) {
        return res.status(401).json({ error: 'Invalid email or password' })
    }

    return res.json({ token: signToken(user._id) })
}

export async function handleLogout(req, res) {
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

    try {
        await RevokedToken.create({
            jti: payload.jti,
            expiresAt: new Date(payload.exp * 1000),
        })
    } catch (err) {
        // Already revoked (idempotent logout)
        if (err?.code !== 11000) throw err
    }

    return res.json({ message: 'Logged out' })
}
