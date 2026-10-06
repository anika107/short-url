import express from 'express'
import { connectToMongoDB } from './connect.js'
import authRoute from './routes/auth.js'
import urlRoute from './routes/url.js'

process.loadEnvFile()

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in .env')
}

const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI

const app = express()

app.use(express.json())
app.use('/auth', authRoute)
app.use('/url', urlRoute)

app.use((req, res) => res.status(404).json({ error: 'Not found' }))

app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
})

async function main() {
    await connectToMongoDB(MONGODB_URI)
    console.log('mongodb connected')
    app.listen(PORT, () => console.log(`Server started at port:${PORT}`))
}

main().catch((err) => {
    console.error('Failed to start server:', err)
    process.exit(1)
})
