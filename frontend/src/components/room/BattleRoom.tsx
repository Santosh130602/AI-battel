import { useState } from 'react';
import { Room, Round } from '../../types';
import { useRoomStore } from '../../store/roomStore';
import { useAuthStore } from '../../store/authStore';
import { useCountdown } from '../../hooks/useCountdown';
import api from '../../lib/api';
import SubmissionCard from './SubmissionCard';
import { Swords, Clock, CheckCircle2, Cpu, Crown, Terminal, Radio } from 'lucide-react';

interface Props {
  room: Room;
  round: Round;
  isHost: boolean;
}

export default function BattleRoom({ room, round, isHost }: Props) {
  const { user } = useAuthStore();
  const { getSubmissionsList } = useRoomStore();

  const [myPrompt, setMyPrompt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [endingRound, setEndingRound] = useState(false);

  const { formatted, isExpired, pct } = useCountdown(round.startedAt, round.timeLimitSeconds);
  const submissions = getSubmissionsList();

  const mySubmission = submissions.find((s) => s.participantId === user?._id);
  const hasSubmitted = !!mySubmission || submitted;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!myPrompt.trim() || submitting) return;
    setSubmitError('');
    setSubmitting(true);

    try {
      await api.post(`/rounds/${round._id}/submit`, { userPrompt: myPrompt.trim() });
      setSubmitted(true);
      setMyPrompt('');
    } catch (err: any) {
      setSubmitError(err.response?.data?.error || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEndRound() {
    setEndingRound(true);
    try {
      await api.post(`/rounds/${round._id}/end`);
    } catch (err: any) {
      console.error('End round error:', err);
    } finally {
      setEndingRound(false);
    }
  }

  // Dynamic status colors driven by theme styles
  const timerColor =
    pct > 50 ? 'bg-[var(--color-success)]' :
    pct > 20 ? 'bg-yellow-500' :
    'bg-[var(--color-danger)]';

  const countdownTextColor = isExpired 
    ? 'text-[var(--color-danger)]' 
    : pct < 20 
      ? 'text-[var(--color-danger)] animate-pulse' 
      : 'text-[var(--text-primary)]';

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-2">
      
      {/* Challenge Hero Banner */}
      <div className="card relative overflow-hidden backdrop-blur-sm border-2 border-[var(--border-color)] group">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-70" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono tracking-widest uppercase bg-[var(--bg-main)] text-[var(--color-accent)] border border-[var(--border-color)] font-semibold shadow-sm">
                <Swords className="w-3.5 h-3.5" /> Current Challenge
              </span>
            </div>
            <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight text-[var(--text-primary)] leading-tight drop-shadow-sm">
              {round.challengePrompt}
            </h1>
          </div>

          {/* Precision Timer Block */}
          <div className="flex items-center gap-4 bg-[var(--bg-main)] px-5 py-3 rounded-xl border border-[var(--border-color)] self-start md:self-center shadow-inner">
            <div className="text-right flex items-center gap-3">
              <Clock className={`w-5 h-5 ${countdownTextColor}`} />
              <div>
                <div className={`font-mono text-3xl font-extrabold tracking-tighter tabular-nums ${countdownTextColor}`}>
                  {isExpired ? 'TIME UP' : formatted}
                </div>
                <div className="text-[var(--text-muted)] text-xs font-mono uppercase tracking-wider font-medium">
                  {submissions.length} Counter {submissions.length !== 1 ? 'Entries' : 'Entry'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Micro-Progress Track */}
        <div className="mt-6 h-2 bg-[var(--bg-main)] rounded-full overflow-hidden p-[2px] border border-[var(--border-color)]">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${timerColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Main Workspace split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Interaction Panel (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          {!isHost ? (
            hasSubmitted ? (
              /* Success / Lock-in Screen */
              <div className="card text-center py-12 border-2 border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 text-9xl text-emerald-500/10 font-bold select-none pointer-events-none">✓</div>
                <div className="w-16 h-16 bg-emerald-500/10 text-[var(--color-success)] rounded-full flex items-center justify-center mx-auto text-3xl mb-4 shadow-sm border border-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-display font-black text-[var(--text-primary)] text-xl tracking-tight mb-1">Entry Locked In</h3>
                <p className="text-[var(--text-secondary)] text-sm px-4 max-w-sm mx-auto">
                  Your prompt has been broadcasted. Keep an eye on the feed as the AI processes your canvas.
                </p>
              </div>
            ) : (
              /* Submission Form */
              <div className="card relative">
                <div className="mb-5">
                  <h3 className="font-display font-black text-xl text-[var(--text-primary)] tracking-tight">Your Generation Core</h3>
                  <p className="text-[var(--text-secondary)] text-sm mt-1">
                    Deconstruct the challenge prompt above. Craft something bold, architectural, or completely wild.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label uppercase tracking-wider text-xs font-bold text-[var(--text-muted)]">Creative Prompt Directive</label>
                    <textarea
                      className="input resize-none h-40 font-sans leading-relaxed focus:ring-2 focus:ring-[var(--color-accent)]/20"
                      placeholder="Input visual weights, styling textures, colors, settings..."
                      value={myPrompt}
                      onChange={(e) => setMyPrompt(e.target.value)}
                      disabled={submitting || isExpired}
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center mt-1.5 px-1">
                      <div>
                        {submitError && (
                          <span className="text-[var(--color-danger)] text-xs font-medium">
                            {submitError}
                          </span>
                        )}
                      </div>
                      <span className="text-[var(--text-muted)] text-xs font-mono tracking-tight bg-[var(--bg-main)] px-2 py-0.5 rounded border border-[var(--border-color)]">
                        {myPrompt.length}/500
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !myPrompt.trim() || isExpired}
                    className="btn-primary w-full py-3.5 shadow-lg shadow-[var(--color-accent)]/10 hover:shadow-[var(--color-accent)]/20 hover:scale-[1.01] active:scale-[0.99] transform transition"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Transmitting...
                      </span>
                    ) : isExpired ? (
                      'Time Matrix Expired'
                    ) : (
                      'Submit Engine to AI'
                    )}
                  </button>
                </form>
              </div>
            )
          ) : (
            /* Host Master Suite */
            <div className="card border-2 border-[var(--color-accent)]/20 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-[var(--color-accent)]/5 to-transparent rounded-bl-full pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center text-[var(--color-accent)]">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[var(--color-accent)] text-xs font-mono uppercase tracking-widest font-bold">Host Master Console</div>
                  <h3 className="font-display font-black text-lg text-[var(--text-primary)] tracking-tight">Judicial Oversight</h3>
                </div>
              </div>
              
              <p className="text-[var(--text-secondary)] text-sm mb-5 leading-relaxed">
                Review operational status values below. You possess the system credentials to enforce cutoff limits and init phase scoring.
              </p>
              
              <div className="space-y-2.5 mb-6">
                <div className="flex justify-between items-center bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-3 shadow-inner">
                  <span className="text-sm font-medium text-[var(--text-secondary)]">Total Active Pool</span>
                  <span className="font-mono font-bold text-base text-[var(--text-primary)] bg-[var(--bg-surface)] px-2.5 py-0.5 rounded-lg border border-[var(--border-color)]">{submissions.length}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-3 text-center">
                    <span className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">Ready</span>
                    <span className="font-mono text-xl font-bold text-[var(--color-success)]">
                      {submissions.filter((s) => s.status === 'completed').length}
                    </span>
                  </div>
                  <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-3 text-center">
                    <span className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">In Engine</span>
                    <span className="font-mono text-xl font-bold text-[var(--color-pending)]">
                      {submissions.filter((s) => ['queued', 'running'].includes(s.status)).length}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleEndRound}
                disabled={endingRound}
                className="btn-danger w-full py-3.5 shadow-lg shadow-[var(--color-danger)]/10 hover:scale-[1.01] active:scale-[0.99] transform transition font-bold text-sm tracking-wide uppercase"
              >
                {endingRound ? 'Terminating Loop...' : 'End Round & Compute Scores'}
              </button>
            </div>
          )}
        </div>

        {/* Live Broadcast Feed (Right Column) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] shadow-sm shadow-[var(--color-accent)] animate-pulse" />
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-[var(--text-secondary)]">
                Live Broadcast Feed
              </h3>
            </div>
            
            {submissions.some((s) => ['queued', 'running'].includes(s.status)) && (
              <div className="flex items-center gap-1.5 bg-blue-500/5 text-[var(--color-pending)] px-2.5 py-1 rounded-md text-xs font-mono font-bold border border-blue-500/10">
                <Cpu className="w-3 h-3 animate-spin" />
                AI Pipeline Processing...
              </div>
            )}
          </div>

          {submissions.length === 0 ? (
            /* Elegant Empty State Container */
            <div className="card border-dashed border-2 border-[var(--border-color)] bg-[var(--bg-main)]/50 text-center py-20 flex flex-col justify-center items-center">
              <div className="w-12 h-12 bg-[var(--bg-surface)] rounded-2xl flex items-center justify-center border border-[var(--border-color)] text-[var(--text-muted)] shadow-sm mb-4">
                <Terminal className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-[var(--text-primary)] text-base">Awaiting Transmissions</h4>
              <p className="text-[var(--text-muted)] text-xs mt-1 max-w-xs">
                The network pipe is clear. Waiting for participants to ship their creative arrays.
              </p>
            </div>
          ) : (
            /* Submissions Stream */
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
              {submissions.map((submission) => (
                <div key={submission._id} className="transition-all duration-300 hover:translate-x-1">
                  <SubmissionCard
                    submission={submission}
                    isHost={isHost}
                    showScoring={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}