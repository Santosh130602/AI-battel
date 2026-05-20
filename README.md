# ⚔️ AI Battle Room

A real-time creative competition app where participants submit prompts, AI generates content from those prompts as background jobs, and the host scores/crowns a winner.

---

## Stack

| Layer     | Technology                                     |
|-----------|------------------------------------------------|
| Frontend  | React 18 + Vite + TypeScript + Tailwind CSS + Zustand |
| Backend   | Node.js + Express                              |
| Real-time | Socket.io (WebSockets)                         |
| Database  | MongoDB + Mongoose                             |
| AI        | Anthropic Claude / OpenAI / Mock (toggleable)  |
| Auth      | JWT (bcrypt password hashing)                  |

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set AI_PROVIDER=mock to run without any API key
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:5173

---

## Environment Variables (backend/.env)

| Variable          | Description                                    | Default         |
|-------------------|------------------------------------------------|-----------------|
| `PORT`            | Server port                                    | `4000`          |
| `MONGODB_URI`     | MongoDB connection string                      | local db        |
| `JWT_SECRET`      | Secret for signing JWTs                        | **change this** |
| `AI_PROVIDER`     | `mock`, `anthropic`, or `openai`               | `mock`          |
| `ANTHROPIC_API_KEY` | Your Anthropic key (if provider=anthropic)   | —               |
| `OPENAI_API_KEY`  | Your OpenAI key (if provider=openai)           | —               |
| `FRONTEND_URL`    | For CORS                                       | `localhost:5173` |

---

## Database Schema

### Users
```
_id, name, email, passwordHash, createdAt, updatedAt
```

### Rooms
```
_id, code (6-char, unique), hostId → User,
status: waiting | round_active | scoring | finished,
participants: [{ userId, name, joinedAt }],
createdAt, updatedAt
```

### Rounds
```
_id, roomId → Room, challengePrompt, 
status: active | scoring | completed,
timeLimitSeconds, startedAt, endedAt
```

### Submissions
```
_id, roundId → Round, roomId → Room, participantId → User,
participantName, userPrompt, aiOutput,
status: pending | queued | running | completed | failed | timed_out,
score (0–10), isEliminated, isWinner,
createdAt, updatedAt
```

### GenerationJobs
```
_id, submissionId → Submission,
status: queued | running | completed | failed | timed_out,
errorMessage, startedAt, completedAt,
createdAt, updatedAt
```

---

## Real-Time Event Reference (Socket.io)

All events are emitted to the room's socket room as `room_event`.

| Event                | Payload Fields                                    | Who Sees It |
|---------------------|---------------------------------------------------|-------------|
| `round_started`     | `{ round }`                                       | Everyone    |
| `participant_joined`| `{ userId, name, participants[] }`                | Everyone    |
| `job_status_changed`| `{ submissionId, jobId, participantName, userPrompt, status, aiOutput?, error? }` | Everyone |
| `round_ended`       | `{ roundId }`                                     | Everyone    |
| `submission_scored` | `{ submissionId, score, isEliminated, isWinner }` | Everyone    |

---

## Job Lifecycle

```
HTTP POST /rounds/:id/submit
     │
     ▼
Submission created (status: queued)
GenerationJob created (status: queued)
Broadcast: job_status_changed { status: "queued" }
HTTP returns 202 immediately ← non-blocking
     │
     ▼ (background, no HTTP connection)
runGenerationJob() fires as async promise
     │
     ├─ status → "running"
     │  Broadcast: job_status_changed { status: "running" }
     │
     ├─ AI call (max 45s timeout)
     │
     ├─ SUCCESS → status: "completed", aiOutput saved
     │  Broadcast: job_status_changed { status: "completed", aiOutput }
     │
     ├─ TIMEOUT → status: "timed_out"
     │  Broadcast: job_status_changed { status: "timed_out", error }
     │
     └─ ERROR → status: "failed"
        Broadcast: job_status_changed { status: "failed", error }
```

---

## Scoring / Judging Mechanism

**Design choice: Host-as-judge with manual scoring (1–10) + binary actions**

The assignment intentionally left scoring open-ended. I chose host-manual judging because:

1. **Creative content is subjective** — AI-judging creative campaigns would produce arbitrary or gameable results
2. **Simplicity** — A live host watching the room is the most reliable judge
3. **Social dynamics** — Host judgment creates tension and excitement (like a talent show)

The host can:
- Score each entry 1–10 (shown to all participants in real-time)
- Eliminate weak entries (they collapse to the bottom)
- Crown one winner (highlighted with trophy)

**Weaknesses:**
- Host can be biased toward friends
- No automated fairness enforcement
- If host disconnects during scoring, the round stalls

**What I'd add with more time:**
- Optional AI auto-judge mode (ask Claude to score each entry 1–10 with reasoning)
- Time-boxed voting by participants (democracy mode)
- Anonymous submissions (hide names until scoring)

---

## Role Enforcement (Backend)

All role checks happen server-side, not just in the UI:

| Action              | Check                                | Error            |
|---------------------|--------------------------------------|------------------|
| Start round         | `room.hostId === req.user._id`       | 403              |
| End round           | `room.hostId === req.user._id`       | 403              |
| Submit entry        | `room.hostId !== req.user._id`       | 403              |
| Score submission    | `room.hostId === req.user._id`       | 403              |
| Duplicate submit    | One submission per user per round    | 409              |
| Submit to inactive  | `round.status === 'active'`          | 400              |

---

## What's Not Built / Future Work

- **Multiple rounds per room** — currently one round per room (schema supports more)
- **Spectator mode** — non-participants watching
- **Room password protection**
- **AI judge mode** — automatic scoring via Claude
- **Image generation** — Stable Diffusion / DALL-E integration
- **Celery/Redis job queue** — for production scale (currently in-process async)
- **Room history / replay** — past battles viewable
- **Rate limiting** — API endpoint protection

---

## Project Structure

```
ai-battle-room/
├── backend/
│   ├── src/
│   │   ├── server.js           Entry point
│   │   ├── app.js              Express app + routes
│   │   ├── db.js               MongoDB connection
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Room.js
│   │   │   ├── Round.js
│   │   │   └── Submission.js   + GenerationJob
│   │   ├── routes/
│   │   │   ├── auth.js         Register, login, /me
│   │   │   ├── rooms.js        Create, join, get state
│   │   │   └── rounds.js       Start, submit, end, score, retry
│   │   ├── middleware/
│   │   │   └── auth.js         JWT verification
│   │   ├── socket/
│   │   │   └── socketManager.js  Socket.io init + broadcast
│   │   ├── services/
│   │   │   └── aiProvider.js   Mock + Anthropic + OpenAI
│   │   └── workers/
│   │       └── jobRunner.js    Async background job pipeline
│   ├── package.json
│   └── .env.example
│
└── frontend/
    └── src/
        ├── types/index.ts        All TypeScript types
        ├── lib/api.ts            Axios client
        ├── store/
        │   ├── authStore.ts      Persisted auth (survives refresh)
        │   └── roomStore.ts      Live room state + event handler
        ├── hooks/
        │   ├── useWebSocket.ts   Socket connection + auto-reconnect
        │   └── useCountdown.ts   Timer hook
        ├── pages/
        │   ├── AuthPage.tsx      Login + register
        │   ├── LobbyPage.tsx     Create or join room
        │   └── RoomPage.tsx      Main room orchestrator
        └── components/room/
            ├── RoomHeader.tsx    Status bar + code copy
            ├── WaitingRoom.tsx   Pre-round lobby
            ├── BattleRoom.tsx    Active round + submission
            ├── ScoringRoom.tsx   Post-round judging
            └── SubmissionCard.tsx  Live job status + output + scoring
```

---

## The Core Loop (one complete round)

1. User A registers → creates room → becomes host
2. User B, C register → join via 6-char code
3. Host writes challenge prompt → clicks "Start Battle Round"
4. Broadcast: `round_started` → all browsers show challenge + submit box
5. B and C submit their creative prompts
6. Backend creates Submission + GenerationJob (status: queued)
7. HTTP returns 202 immediately
8. Background `runGenerationJob()` fires: queued → running → completed
9. Each status change broadcasts `job_status_changed` → all browsers update live
10. Host clicks "End Round" → scoring phase
11. Host scores each entry 1–10, crowns a winner
12. All browsers see scores + winner in real-time via `submission_scored`
