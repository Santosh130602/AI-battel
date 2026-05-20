const mongoose = require('mongoose');

// ── GenerationJob ──────────────────────────────────────────────
const generationJobSchema = new mongoose.Schema({
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: true,
  },
  // queued → running → completed | failed | timed_out
  status: {
    type: String,
    enum: ['queued', 'running', 'completed', 'failed', 'timed_out'],
    default: 'queued',
  },
  errorMessage: String,
  startedAt: Date,
  completedAt: Date,
}, {
  timestamps: true,
});

const GenerationJob = mongoose.model('GenerationJob', generationJobSchema);

// ── Submission ─────────────────────────────────────────────────
const submissionSchema = new mongoose.Schema({
  roundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Round',
    required: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participantName: {
    type: String,
    required: true,
  },
  userPrompt: {
    type: String,
    required: true,
  },
  aiOutput: String,
  // overall status mirrors the job status for convenience
  status: {
    type: String,
    enum: ['pending', 'queued', 'running', 'completed', 'failed', 'timed_out'],
    default: 'pending',
  },
  // scoring
  score: {
    type: Number,
    min: 0,
    max: 10,
    default: null,
  },
  isEliminated: {
    type: Boolean,
    default: false,
  },
  isWinner: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = { Submission, GenerationJob };
