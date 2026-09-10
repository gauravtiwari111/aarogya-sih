import mongoose from 'mongoose'

const documentSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      index: true,
    },
    kind: {
      type: String,
      enum: ['prescription', 'lab', 'upload', 'discharge'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      default: () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    preview: {
      type: String,
      default: '',
    },
    extracted: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

export const Document = mongoose.model('Document', documentSchema)
