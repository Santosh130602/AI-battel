import { create } from 'zustand';
import {
  Room, Round, Submission, Participant,
  RoomEvent, JobStatus,
} from '../types';

interface RoomState {
  room: Room | null;
  currentRound: Round | null;
  submissions: Record<string, Submission>; // keyed by _id
  isHost: boolean;

  // Actions
  setRoomState: (room: Room, round: Round | null, submissions: Submission[], isHost: boolean) => void;
  handleSocketEvent: (event: RoomEvent) => void;
  clearRoom: () => void;

  // Selectors (as simple getters for convenience)
  getSubmissionsList: () => Submission[];
}

export const useRoomStore = create<RoomState>((set, get) => ({
  room: null,
  currentRound: null,
  submissions: {},
  isHost: false,

  setRoomState: (room, round, submissions, isHost) => {
    const submissionsMap: Record<string, Submission> = {};
    submissions.forEach((s) => { submissionsMap[s._id] = s; });
    set({ room, currentRound: round, submissions: submissionsMap, isHost });
  },

  handleSocketEvent: (event: RoomEvent) => {
    const state = get();

    switch (event.event) {
      case 'round_started': {
        set({
          currentRound: event.round,
          room: state.room ? { ...state.room, status: 'round_active' } : null,
          submissions: {}, // clear submissions for new round
        });
        break;
      }

      case 'participant_joined': {
        if (state.room) {
          set({
            room: {
              ...state.room,
              participants: event.participants as Participant[],
            },
          });
        }
        break;
      }

      case 'job_status_changed': {
        const { submissionId, participantName, userPrompt, status, aiOutput, error, participantId } = event;

        set((s) => {
          const existing = s.submissions[submissionId];
          const updated: Submission = existing
            ? {
                ...existing,
                status: status as JobStatus,
                aiOutput: aiOutput ?? existing.aiOutput,
              }
            : {
                _id: submissionId,
                roundId: s.currentRound?._id ?? '',
                roomId: s.room?._id ?? '',
                participantId: participantId ?? '',
                participantName,
                userPrompt,
                status: status as JobStatus,
                aiOutput,
                isEliminated: false,
                isWinner: false,
                score: null,
                createdAt: new Date().toISOString(),
              };

          return {
            submissions: {
              ...s.submissions,
              [submissionId]: updated,
            },
          };
        });
        break;
      }

      case 'round_ended': {
        set((s) => ({
          currentRound: s.currentRound
            ? { ...s.currentRound, status: 'scoring' }
            : null,
          room: s.room ? { ...s.room, status: 'scoring' } : null,
        }));
        break;
      }

      case 'submission_scored': {
        const { submissionId, score, isEliminated, isWinner } = event;
        set((s) => {
          const existing = s.submissions[submissionId];
          if (!existing) return s;
          return {
            submissions: {
              ...s.submissions,
              [submissionId]: {
                ...existing,
                score: score ?? existing.score,
                isEliminated: isEliminated ?? existing.isEliminated,
                isWinner: isWinner ?? existing.isWinner,
              },
            },
          };
        });
        break;
      }
    }
  },

  clearRoom: () => set({ room: null, currentRound: null, submissions: {}, isHost: false }),

  getSubmissionsList: () => Object.values(get().submissions).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  ),
}));
