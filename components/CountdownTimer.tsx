'use client';

import { useEffect, useState } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: string | Date;
  onComplete?: () => void;
}

export default function CountdownTimer({ targetDate, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft | null => {
      const difference = +new Date(targetDate) - +new Date();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return null;
    };

    // Initial calculation
    const initial = calculateTimeLeft();
    setTimeLeft(initial);
    if (!initial) {
      setIsComplete(true);
      onComplete?.();
    }

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (!newTimeLeft && !isComplete) {
        setIsComplete(true);
        onComplete?.();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete, isComplete]);

  if (isComplete || !timeLeft) {
    return (
      <div className="text-red-600 font-semibold">
        Süre Doldu
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <TimeUnit value={timeLeft.days} label="Gün" />
      <TimeUnit value={timeLeft.hours} label="Saat" />
      <TimeUnit value={timeLeft.minutes} label="Dakika" />
      <TimeUnit value={timeLeft.seconds} label="Saniye" />
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-primary-600 text-white rounded-lg px-3 py-2 min-w-[60px] text-center">
        <span className="text-2xl font-bold">{String(value).padStart(2, '0')}</span>
      </div>
      <span className="text-sm text-gray-600 mt-1">{label}</span>
    </div>
  );
}
