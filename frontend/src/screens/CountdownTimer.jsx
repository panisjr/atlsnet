// CountdownTimer.js
import React, { useEffect, useState } from 'react';

const CountdownTimer = ({ timers, endTime }) => {
  const [remainingTime, setRemainingTime] = useState(timers[0] || 0);
  const [currentTimerIndex, setCurrentTimerIndex] = useState(0);
  const [isCounting, setIsCounting] = useState(true); // Control counting state

  useEffect(() => {
    if (timers.length === 0 || !isCounting) return; // No timers or counting stopped

    // Set remaining time to the current timer
    setRemainingTime(timers[currentTimerIndex]);

    const countdown = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          // Timer expired
          if (currentTimerIndex < timers.length - 1) {
            // Move to the next timer if available
            setCurrentTimerIndex((prevIndex) => prevIndex + 1);
            return timers[currentTimerIndex + 1]; // Start the next timer
          } else {
            // Reset to the first timer and repeat
            setCurrentTimerIndex(0);
            return timers[0];
          }
        }
        return prevTime - 1; // Decrease remaining time by 1
      });

      // Stop counting if end time is reached
      if (new Date().getTime() >= endTime) {
        clearInterval(countdown);
        setIsCounting(false); // Stop the countdown
      }
    }, 1000); // Update every second

    return () => clearInterval(countdown); // Cleanup on unmount or prop change
  }, [timers, currentTimerIndex, endTime, isCounting]);

  return (
    <span style={{ color: "red" }}>
      {remainingTime > 0 ? `${remainingTime} seconds remaining` : "Timer expired!"}
    </span>
  );
};

export default CountdownTimer;
