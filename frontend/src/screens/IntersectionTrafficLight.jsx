import React, { useEffect, useState } from 'react';

const IntersectionTrafficLight = ({ light }) => {
  const [activeTimers, setActiveTimers] = useState([]); // Store active timers with durations
  const [currentTimerIndex, setCurrentTimerIndex] = useState(0); // Index of the currently active timer
  const [countdown, setCountdown] = useState(null); // Store the countdown value
  const [isCountingDown, setIsCountingDown] = useState(false); // State to track if countdown is active
  const [preDelay, setPreDelay] = useState(3); // State for 3 seconds delay before each timer change
  const [isInPreDelay, setIsInPreDelay] = useState(true); // State to check if it's in the pre-delay period

  const updateActiveTimers = () => {
    const timers = light.traffic_light_timer?.split(";") || [];
    const newActiveTimers = [];

    timers.forEach((segment) => {
      const [timeRange, timer] = segment.split(" : ");
      const timerValue = parseInt(timer.trim(), 10);
      newActiveTimers.push({
        id: light.traffic_light_id,
        name: light.traffic_light_name,
        duration: timerValue,
      });
    });

    // Sort active timers by duration in descending order
    newActiveTimers.sort((a, b) => b.duration - a.duration);
    setActiveTimers(newActiveTimers);
  };

  const startNextTimer = () => {
    if (currentTimerIndex < activeTimers.length) {
      const nextTimer = activeTimers[currentTimerIndex];
      setIsInPreDelay(true); // Start the 3-second pre-delay
      setPreDelay(3); // Reset the pre-delay timer
      setCountdown(nextTimer.duration); // Set the main timer countdown
    }
  };

  useEffect(() => {
    updateActiveTimers(); // Initial check for active timers

    const interval = setInterval(() => {
      updateActiveTimers(); // Check for active timers every minute
    }, 60000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [light]);

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      if (isInPreDelay) {
        // Pre-delay countdown
        setPreDelay((prevPreDelay) => {
          if (prevPreDelay > 0) {
            return prevPreDelay - 1;
          } else {
            setIsInPreDelay(false); // End pre-delay and start the main countdown
            setIsCountingDown(true); // Begin the main countdown
            return 0;
          }
        });
      } else if (isCountingDown) {
        // Main timer countdown
        setCountdown((prevCountdown) => {
          if (prevCountdown > 0) {
            return prevCountdown - 1; // Decrement countdown
          } else {
            // Move to the next timer once the current one finishes
            setIsCountingDown(false);
            setCurrentTimerIndex((prevIndex) => prevIndex + 1);
            return null; // Reset countdown when it reaches zero
          }
        });
      }
    }, 1000); // Update countdown every second

    return () => clearInterval(countdownInterval); // Cleanup on unmount
  }, [isInPreDelay, isCountingDown]);

  useEffect(() => {
    if (countdown === null && !isInPreDelay) {
      if (currentTimerIndex < activeTimers.length) {
        startNextTimer(); // Start next timer if countdown finished
      } else {
        // Reset to start over once all timers have finished
        setCurrentTimerIndex(0);
      }
    }
  }, [countdown, isInPreDelay]);

  const isActive = light.traffic_light_id === (activeTimers[currentTimerIndex]?.id || null);

  return (
    <tr>
      <td>{light.traffic_light_name || <i>No Name</i>}</td>
      <td>
        {light.traffic_light_timer ? (
          light.traffic_light_timer.split(";").map((segment, index) => {
            const [timeRange, timer] = segment.split(" : ");
            return (
              <div
                key={index}
                style={{
                  color: isActive ? 'green' : 'black',
                  fontWeight: isActive ? 'bold' : 'normal',
                }}
              >
                {timeRange?.trim()}
                {timer ? <span style={{ color: 'red' }}>{` : ${timer.trim()}`}</span> : null}
              </div>
            );
          })
        ) : (
          <i>No Timer</i>
        )}
      </td>
      <td>
        {isActive ? (
          isInPreDelay ? (
            <span style={{ color: 'blue' }}>{preDelay} seconds before change...</span>
          ) : (
            <span style={{ color: 'red' }}>
              {countdown !== null ? `${countdown} seconds remaining` : 'Finished'}
            </span>
          )
        ) : (
          <span>waiting . . .</span>
        )}
      </td>
    </tr>
  );
};

export default IntersectionTrafficLight;
