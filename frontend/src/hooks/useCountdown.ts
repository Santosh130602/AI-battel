import { useState, useEffect, useRef } from 'react';

export function useCountdown(startedAt: string | null, timeLimitSeconds: number) {
  const [secondsLeft, setSecondsLeft] = useState(timeLimitSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!startedAt) return;

    const tick = () => {
      const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
      const remaining = Math.max(0, Math.ceil(timeLimitSeconds - elapsed));
      setSecondsLeft(remaining);
    };

    tick(); // run immediately
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startedAt, timeLimitSeconds]);

  const isExpired = secondsLeft === 0;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const pct = timeLimitSeconds > 0 ? (secondsLeft / timeLimitSeconds) * 100 : 0;

  return { secondsLeft, formatted, isExpired, pct };
}
