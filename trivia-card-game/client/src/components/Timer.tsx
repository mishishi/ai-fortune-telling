import React, { useEffect, useRef, useState } from 'react';

interface TimerProps {
  seconds: number;
  onTimeout: () => void;
  active: boolean;
}

export const Timer: React.FC<TimerProps> = ({ seconds, onTimeout, active }) => {
  const [remaining, setRemaining] = useState(seconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!active) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [active, onTimeout]);

  const isDanger = remaining <= 3;
  return (
    <div className={`timer-ring${isDanger ? ' danger' : ''}`}>
      {remaining}
    </div>
  );
};
