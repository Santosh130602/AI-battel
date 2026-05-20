import { Room, Round } from '../../types';
import { useRoomStore } from '../../store/roomStore';
import SubmissionCard from './SubmissionCard';

interface Props {
  room: Room;
  round: Round;
  isHost: boolean;
}

export default function ScoringRoom({ room, round, isHost }: Props) {
  const { getSubmissionsList } = useRoomStore();
  const submissions = getSubmissionsList();

  const completed = submissions.filter((s) => s.status === 'completed' && !s.isEliminated);
  const eliminated = submissions.filter((s) => s.isEliminated);
  const failed = submissions.filter((s) => ['failed', 'timed_out'].includes(s.status));
  const pending = submissions.filter((s) => ['queued', 'running'].includes(s.status));

  const winner = submissions.find((s) => s.isWinner);

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-2">
      
      {/* 🏁 Phase Banner Container */}
      <div className="card relative overflow-hidden text-center border-2 border-[var(--border-color)]">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[var(--color-pending)] to-transparent opacity-70" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-[var(--bg-main)] text-[var(--color-pending)] border border-[var(--border-color)] mb-3 shadow-sm">
          <span>🏁</span> Scoring Phase Active
        </div>
        
        <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight text-[var(--text-primary)] leading-tight max-w-3xl mx-auto">
          {round.challengePrompt}
        </h1>
        
        {isHost && (
          <p className="text-[var(--text-secondary)] text-sm mt-3 max-w-md mx-auto leading-relaxed border-t border-[var(--border-color)] pt-3">
            Review live arrays: evaluate 1–10, prune lower weights, and establish the ultimate winner node.
          </p>
        )}
      </div>

      {/* 🏆 Golden Winner Podium */}
      {winner && (
        <div className="card border-2 border-amber-500/30 bg-gradient-to-b from-amber-500/[0.03] to-transparent relative overflow-hidden shadow-lg shadow-amber-500/[0.02]">
          <div className="absolute -right-12 -top-12 text-[10rem] text-amber-500/[0.04] font-black select-none pointer-events-none">★</div>
          
          <div className="flex flex-col items-center justify-center text-center mb-6 border-b border-[var(--border-color)] pb-4">
            <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center text-3xl mb-2 shadow-sm border border-amber-500/20 animate-bounce">
              <span>🏆</span>
            </div>
            <h3 className="font-display font-black text-amber-600 dark:text-amber-400 text-xl tracking-tight uppercase tracking-wider">
              Dominant Champion
            </h3>
            <p className="text-[var(--text-muted)] text-xs font-mono uppercase mt-0.5">Highest Cumulative Score Matrix</p>
          </div>

          <SubmissionCard submission={winner} isHost={isHost} showScoring={isHost} />
        </div>
      )}

      {/* Grid Layout to structure sections seamlessly */}
      <div className="space-y-6">

        {/* ⏳ In Pipeline / Generating */}
        {pending.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-pending)] animate-ping" />
              <h3 className="font-display font-black text-xs uppercase tracking-widest text-[var(--text-secondary)]">
                Processing in Engine ({pending.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pending.map((s) => (
                <SubmissionCard key={s._id} submission={s} isHost={isHost} showScoring={false} />
              ))}
            </div>
          </div>
        )}

        {/* 🎯 Completed Entries Stack */}
        {completed.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-success)] shadow-sm shadow-[var(--color-success)]" />
                <h3 className="font-display font-black text-xs uppercase tracking-widest text-[var(--text-secondary)]">
                  Active Submissions Pool ({completed.length})
                </h3>
              </div>
              <span className="text-[var(--text-muted)] text-xxs font-mono uppercase tracking-wider bg-[var(--bg-surface)] px-2 py-0.5 rounded border border-[var(--border-color)] shadow-sm">
                Sorted by Rank
              </span>
            </div>
            
            <div className="space-y-4">
              {completed
                .sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
                .map((s) => (
                  <div key={s._id} className="transition-all duration-200 hover:translate-x-1">
                    <SubmissionCard submission={s} isHost={isHost} showScoring={isHost} />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ❌ Eliminated / Pruned View */}
        {eliminated.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-danger)] opacity-50" />
              <h3 className="font-display font-black text-xs uppercase tracking-widest text-[var(--color-danger)] opacity-70">
                Pruned / Eliminated ({eliminated.length})
              </h3>
            </div>
            <div className="space-y-3 opacity-40 hover:opacity-60 transition-opacity duration-300">
              {eliminated.map((s) => (
                <SubmissionCard key={s._id} submission={s} isHost={isHost} showScoring={isHost} />
              ))}
            </div>
          </div>
        )}

        {/* ⚠️ System Pipeline Failures */}
        {failed.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
              <span className="text-sm">⚠️</span>
              <h3 className="font-display font-black text-xs uppercase tracking-widest text-[var(--color-danger)]">
                Generation Timeouts / Faults ({failed.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {failed.map((s) => (
                <SubmissionCard key={s._id} submission={s} isHost={isHost} showScoring={false} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {submissions.length === 0 && (
          <div className="card border-dashed border-2 border-[var(--border-color)] bg-[var(--bg-main)]/40 text-center py-20 flex flex-col justify-center items-center">
            <div className="w-12 h-12 bg-[var(--bg-surface)] rounded-2xl flex items-center justify-center border border-[var(--border-color)] text-xl mb-4 shadow-sm text-[var(--text-muted)]">
              <span>📭</span>
            </div>
            <h4 className="font-display font-bold text-[var(--text-primary)] text-base">Empty Database Block</h4>
            <p className="text-[var(--text-muted)] text-xs mt-1 max-w-xs">
              Zero telemetry streams received. No active entries were committed during this configuration loop.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}