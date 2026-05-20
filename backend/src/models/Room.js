const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const roomSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    default: () => Math.random().toString(36).substring(2, 8).toUpperCase(),
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['waiting', 'round_active', 'scoring', 'finished'],
    default: 'waiting',
  },
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    joinedAt: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true,
});

// Virtual: current round
roomSchema.virtual('currentRound', {
  ref: 'Round',
  localField: '_id',
  foreignField: 'roomId',
  justOne: true,
  options: { sort: { createdAt: -1 } },
});

module.exports = mongoose.model('Room', roomSchema);
