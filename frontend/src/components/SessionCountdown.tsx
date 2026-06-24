'use client';

import { useEffect, useState } from 'react';

export default function SessionCountdown({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const exp = new Date(expiresAt).getTime();
      const distance = exp - now;

      if (distance < 0) {
        return 'Expired';
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const pad = (n: number) => n.toString().padStart(2, '0');

      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className="text-4xl font-mono font-bold text-[#1A56DB] tracking-wider">
      {timeLeft || '00:00:00'}
    </div>
  );
}
