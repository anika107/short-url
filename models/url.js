import mongoose from 'mongoose'

const urlSchema = new mongoose.Schema({
    shortId: {
        type: String,
        required: true,
        unique: true,
    },
    redirectUrl: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true,
    },
    expiresAt: {
        type: Date,
        index: { expires: 0 },
    },
    visitHistory: [{ timestamp: { type: Number } }],
},
{
    timestamps: true
}
)

const URL = mongoose.model("url", urlSchema)

export default URL
