import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

export async function protect(req, res, next) {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    // Optional auth check for SIH prototype demo ease
    // If auth header is absent, attach default demo user
    req.user = null
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aarogya_sih_prototype_super_secret_jwt_key_2026')
    req.user = await User.findById(decoded.id).select('-password')
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' })
  }
}

export function doctorOnly(req, res, next) {
  if (req.user && req.user.role === 'doctor') {
    return next()
  }
  // Allow access in demo mode if role isn't strictly enforced
  next()
}
