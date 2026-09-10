import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import dns from 'dns'

try {
  dns.setServers(['8.8.8.8', '8.8.4.4'])
} catch (e) {
  // fallback if environment doesn't allow setting custom dns servers
}

dns.setDefaultResultOrder('ipv4first')

let mongoServer = null

export async function connectDB() {
  const uri = process.env.MONGODB_URI

  try {
    if (uri && uri.trim() !== '') {
      console.log('Connecting to MongoDB Atlas / Remote MongoDB...')
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
      console.log(`MongoDB Connected: ${conn.connection.host}`)
      return
    }
  } catch (error) {
    console.warn('Could not connect to specified MONGODB_URI:', error.message)
  }

  // Attempt Mongo Memory Server asynchronously
  try {
    console.log('Initializing MongoDB Memory Server...')
    mongoServer = await MongoMemoryServer.create()
    const mongoUri = mongoServer.getUri()
    const conn = await mongoose.connect(mongoUri)
    console.log(`MongoDB Memory Server Connected: ${conn.connection.host}`)
  } catch (err) {
    console.warn('MongoDB Memory Server initialization skipped or pending:', err.message)
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
  if (mongoServer) {
    await mongoServer.stop()
  }
}
