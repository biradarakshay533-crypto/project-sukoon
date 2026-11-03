"use client";

import { useEffect, useState } from "react";

// "12:34 left" until the deadline, updated every second.
export function Countdown({ deadline, startedAt }: { deadline: string; startedAt: string }) {
  const [now, setNow] = useState(() => new Date(startedAt).getTime());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = Math.max(0, Math.floor((new Date(deadline).getTime() - now) / 1000));
  const minutes = Math.floor(seconds / 60);

  if (seconds === 0) {
    return <span>Time is up</span>;
  }

  return (
    <span className="tabular-nums">
      {minutes}:{String(seconds % 60).padStart(2, "0")} left
    </span>
  );
}
