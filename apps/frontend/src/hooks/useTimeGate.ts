import { useState, useEffect } from 'react';

interface UseTimeGateOptions {
  minTime?: number; // Minimum time in milliseconds
  onTimeGatePassed?: () => void;
}

export const useTimeGate = (options: UseTimeGateOptions = {}) => {
  const { minTime = 2000, onTimeGatePassed } = options;
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isTimeGatePassed, setIsTimeGatePassed] = useState(false);

  useEffect(() => {
    // Set start time when component mounts
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    if (!startTime) return;

    const checkTimeGate = () => {
      const currentTime = Date.now();
      const timeDiff = currentTime - startTime;

      if (timeDiff >= minTime) {
        setIsTimeGatePassed(true);
        onTimeGatePassed?.();
      }
    };

    const timer = setTimeout(checkTimeGate, minTime);

    return () => clearTimeout(timer);
  }, [startTime, minTime, onTimeGatePassed]);

  const getSubmitTime = () => {
    return startTime ? startTime.toString() : null;
  };

  return {
    isTimeGatePassed,
    getSubmitTime,
    startTime,
  };
};
