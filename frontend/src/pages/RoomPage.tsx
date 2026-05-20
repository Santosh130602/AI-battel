import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoomStore } from '../store/roomStore';
import { useAuthStore } from '../store/authStore';
import { useWebSocket } from '../hooks/useWebSocket';
import api from '../lib/api';
import WaitingRoom from '../components/room/WaitingRoom';
import BattleRoom from '../components/room/BattleRoom';
import ScoringRoom from '../components/room/ScoringRoom';
import RoomHeader from '../components/room/RoomHeader';
import { Loader2, ShieldAlert, Trophy, ArrowLeft } from 'lucide-react';

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { room, currentRound, setRoomState, clearRoom } = useRoomStore();
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState('');

  useWebSocket(roomId ?? null);

  useEffect(() => {
    if (!roomId) return;

    setLoading(true);
    api
      .get(`/rooms/${roomId}`)
      .then(({ data }) => {
        setRoomState(data.room, data.currentRound, data.submissions, data.isHost);
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          setFatalError("You're not authorized to monitor this room connection.");
        } else if (err.response?.status === 404) {
          setFatalError('Target room infrastructure not found.');
        } else {
          setFatalError('System pipeline fault loading room variables.');
        }
      })
      .finally(() => setLoading(false));

    return () => clearRoom();
  }, [roomId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center transition-colors duration-300">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)] mx-auto" />
          <p className="text-[var(--text-secondary)] font-mono text-xs uppercase tracking-widest font-bold">
            Synchronizing Arena Environment...
          </p>
        </div>
      </div>
    );
  }

  if (fatalError) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4 transition-colors duration-300">
        <div className="card max-w-sm w-full text-center p-8 border border-[var(--border-color)] space-y-5">
          <div className="w-12 h-12 bg-red-500/5 text-[var(--color-danger)] rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-display font-black text-xl text-[var(--text-primary)] tracking-tight">
              Access Interrupted
            </h2>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{fatalError}</p>
          </div>
          <button 
            onClick={() => navigate('/lobby')} 
            className="btn-primary w-full py-3 text-xs uppercase tracking-wider font-mono font-black inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  if (!room) return null;

  const isHost = room.hostId === user?._id;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col transition-colors duration-300">
      {/* Structural Global Header Layer */}
      <RoomHeader room={room} isHost={isHost} />

      {/* Primary Context Mainframe */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        
        {/* Waiting — state switch component mapping */}
        {room.status === 'waiting' && (
          <WaitingRoom room={room} isHost={isHost} />
        )}

        {/* Round active — dynamic battle synthesis phase */}
        {room.status === 'round_active' && currentRound && (
          <BattleRoom
            room={room}
            round={currentRound}
            isHost={isHost}
          />
        )}

        {/* Scoring / Judicial Review evaluation phase */}
        {room.status === 'scoring' && currentRound && (
          <ScoringRoom
            room={room}
            round={currentRound}
            isHost={isHost}
          />
        )}

        {/* Finished Phase Terminal Screen Block */}
        {room.status === 'finished' && (
          <div className="card max-w-xl mx-auto text-center py-16 px-6 border border-[var(--border-color)] relative overflow-hidden flex flex-col items-center justify-center">
            {/* Soft decorative background asset */}
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60" />
            
            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-sm border border-amber-500/20">
              <Trophy className="w-7 h-7" />
            </div>
            
            <div className="space-y-1.5 mb-8">
              <h2 className="font-display font-black text-[var(--text-primary)] text-2xl tracking-tight uppercase tracking-wide">
                Battle Matrix Complete
              </h2>
              <p className="text-[var(--text-secondary)] text-sm max-w-xs mx-auto">
                All weights have been calculated and committed. This session simulation is closed.
              </p>
            </div>
            
            <button 
              onClick={() => navigate('/lobby')} 
              className="btn-primary px-8 py-3.5 text-xs font-mono font-black uppercase tracking-wider shadow-md shadow-[var(--color-accent)]/10 hover:scale-[1.01] active:scale-[0.99] transform transition"
            >
              Reboot Terminal to Lobby
            </button>
          </div>
        )}
      </main>
    </div>
  );
}




