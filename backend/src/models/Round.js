const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  challengePrompt: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'scoring', 'completed'],
    default: 'active',
  },
  timeLimitSeconds: {
    type: Number,
    default: 120,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: Date,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Round', roundSchema);
