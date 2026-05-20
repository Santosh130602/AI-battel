const express = require('express');
const Room = require('../models/Room');
const { Submission } = require('../models/Submission');
const Round = require('../models/Round');
const authMiddleware = require('../middleware/auth');
const { broadcastToRoom } = require('../socket/socketManager');

const router = express.Router();

// POST /api/rooms — Create a room
router.post('/', authMiddleware, async (req, res) => {
  try {
    const room = new Room({
      hostId: req.user._id,
      participants: [{
        userId: req.user._id,
        name: req.user.name,
      }],
    });
    await room.save();

    console.log(`🏠 Room created: ${room.code} by ${req.user.name}`);
    res.status(201).json({ room });
  } catch (err) {
    console.error('Create room error:', err);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// POST /api/rooms/join — Join by code
router.post('/join', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Room code is required' });
    }

    const room = await Room.findOne({ code: code.toUpperCase() });
    if (!room) {
      return res.status(404).json({ error: 'Room not found. Check the code and try again.' });
    }
    if (room.status === 'finished') {
      return res.status(400).json({ error: 'This room has already finished' });
    }

    // Check if already in room
    const already = room.participants.find(
      (p) => p.userId.toString() === req.user._id.toString()
    );

    if (!already) {
      room.participants.push({ userId: req.user._id, name: req.user.name });
      await room.save();

      // Notify everyone in the room
      broadcastToRoom(room._id.toString(), {
        event: 'participant_joined',
        userId: req.user._id,
        name: req.user.name,
        participants: room.participants,
      });
    }

    console.log(`👤 ${req.user.name} joined room ${room.code}`);
    res.json({ room });
  } catch (err) {
    console.error('Join room error:', err);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// GET /api/rooms/:roomId — Get full room state (for page refresh recovery)
router.get('/:roomId', authMiddleware, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check user is a participant or host
    const isParticipant = room.participants.some(
      (p) => p.userId.toString() === req.user._id.toString()
    );
    const isHost = room.hostId.toString() === req.user._id.toString();
    if (!isParticipant && !isHost) {
      return res.status(403).json({ error: 'You are not in this room' });
    }

    // Get current round
    const currentRound = await Round.findOne({ roomId: room._id }).sort({ createdAt: -1 });

    // Get all submissions for current round
    let submissions = [];
    if (currentRound) {
      submissions = await Submission.find({ roundId: currentRound._id });
    }

    res.json({
      room,
      currentRound: currentRound || null,
      submissions,
      isHost,
    });
  } catch (err) {
    console.error('Get room error:', err);
    res.status(500).json({ error: 'Failed to get room' });
  }
});

module.exports = router;
