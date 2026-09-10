import app from './app.js'
import { connectDB } from './config/db.js'

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 AAROGYA Backend API Server running on http://localhost:${PORT}`)
  connectDB().catch((err) => console.warn('Background DB initialization note:', err.message))
})
