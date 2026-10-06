import mongoose from 'mongoose'

const revokedTokenSchema = new mongoose.Schema({
    jti: {
        type: String,
        required: true,
        unique: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 },
    },
})

const RevokedToken = mongoose.model('revoked-token', revokedTokenSchema)

export default RevokedToken
