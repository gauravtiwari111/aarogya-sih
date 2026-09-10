import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      index: true,
    },
    answers: [
      {
        questionId: String,
        value: String,
      },
    ],
    messages: [
      {
        id: String,
        role: { type: String, enum: ['ai', 'patient'] },
        text: String,
        questionId: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
)

export const Conversation = mongoose.model('Conversation', conversationSchema)
