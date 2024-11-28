import React, { useState, useEffect } from "react";

const DynamicTrafficLights = ({
  dynamicLights,
  activeDynamicTimers,
  videoRef,
  inCounts,
  outCounts,
  startCounting, // Prop passed to signal when counting starts
}) => {
  // State to hold countdown for each active dynamic timer
  const [dynamicCountdowns, setDynamicCountdowns] = useState({});

  useEffect(() => {
    // Initialize countdowns for dynamic lights
    const newCountdowns = {};
    activeDynamicTimers.forEach((timer) => {
      newCountdowns[timer.id] = timer.duration; // Set the initial duration
    });
    setDynamicCountdowns(newCountdowns);
  }, [activeDynamicTimers]);

  useEffect(() => {
    // Countdown logic for active dynamic timers
    const countdownInterval = setInterval(() => {
      setDynamicCountdowns((prevCountdowns) => {
        const updatedCountdowns = { ...prevCountdowns };

        Object.keys(updatedCountdowns).forEach((id) => {
          if (updatedCountdowns[id] > 0) {
            updatedCountdowns[id] -= 1; // Decrement the timer
          }
        });

        return updatedCountdowns;
      });
    }, 1000); // Decrease the countdown every second

    return () => clearInterval(countdownInterval); // Cleanup on component unmount
  }, []); // Only run once on mount

  useEffect(() => {
    if (startCounting) {
      // Reset the countdowns when start counting is triggered
      const newCountdowns = {};
      activeDynamicTimers.forEach((timer) => {
        newCountdowns[timer.id] = timer.duration; // Reset to the initial duration
      });
      setDynamicCountdowns(newCountdowns);
    }
  }, [startCounting, activeDynamicTimers]); // Trigger countdown reset on start counting

  return (
    <>
      <h6>Active Dynamic Traffic Lights</h6>
      {dynamicLights ? (
        dynamicLights
          .filter((light) =>
            activeDynamicTimers.some(
              (dynamicLight) => dynamicLight.id === light.traffic_light_id
            )
          )
          .map((light) => {
            const countdown = dynamicCountdowns[light.traffic_light_id];

            return (
              <div key={light.traffic_light_id} className="video-container mt-3">
                {/* Video stream display */}
                <div>
                  <p>
                    In Counts: <span className="text-success">{inCounts}</span>
                  </p>
                  <p>
                    Out Counts: <span className="text-danger">{outCounts}</span>
                  </p>
                  <p>
                    Timer:{" "}
                    <span className="text-primary">
                      {countdown !== undefined ? countdown : "N/A"}
                    </span>
                  </p>
                </div>
                <video
                  ref={videoRef}
                  autoPlay
                  controls
                  muted
                  style={{ width: "100%", maxHeight: "300px" }}
                ></video>
                <div>
                  <p>
                    {light.traffic_light_name || <i>No Name</i>}{" "}
                    {light.traffic_light_timer || <i>No Timer</i>}
                  </p>
                  <span className="text-success fw-bold">Active</span>
                </div>
              </div>
            );
          })
      ) : (
        <i>No active camera</i>
      )}
    </>
  );
};

export default DynamicTrafficLights;
