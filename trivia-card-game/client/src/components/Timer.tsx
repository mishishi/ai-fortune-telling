import React, { useEffect, useRef, useState } from 'react';

interface TimerProps {
  seconds: number;
  onTimeout: () => void;
  active: boolean;
}

export const Timer: React.FC<TimerProps> = ({ seconds, onTimeout, active }) => {
  // 懒初始化，避免任何 setState during render
  const [remaining, setRemaining] = useState(() => seconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(seconds);

  // 当 seconds prop 变化时（题目切换），重置计时器
  useEffect(() => {
    if (seconds !== secondsRef.current) {
      secondsRef.current = seconds;
      setRemaining(seconds);
    }
  }, [seconds]);

  useEffect(() => {
    if (!active) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    // active 变为 true 时，重置并启动
    setRemaining(secondsRef.current);
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          // 延迟调用 onTimeout，避免在 interval 回调中 setState
          setTimeout(onTimeout, 0);
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
