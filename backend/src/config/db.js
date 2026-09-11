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

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Initializing MongoDB Memory Server (attempt ${attempt})...`)
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'aarogya',
          ip: '127.0.0.1',
          port: 27050 + attempt,
        },
      })
      const mongoUri = mongoServer.getUri()
      const conn = await mongoose.connect(mongoUri)
      console.log(`MongoDB Memory Server Connected: ${conn.connection.host}`)
      return
    } catch (err) {
      console.warn(`MongoDB Memory Server attempt ${attempt} failed:`, err.message)
      if (mongoServer) {
        try {
          await mongoServer.stop()
        } catch {
          // ignore cleanup errors
        }
        mongoServer = null
      }
    }
  }
  console.warn('API will continue with in-memory demo fallbacks until MongoDB is available.')
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
  if (mongoServer) {
    await mongoServer.stop()
  }
}
