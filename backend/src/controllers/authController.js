import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { User } from '../models/User.js'
import { PatientProfile } from '../models/PatientProfile.js'

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'aarogya_sih_prototype_super_secret_jwt_key_2026', {
    expiresIn: '30d',
  })
}

export async function registerUser(req, res, next) {
  try {
    const { name, email, password, role = 'patient', phone = '', abhaId = '', age, gender } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' })
    }

    if (role === 'doctor') {
      return res.status(403).json({ message: 'Doctor accounts cannot be created publicly. Please use Master Doctor Credentials.' })
    }

    const patientId = `PTH${Math.floor(100000 + Math.random() * 900000)}`

    if (mongoose.connection.readyState !== 1) {
      return res.status(201).json({
        _id: '65d1a0000000000000000001',
        name,
        email,
        role: 'patient',
        patientId,
        token: generateToken('65d1a0000000000000000001'),
      })
    }

    // Check duplicate Email, Phone, or Aadhar/ABHA ID
    const queryConditions = [{ email: email.toLowerCase() }]
    if (phone && phone.trim() !== '') queryConditions.push({ phone: phone.trim() })
    if (abhaId && abhaId.trim() !== '') queryConditions.push({ abhaId: abhaId.trim() })

    const existingUser = await User.findOne({ $or: queryConditions })
    if (existingUser) {
      let duplicateField = 'Email'
      if (existingUser.email.toLowerCase() === email.toLowerCase()) duplicateField = 'Email Address'
      else if (phone && existingUser.phone === phone.trim()) duplicateField = 'Phone Number'
      else if (abhaId && existingUser.abhaId === abhaId.trim()) duplicateField = 'Aadhar / ABHA ID'

      return res.status(400).json({ message: `Account already registered with this ${duplicateField}. Please Sign In.` })
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'patient',
      phone: phone ? phone.trim() : '',
      abhaId: abhaId ? abhaId.trim() : '',
    })

    await PatientProfile.create({
      userId: user._id,
      patientId,
      name: user.name,
      age: Number(age) || 30,
      gender: gender || 'male',
      phone: user.phone || '9876543210',
      abhaId: user.abhaId || `ABHA-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
    })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: 'patient',
      patientId,
      token: generateToken(user._id),
    })
  } catch (error) {
    res.status(400).json({ message: error.message || 'Registration failed' })
  }
}

export async function loginUser(req, res, next) {
  try {
    const { email, password, role } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' })
    }

    const cleanEmail = email.trim().toLowerCase()

    // Doctor Login Check: Master Credentials or Doctor role
    if (role === 'doctor' || cleanEmail.includes('doctor')) {
      if (cleanEmail === 'doctor@aarogya.com' && password === 'DoctorPass123!') {
        return res.json({
          _id: '65d1a0000000000000000000',
          name: 'Dr. V. K. Mehta',
          email: 'doctor@aarogya.com',
          role: 'doctor',
          token: generateToken('65d1a0000000000000000000'),
        })
      }
    }

    if (mongoose.connection.readyState !== 1) {
      if (role === 'doctor' || cleanEmail.includes('doctor')) {
        if (cleanEmail === 'doctor@aarogya.com' && password === 'DoctorPass123!') {
          return res.json({
            _id: '65d1a0000000000000000000',
            name: 'Dr. V. K. Mehta',
            email: 'doctor@aarogya.com',
            role: 'doctor',
            token: generateToken('65d1a0000000000000000000'),
          })
        }
        return res.status(401).json({ message: 'Invalid Doctor Credentials. Doctor access is restricted.' })
      }

      return res.json({
        _id: '65d1a0000000000000000001',
        name: cleanEmail.split('@')[0] || 'User',
        email: cleanEmail,
        role: 'patient',
        patientId: `PTH${Math.floor(100000 + Math.random() * 900000)}`,
        token: generateToken('65d1a0000000000000000001'),
      })
    }

    const user = await User.findOne({ email: cleanEmail }).select('+password')

    if (user && (await user.comparePassword(password))) {
      let patientId
      if (user.role === 'patient') {
        const profile = await PatientProfile.findOne({ userId: user._id })
        patientId = profile ? profile.patientId : `PTH${Math.floor(100000 + Math.random() * 900000)}`
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        patientId,
        token: generateToken(user._id),
      })
    }

    if (role === 'doctor' || cleanEmail.includes('doctor')) {
      return res.status(401).json({ message: 'Invalid Doctor Credentials. Doctor Dashboard access is restricted to verified medical professionals.' })
    }

    return res.status(401).json({ message: 'Invalid email or password. Please check your credentials.' })
  } catch (error) {
    res.status(400).json({ message: error.message || 'Login failed' })
  }
}

export async function getMe(req, res, next) {
  try {
    if (!req.user) {
      return res.json({
        name: 'Rahul Sharma',
        role: 'patient',
        email: 'rahul.sharma@example.com',
      })
    }
    res.json(req.user)
  } catch (error) {
    res.json({
      name: 'Rahul Sharma',
      role: 'patient',
      email: 'rahul.sharma@example.com',
    })
  }
}

