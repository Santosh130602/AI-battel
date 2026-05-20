const express = require('express');
const Room = require('../models/Room');
const Round = require('../models/Round');
const { Submission, GenerationJob } = require('../models/Submission');
const authMiddleware = require('../middleware/auth');
const { broadcastToRoom } = require('../socket/socketManager');
const { runGenerationJob } = require('../workers/jobRunner');

const router = express.Router();

// POST /api/rounds/start — Host starts a round
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const { roomId, challengePrompt, timeLimitSeconds } = req.body;

    if (!roomId || !challengePrompt) {
      return res.status(400).json({ error: 'roomId and challengePrompt are required' });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // ── BACKEND ENFORCED: only host can start a round ──
    if (room.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the host can start a round' });
    }

    if (room.status === 'round_active') {
      return res.status(400).json({ error: 'A round is already active' });
    }

    // Create the round
    const round = new Round({
      roomId: room._id,
      challengePrompt: challengePrompt.trim(),
      timeLimitSeconds: timeLimitSeconds || 120,
      status: 'active',
    });
    await round.save();

    // Update room status
    room.status = 'round_active';
    await room.save();

    // Broadcast to all in room
    broadcastToRoom(roomId, {
      event: 'round_started',
      round: {
        _id: round._id,
        challengePrompt: round.challengePrompt,
        timeLimitSeconds: round.timeLimitSeconds,
        status: round.status,
        startedAt: round.startedAt,
      },
    });

    console.log(`⚔️  Round started in room ${room.code}: "${challengePrompt}"`);
    res.status(201).json({ round });
  } catch (err) {
    console.error('Start round error:', err);
    res.status(500).json({ error: 'Failed to start round' });
  }
});

// POST /api/rounds/:roundId/submit — Participant submits a prompt
router.post('/:roundId/submit', authMiddleware, async (req, res) => {
  try {
    const { userPrompt } = req.body;
    const { roundId } = req.params;

    if (!userPrompt || userPrompt.trim().length < 3) {
      return res.status(400).json({ error: 'Prompt must be at least 3 characters' });
    }

    const round = await Round.findById(roundId);
    if (!round) return res.status(404).json({ error: 'Round not found' });

    const room = await Room.findById(round.roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // ── BACKEND ENFORCED: host cannot submit ──
    if (room.hostId.toString() === req.user._id.toString()) {
      return res.status(403).json({ error: 'The host cannot submit entries' });
    }

    // ── BACKEND ENFORCED: round must be active ──
    if (round.status !== 'active') {
      return res.status(400).json({ error: 'This round is not accepting submissions' });
    }

    // ── BACKEND ENFORCED: one submission per participant per round ──
    const existing = await Submission.findOne({
      roundId: round._id,
      participantId: req.user._id,
    });
    if (existing) {
      return res.status(409).json({ error: 'You have already submitted for this round' });
    }

    // Create submission
    const submission = new Submission({
      roundId: round._id,
      roomId: room._id,
      participantId: req.user._id,
      participantName: req.user.name,
      userPrompt: userPrompt.trim(),
      status: 'queued',
    });
    await submission.save();

    // Create the generation job
    const job = new GenerationJob({
      submissionId: submission._id,
      status: 'queued',
    });
    await job.save();

    // Broadcast: new submission queued
    broadcastToRoom(room._id.toString(), {
      event: 'job_status_changed',
      submissionId: submission._id,
      jobId: job._id,
      participantId: req.user._id,
      participantName: req.user.name,
      userPrompt: submission.userPrompt,
      status: 'queued',
    });

    // 🔥 Fire the background job (NON-BLOCKING)
    runGenerationJob(job._id.toString(), submission._id.toString(), room._id.toString());

    // Return immediately
    res.status(202).json({
      submissionId: submission._id,
      jobId: job._id,
      status: 'queued',
      message: 'Submission queued for AI generation',
    });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ error: 'Failed to submit prompt' });
  }
});

// POST /api/rounds/:roundId/end — Host ends the round (opens scoring)
router.post('/:roundId/end', authMiddleware, async (req, res) => {
  try {
    const { roundId } = req.params;

    const round = await Round.findById(roundId);
    if (!round) return res.status(404).json({ error: 'Round not found' });

    const room = await Room.findById(round.roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // ── BACKEND ENFORCED: only host can end round ──
    if (room.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the host can end the round' });
    }

    round.status = 'scoring';
    round.endedAt = new Date();
    await round.save();

    room.status = 'scoring';
    await room.save();

    broadcastToRoom(room._id.toString(), {
      event: 'round_ended',
      roundId: round._id,
    });

    res.json({ message: 'Round ended, scoring phase started' });
  } catch (err) {
    console.error('End round error:', err);
    res.status(500).json({ error: 'Failed to end round' });
  }
});

// POST /api/rounds/submissions/:submissionId/score — Host scores a submission
router.post('/submissions/:submissionId/score', authMiddleware, async (req, res) => {
  try {
    const { score, isEliminated, isWinner } = req.body;
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    const room = await Room.findById(submission.roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // ── BACKEND ENFORCED: only host can score ──
    if (room.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the host can score submissions' });
    }

    if (score !== undefined) submission.score = score;
    if (isEliminated !== undefined) submission.isEliminated = isEliminated;
    if (isWinner !== undefined) submission.isWinner = isWinner;
    await submission.save();

    // Broadcast score update
    broadcastToRoom(room._id.toString(), {
      event: 'submission_scored',
      submissionId: submission._id,
      score: submission.score,
      isEliminated: submission.isEliminated,
      isWinner: submission.isWinner,
    });

    res.json({ submission });
  } catch (err) {
    console.error('Score error:', err);
    res.status(500).json({ error: 'Failed to score submission' });
  }
});

// POST /api/rounds/submissions/:submissionId/retry — Retry a failed job
router.post('/submissions/:submissionId/retry', authMiddleware, async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    const room = await Room.findById(submission.roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // Only host can retry (or the participant themselves)
    const isHost = room.hostId.toString() === req.user._id.toString();
    const isOwner = submission.participantId.toString() === req.user._id.toString();
    if (!isHost && !isOwner) {
      return res.status(403).json({ error: 'Not authorized to retry this submission' });
    }

    if (!['failed', 'timed_out'].includes(submission.status)) {
      return res.status(400).json({ error: 'Can only retry failed or timed out submissions' });
    }

    // Create a new job
    const job = new GenerationJob({
      submissionId: submission._id,
      status: 'queued',
    });
    await job.save();

    submission.status = 'queued';
    await submission.save();

    broadcastToRoom(room._id.toString(), {
      event: 'job_status_changed',
      submissionId: submission._id,
      jobId: job._id,
      participantName: submission.participantName,
      userPrompt: submission.userPrompt,
      status: 'queued',
    });

    // Fire background job
    runGenerationJob(job._id.toString(), submission._id.toString(), room._id.toString());

    res.json({ message: 'Retry queued', jobId: job._id });
  } catch (err) {
    console.error('Retry error:', err);
    res.status(500).json({ error: 'Failed to retry' });
  }
});

module.exports = router;
