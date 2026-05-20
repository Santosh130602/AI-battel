import { useState } from 'react';
import { Submission, JobStatus } from '../../types';
import api from '../../lib/api';
import { Hourglass, Zap, CheckCircle2, XCircle, AlertTriangle, RotateCcw, Trophy, Trash2 } from 'lucide-react';

interface Props {
  submission: Submission;
  isHost: boolean;
  showScoring: boolean;
}

const STATUS_CONFIG: Record<JobStatus, { label: string; icon: React.ReactNode; className: string }> = {
  pending:   { label: 'Pending',      icon: <Hourglass className="w-3.5 h-3.5" />, className: 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-color)]' },
  queued:    { label: 'Queued',       icon: <Hourglass className="w-3.5 h-3.5" />, className: 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-color)]' },
  running:   { label: 'Generating…',  icon: <Zap className="w-3.5 h-3.5 text-blue-400 animate-spin" />, className: 'bg-blue-500/10 text-[var(--color-pending)] border-blue-500/20' },
  completed: { label: 'Done',         icon: <CheckCircle2 className="w-3.5 h-3.5" />, className: 'bg-emerald-500/10 text-[var(--color-success)] border-emerald-500/20' },
  failed:    { label: 'Failed',       icon: <XCircle className="w-3.5 h-3.5" />, className: 'bg-red-500/10 text-[var(--color-danger)] border-red-500/20' },
  timed_out: { label: 'Timed out',    icon: <AlertTriangle className="w-3.5 h-3.5" />, className: 'bg-red-500/10 text-[var(--color-danger)] border-red-500/20' },
};

export default function SubmissionCard({ submission, isHost, showScoring }: Props) {
  const [scoring, setScoring] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const config = STATUS_CONFIG[submission.status] ?? STATUS_CONFIG.pending;

  async function handleScore(score: number) {
    setScoring(true);
    try {
      await api.post(`/rounds/submissions/${submission._id}/score`, { score });
    } catch (err) {
      console.error('Score error:', err);
    } finally {
      setScoring(false);
    }
  }

  async function handleEliminate() {
    setScoring(true);
    try {
      await api.post(`/rounds/submissions/${submission._id}/score`, {
        isEliminated: !submission.isEliminated,
      });
    } catch (err) {
      console.error('Eliminate error:', err);
    } finally {
      setScoring(false);
    }
  }

  async function handleSetWinner() {
    setScoring(true);
    try {
      await api.post(`/rounds/submissions/${submission._id}/score`, {
        isWinner: !submission.isWinner,
      });
    } catch (err) {
      console.error('Winner error:', err);
    } finally {
      setScoring(false);
    }
  }

  async function handleRetry() {
    setRetrying(true);
    try {
      await api.post(`/rounds/submissions/${submission._id}/retry`);
    } catch (err) {
      console.error('Retry error:', err);
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div
      className={`card relative overflow-hidden transition-all duration-300 border ${
        submission.isWinner
          ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/[0.02] to-transparent shadow-md'
          : submission.isEliminated
          ? 'border-[var(--color-danger)]/20 bg-[var(--bg-main)]/40 opacity-40 mix-blend-luminosity'
          : 'border-[var(--border-color)] hover:border-[var(--border-accent)]/30'
      }`}
    >
      {submission.isWinner && <div className="absolute top-0 inset-x-0 h-[2px] bg-amber-500" />}
      {submission.isEliminated && <div className="absolute top-0 inset-x-0 h-[2px] bg-[var(--color-danger)]/50" />}

      {/* Header Container */}
      <div className="flex items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="font-display font-black text-base tracking-tight text-[var(--text-primary)]">
            {submission.participantName}
          </span>
          {submission.isWinner && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xxs font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Trophy className="w-3 h-3" /> Winner
            </span>
          )}
          {submission.isEliminated && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xxs font-mono font-bold uppercase tracking-wider bg-red-500/10 text-[var(--color-danger)] border border-red-500/20">
              <XCircle className="w-3 h-3" /> Eliminated
            </span>
          )}
        </div>
        
        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold tracking-wide border flex items-center gap-1.5 shadow-sm ${config.className}`}>
          {config.icon} {config.label}
        </span>
      </div>

      {/* User Input Prompt Block */}
      <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-3 mb-4 shadow-inner">
        <p className="text-[var(--text-muted)] text-xxs font-mono font-bold uppercase tracking-widest mb-1">
          Submission Prompt Array
        </p>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed italic">
          "{submission.userPrompt}"
        </p>
      </div>

      {/* Interactive Rendering Active Shimmer */}
      {submission.status === 'running' && (
        <div className="h-1 bg-[var(--bg-main)] rounded-full overflow-hidden mb-4 border border-[var(--border-color)]">
          <div className="h-full bg-[var(--color-pending)] rounded-full w-2/3 animate-pulse transition-all duration-700" />
        </div>
      )}

      {/* High-Fidelity AI Text Canvas Output */}
      {submission.status === 'completed' && submission.aiOutput && (
        <div className="bg-[var(--bg-surface-hover)] border border-[var(--border-color)] rounded-xl p-4 mb-4 relative shadow-sm">
          <p className="text-[var(--text-muted)] text-xxs font-mono font-bold uppercase tracking-widest mb-2.5 block border-b border-[var(--border-color)] pb-1.5">
            🤖 AI Realization Interface
          </p>
          <p className="text-[var(--text-primary)] text-sm leading-relaxed whitespace-pre-wrap font-sans font-medium">
            {submission.aiOutput}
          </p>
        </div>
      )}

      {/* System Failures / Execution Retries */}
      {(submission.status === 'failed' || submission.status === 'timed_out') && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-[var(--color-danger)] text-sm font-bold">Execution Error Cluster</p>
            <p className="text-[var(--text-muted)] text-xs mt-0.5">The pipeline failed to map your layout constraints.</p>
          </div>
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border border-[var(--color-danger)]/30 text-[var(--color-danger)] bg-red-500/5 hover:bg-red-500/10 transition active:scale-95 self-start sm:self-center"
          >
            <RotateCcw className="w-3 h-3" /> Force Retry
          </button>
        </div>
      )}

      {/* Score Telemetry Display */}
      {submission.score !== null && submission.score !== undefined && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-[var(--text-muted)] text-xs font-mono uppercase tracking-wider font-semibold">Evaluation Weight:</span>
          <span className="font-display font-black text-[var(--color-accent)] text-lg">
            {submission.score} <span className="text-xs text-[var(--text-muted)] font-mono font-normal">/ 10</span>
          </span>
        </div>
      )}

      {/* Host Scoring Controls Suite */}
      {showScoring && isHost && submission.status === 'completed' && (
        <div className="border-t border-[var(--border-color)] pt-4 mt-3 space-y-4 relative z-10">
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <label className="text-[var(--text-muted)] text-xxs font-mono font-bold uppercase tracking-widest">
                Assign System Value
              </label>
              {submission.score && (
                <span className="text-xxs font-mono text-[var(--color-success)] bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 font-bold">
                  Committed
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => handleScore(n)}
                  disabled={scoring}
                  className={`py-2 rounded-lg text-xs font-mono font-black transition-all duration-150 transform active:scale-90 ${
                    submission.score === n
                      ? 'bg-[var(--color-accent)] text-white shadow-md shadow-[var(--color-accent)]/20 border border-[var(--color-accent)]'
                      : 'bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--color-accent)]/40 hover:text-[var(--text-primary)]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleEliminate}
              disabled={scoring}
              className="inline-flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase border transition-all duration-200 transform active:scale-[0.98] bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-red-500/40 hover:text-red-500"
            >
              <Trash2 className="w-3.5 h-3.5" /> {submission.isEliminated ? 'Restore Node' : 'Prune Array'}
            </button>
            
            <button
              onClick={handleSetWinner}
              disabled={scoring}
              className="inline-flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase border transition-all duration-200 transform active:scale-[0.98] bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-amber-500/40 hover:text-amber-500"
            >
              <Trophy className="w-3.5 h-3.5" /> {submission.isWinner ? 'Revoke Crown' : 'Appoint Champ'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
