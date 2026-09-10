import mongoose from 'mongoose'

const patientProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    patientId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    phone: {
      type: String,
      default: '',
    },
    abhaId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

export const PatientProfile = mongoose.model('PatientProfile', patientProfileSchema)
