import { useState } from 'react';
import { Room } from '../../types';
import api from '../../lib/api';
import { Hourglass, Crown, User, HelpCircle, Sparkles, Clock, Play } from 'lucide-react';

interface Props {
  room: Room;
  isHost: boolean;
}

const EXAMPLE_PROMPTS = [
  "Make the most insane luxury cyberpunk perfume campaign",
  "Create a surrealist fast-food brand that only exists at 3am",
  "Design a luxury car for interdimensional travel",
  "Pitch a haute couture line inspired by industrial decay",
  "Invent a wellness product for people who hate wellness",
];

export default function WaitingRoom({ room, isHost }: Props) {
  const [challengePrompt, setChallengePrompt] = useState('');
  const [timeLimit, setTimeLimit] = useState(120);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleStartRound() {
    if (!challengePrompt.trim()) return;
    setError('');
    setLoading(true);
    try {
      await api.post('/rounds/start', {
        roomId: room._id,
        challengePrompt: challengePrompt.trim(),
        timeLimitSeconds: timeLimit,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start round');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      
      {/* ⏳ Phase Hero State */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <div className="w-16 h-16 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl flex items-center justify-center mx-auto text-[var(--color-accent)] shadow-sm">
          <Hourglass className="w-8 h-8 animate-[spin_4s_linear_infinite]" />
        </div>
        <h2 className="font-display font-black text-2xl tracking-tight text-[var(--text-primary)]">
          {isHost ? 'Configure Arena parameters' : 'Staging Matrix Active'}
        </h2>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
          {isHost
            ? "Deploy a creative brief directives array. The engine will distribute the weights to all connected participant arrays."
            : "The system host is generating custom visual prompt criteria. Prepare your synthesis terminal..."}
        </p>
      </div>

      {/* 👥 Connected Clients / Players Grid */}
      <div className="card relative overflow-hidden border border-[var(--border-color)]">
        <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3 mb-4">
          <User className="w-4 h-4 text-[var(--text-secondary)]" />
          <h3 className="font-display font-black text-xs uppercase tracking-widest text-[var(--text-secondary)]">
            Active Participant Pool ({room.participants.length})
          </h3>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          {room.participants.map((p) => {
            const isPlayerHost = p.userId === room.hostId;
            return (
              <div
                key={p.userId}
                className={`flex items-center gap-2 bg-[var(--bg-main)] border rounded-xl px-4 py-2 transition-all shadow-inner ${
                  isPlayerHost 
                    ? 'border-[var(--color-accent)]/30 text-[var(--color-accent)]' 
                    : 'border-[var(--border-color)] text-[var(--text-primary)]'
                }`}
              >
                {isPlayerHost ? (
                  <Crown className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                ) : (
                  <User className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                )}
                <span className="font-mono text-xs font-bold">{p.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 👑 Host Module: Configuration Terminal */}
      {isHost && (
        <div className="card relative border border-[var(--border-color)]">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-60" />

          <div className="mb-5 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center text-[var(--color-accent)] flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-[var(--text-primary)] tracking-tight">Challenge Brief Directive</h3>
              <p className="text-[var(--text-secondary)] text-xs mt-0.5">
                This environment state variable maps target assets across all concurrent user sessions.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Input Element */}
            <div>
              <label className="label uppercase tracking-wider text-xs font-bold text-[var(--text-muted)]">Input Core Formula</label>
              <textarea
                className="input resize-none h-28 focus:ring-2 focus:ring-[var(--color-accent)]/10 text-sm leading-relaxed"
                placeholder="Ex: Architect an ultra-luxury kinetic artifact constructed from polished chrome..."
                value={challengePrompt}
                onChange={(e) => setChallengePrompt(e.target.value)}
                maxLength={300}
              />
              <div className="text-right text-[var(--text-muted)] text-xs mt-1.5 font-mono bg-[var(--bg-main)] px-2 py-0.5 rounded border border-[var(--border-color)] inline-float float-right">
                {challengePrompt.length}/300
              </div>
              <div className="clear-both" />
            </div>

            {/* Quick Templates Sub-module */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <HelpCircle className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="text-[var(--text-muted)] text-xxs font-mono font-bold uppercase tracking-widest">
                  Preset Reference Arrays
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {EXAMPLE_PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setChallengePrompt(p)}
                    className="text-left text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-main)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-color)] hover:border-[var(--color-accent)]/30 rounded-xl p-3 transition-all duration-200 line-clamp-2 font-medium"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Clock Execution Limits */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <label className="text-[var(--text-muted)] text-xxs font-mono font-bold uppercase tracking-widest">
                  Temporal Allocation Window
                </label>
              </div>
              
              <div className="flex gap-2">
                {[60, 90, 120, 180, 300].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeLimit(t)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-mono font-black border transition-all duration-150 transform active:scale-95 ${
                      timeLimit === t
                        ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-md shadow-[var(--color-accent)]/10'
                        : 'bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]'
                    }`}
                  >
                    {t >= 60 ? `${t / 60}m` : `${t}s`}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-[var(--color-danger)] text-sm bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3 font-medium">
                {error}
              </div>
            )}

            <button
              onClick={handleStartRound}
              disabled={loading || !challengePrompt.trim()}
              className="btn-primary w-full py-4 shadow-lg shadow-[var(--color-accent)]/10 hover:shadow-[var(--color-accent)]/20 hover:scale-[1.01] active:scale-[0.99] transform transition text-sm tracking-wide font-black uppercase inline-flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              {loading ? 'Booting Canvas Environment...' : 'Initialize Battle Protocol'}
            </button>
          </div>
        </div>
      )}

      {/* 🎯 Participant Block: Terminal Waiting Sandbox */}
      {!isHost && (
        <div className="card border-dashed border-2 border-[var(--border-color)] bg-[var(--bg-main)]/50 text-center py-16 flex flex-col justify-center items-center">
          <div className="w-12 h-12 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl flex items-center justify-center mb-4 text-[var(--color-pending)] animate-pulse shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="font-display font-bold text-[var(--text-primary)] text-base">Awaiting Server Dispatch</h4>
          <p className="text-[var(--text-muted)] text-xs mt-1 max-w-xs leading-relaxed">
            The processing pipes are synchronized. Stand by for the incoming challenge structural layout payload.
          </p>
          
          <div className="mt-6 border-t border-[var(--border-color)] pt-4 w-full max-w-xs">
            <span className="text-[var(--text-muted)] text-xxs font-mono uppercase tracking-widest block">
              Node Access Keys
            </span>
            <div className="inline-flex items-center gap-2 mt-1.5 font-mono text-sm font-black text-[var(--text-primary)] bg-[var(--bg-surface)] px-3 py-1 rounded-lg border border-[var(--border-color)] shadow-inner tracking-widest">
              {room.code}
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}