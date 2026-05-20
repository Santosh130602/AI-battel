import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { Plus, ArrowRight, ShieldAlert } from 'lucide-react';

export default function LobbyPage() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const [joinCode, setJoinCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    setError('');
    setCreating(true);
    try {
      const { data } = await api.post('/rooms');
      navigate(`/room/${data.room._id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Initialization rejected.');
    } finally {
      setCreating(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setError('');
    setJoining(true);
    try {
      const { data } = await api.post('/rooms/join', { code: joinCode.trim().toUpperCase() });
      navigate(`/room/${data.room._id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid passcode array.');
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col justify-between p-6 md:p-12 font-mono relative selection:bg-[var(--color-accent)] selection:text-white transition-colors duration-300">
      
      {/* ── TOP UTILITY ROW ────────────────────────────────────────────────── */}
      <header className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs tracking-wider border-b border-[var(--border-color)] pb-6">
        <div className="flex items-center gap-3">
          <span className="font-black text-sm tracking-tighter bg-[var(--color-accent)] text-white px-2 py-0.5 rounded">B.A.R</span>
          <span className="text-[var(--text-muted)] uppercase">// INTRACONTINENTAL_CORE_NET</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-[var(--text-secondary)]">
            OPR: <span className="underline decoration-[var(--color-accent)] font-bold">{user?.name}</span>
          </span>
          <span className="text-[var(--border-color)]">|</span>
          <button
            onClick={() => { clearAuth(); navigate('/auth'); }}
            className="text-[var(--text-muted)] hover:text-[var(--color-danger)] uppercase font-bold transition-colors"
          >
            [ disconnect ]
          </button>
        </div>
      </header>

      {/* ── ASYMMETRIC EXPERIMENTAL INTRO ──────────────────────────────────── */}
      <main className="w-full max-w-7xl mx-auto my-auto py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <div className="lg:col-span-6 space-y-6">
          <div className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-bold">
            System Phase // Staging Ground
          </div>
          <h1 className="font-display font-black text-4xl md:text-6xl tracking-tighter uppercase leading-none text-[var(--text-primary)]">
            Design <br />
            Is Combat.
          </h1>
          <div className="w-20 h-1 bg-[var(--color-accent)]" />
          <p className="text-[var(--text-secondary)] text-sm max-w-sm leading-relaxed font-sans font-medium">
            This workspace acts as an intercept node. Initialize a secure server host cell or link your interface module directly to an active stream.
          </p>
        </div>

        {/* ── RAW NEOMINIMALIST INTERACTION TERMINAL ─────────────────────────── */}
        <div className="lg:col-span-6 space-y-8 border-l border-[var(--border-color)] lg:pl-12">
          
          {/* Action Stream 01: Create Block */}
          <div className="space-y-3 group">
            <div className="text-xxs uppercase tracking-widest text-[var(--text-muted)] font-black">
              01 // Allocation Engine
            </div>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="w-full border-2 border-[var(--text-primary)] hover:border-[var(--color-accent)] bg-transparent hover:bg-[var(--text-primary)] text-[var(--text-primary)] hover:text-[var(--bg-main)] p-5 text-left font-bold transition-all duration-300 flex items-center justify-between rounded-xl group-hover:translate-x-1"
            >
              <span className="uppercase tracking-wide text-sm">
                {creating ? 'Allocating Core Matrix...' : 'Instantiate Fresh Match Socket'}
              </span>
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            </button>
          </div>

          {/* Action Stream 02: Join Form */}
          <div className="space-y-3">
            <div className="text-xxs uppercase tracking-widest text-[var(--text-muted)] font-black">
              02 // Direct Integration Line
            </div>
            
            <form onSubmit={handleJoin} className="flex border-2 border-[var(--border-color)] focus-within:border-[var(--color-accent-secondary)] rounded-xl overflow-hidden bg-[var(--bg-surface)] p-1.5 transition-colors duration-200">
              <input
                className="w-full bg-transparent border-0 text-base font-bold tracking-widest uppercase px-4 py-2 focus:ring-0 outline-none placeholder:text-[var(--text-muted)]/40 text-[var(--text-primary)]"
                type="text"
                placeholder="TOKEN_HEX_CODE"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                maxLength={6}
              />
              <button
                type="submit"
                disabled={joining || joinCode.length < 4}
                className="bg-[var(--text-primary)] text-[var(--bg-main)] hover:bg-[var(--color-accent-secondary)] hover:text-white px-6 font-bold uppercase text-xs tracking-wider rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {joining ? 'Linking' : 'Link'} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Error Terminal Interface */}
          {error && (
            <div className="border-l-2 border-[var(--color-danger)] bg-[var(--color-danger)]/[0.03] p-4 flex gap-3 text-xs items-start rounded-r-lg">
              <ShieldAlert className="w-4 h-4 text-[var(--color-danger)] flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold uppercase block text-[var(--color-danger)]">Handshake Interrupted</span>
                <span className="text-[var(--text-secondary)] font-sans font-medium">{error}</span>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── FOOTER SYSTEM METRICS ──────────────────────────────────────────── */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xxs tracking-widest uppercase text-[var(--text-muted)] border-t border-[var(--border-color)] pt-6 font-bold">
        <div>STATUS: ALL SYSTEMS STANDARD // READY</div>
        <div className="flex items-center gap-3 font-sans font-semibold text-xs text-[var(--text-secondary)]">
          <span>Brief</span>
          <span className="text-[var(--border-color)]">→</span>
          <span>Sync</span>
          <span className="text-[var(--border-color)]">→</span>
          <span>Generate</span>
          <span className="text-[var(--border-color)]">→</span>
          <span>Commit</span>
        </div>
      </footer>

    </div>
  );
}