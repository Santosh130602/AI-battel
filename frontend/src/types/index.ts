export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Participant {
  userId: string;
  name: string;
  joinedAt: string;
}

export type RoomStatus = 'waiting' | 'round_active' | 'scoring' | 'finished';

export interface Room {
  _id: string;
  code: string;
  hostId: string;
  status: RoomStatus;
  participants: Participant[];
  createdAt: string;
}

export type RoundStatus = 'active' | 'scoring' | 'completed';

export interface Round {
  _id: string;
  roomId: string;
  challengePrompt: string;
  status: RoundStatus;
  timeLimitSeconds: number;
  startedAt: string;
  endedAt?: string;
}

export type JobStatus = 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'timed_out';

export interface Submission {
  _id: string;
  roundId: string;
  roomId: string;
  participantId: string;
  participantName: string;
  userPrompt: string;
  aiOutput?: string;
  status: JobStatus;
  score?: number | null;
  isEliminated: boolean;
  isWinner: boolean;
  createdAt: string;
}

// ── WebSocket event payloads ──────────────────────────────────

export interface RoundStartedEvent {
  event: 'round_started';
  round: Round;
}

export interface ParticipantJoinedEvent {
  event: 'participant_joined';
  userId: string;
  name: string;
  participants: Participant[];
}

export interface JobStatusChangedEvent {
  event: 'job_status_changed';
  submissionId: string;
  jobId: string;
  participantId?: string;
  participantName: string;
  userPrompt: string;
  status: JobStatus;
  aiOutput?: string;
  error?: string;
}

export interface RoundEndedEvent {
  event: 'round_ended';
  roundId: string;
}

export interface SubmissionScoredEvent {
  event: 'submission_scored';
  submissionId: string;
  score?: number | null;
  isEliminated?: boolean;
  isWinner?: boolean;
}

export type RoomEvent =
  | RoundStartedEvent
  | ParticipantJoinedEvent
  | JobStatusChangedEvent
  | RoundEndedEvent
  | SubmissionScoredEvent;

// ── API response types ────────────────────────────────────────

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RoomStateResponse {
  room: Room;
  currentRound: Round | null;
  submissions: Submission[];
  isHost: boolean;
}
