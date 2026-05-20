import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Room } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { Swords, Crown, User, Copy, Check, Users, Activity } from 'lucide-react';

interface Props {
  room: Room;
  isHost: boolean;
}

const STATUS_LABELS: Record<string, { label: string; dotClass: string; textClass: string }> = {
  waiting:      { label: 'STAGING_LOOP',   dotClass: 'bg-yellow-500 shadow-sm shadow-yellow-500/50', textClass: 'text-yellow-600 dark:text-yellow-400' },
  round_active: { label: 'SYNTHESIS_RUN',  dotClass: 'bg-[var(--color-success)] shadow-sm shadow-emerald-500/50 animate-ping', textClass: 'text-[var(--color-success)]' },
  scoring:      { label: 'JUDICIAL_EVAL', dotClass: 'bg-[var(--color-pending)] shadow-sm shadow-blue-500/50', textClass: 'text-[var(--color-pending)]' },
  finished:     { label: 'NODE_OFFLINE',   dotClass: 'bg-[var(--text-muted)] shadow-none', textClass: 'text-[var(--text-muted)]' },
};

export default function RoomHeader({ room, isHost }: Props) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const statusInfo = STATUS_LABELS[room.status] ?? { label: room.status, dotClass: 'bg-[var(--text-primary)]', textClass: 'text-[var(--text-primary)]' };

  function copyCode() {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-surface)] border-b border-[var(--border-color)] font-mono transition-all duration-300 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between relative">
        
        {/* ── LEFT ASPECT: INTERCEPT NODE & COMPONENT IDENTIFIERS ────── */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/lobby')}
            className="flex items-center gap-3 group transition-transform focus:outline-none"
            aria-label="Return to operational hub"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-main)] border-2 border-[var(--text-primary)] flex items-center justify-center transition-all group-hover:border-[var(--color-accent)] group-hover:bg-[var(--bg-surface-hover)] group-hover:translate-y-[-1px]">
              <Swords className="w-4 h-4 text-[var(--text-primary)] group-hover:text-[var(--color-accent)] transition-transform duration-300 group-hover:rotate-12" />
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-black tracking-[0.2em] text-[var(--text-primary)] block leading-none">
                B.A.R_SYS
              </span>
              {/* <span className="text-[var(--text-muted)] text-[9px] font-bold tracking-widest uppercase block mt-1">
                v1.0.0 // matrix
              </span> */}
            </div>
          </button>
          
          <div className="hidden xs:block h-6 w-[2px] bg-[var(--border-color)]" />
          
          {/* Identity Matrix Badge */}
          <div className={`hidden xs:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xxs font-black tracking-widest border-2 bg-[var(--bg-main)] ${
            isHost 
              ? 'border-[var(--color-accent)] text-[var(--color-accent)]' 
              : 'border-[var(--border-color)] text-[var(--text-secondary)]'
          }`}>
            {isHost ? <Crown className="w-3 h-3 stroke-[2.5]" /> : <User className="w-3 h-3 stroke-[2.5]" />}
            <span>{isHost ? 'HOST_CORE' : 'CLIENT_OPR'}</span>
          </div>
        </div>

        {/* ── CENTER ASPECT: ASYMMETRICAL CRYPTO TOKEN KEY ─────────────── */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <button
            onClick={copyCode}
            className="flex items-center gap-3 bg-[var(--bg-main)] border-2 border-[var(--text-primary)] hover:border-[var(--color-accent)] rounded-2xl px-5 py-2 transition-all group shadow-sm hover:translate-y-[-1px] focus:outline-none"
            title="Copy operational runtime passkey string"
          >
            <span className="text-[var(--text-muted)] text-[10px] font-black tracking-[0.2em] uppercase select-none hidden sm:inline">
              SECURE_ID:
            </span>
            <span className="font-sans font-black text-[var(--text-primary)] tracking-[0.15em] text-base group-hover:text-[var(--color-accent)] transition-colors">
              {room.code}
            </span>
            <div className="w-5 h-5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center transition-all group-hover:border-[var(--color-accent)]/40">
              {copied ? (
                <Check className="w-3 h-3 text-[var(--color-success)] stroke-[3]" />
              ) : (
                <Copy className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[var(--text-primary)]" />
              )}
            </div>
          </button>
        </div>

        {/* ── RIGHT ASPECT: TELEMETRY DISPATCH SIGNALS ─────────────────── */}
        <div className="flex items-center gap-6">
          
          {/* Operational Loop Tracker Capsule */}
          <div className="inline-flex items-center gap-3 bg-[var(--bg-main)] border-2 border-[var(--border-color)] rounded-xl px-4 py-1.5 shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${statusInfo.dotClass}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${statusInfo.dotClass}`} />
            </span>
            <span className={`text-[10px] font-black tracking-[0.15em] uppercase ${statusInfo.textClass}`}>
              {statusInfo.label}
            </span>
          </div>

          <div className="hidden lg:block h-6 w-[2px] bg-[var(--border-color)]" />

          {/* Connected Matrix Count */}
          <div className="hidden lg:inline-flex items-center gap-3 text-right">
            <div>
              <span className="text-[var(--text-primary)] font-black text-xs block leading-none">
                POOL_MATRIX
              </span>
              <span className="text-[var(--text-muted)] text-[9px] font-bold tracking-widest block mt-1">
                NODES_SYNCED: {room.participants.length}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] shadow-sm">
              <Users className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          
        </div>

      </div>
    </header>
  );
}