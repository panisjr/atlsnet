import axios from "axios";
import React, { useState, useEffect } from "react";

const StaticTrafficLights = ({
  staticLights,
  currentTimerIndex,
  activeStaticTimers,
  delayCountdown,
  countdown,
}) => {
  const [isGreenTimerSent, setIsGreenTimerSent] = useState(false); // Flag to track if Green Timer is sent

  // Function to send Green Timer to the Arduino
  const sendGreenTimerToArduino = async (light) => {
    try {
      const { traffic_light_name, traffic_light_timer } = light;

      if (!traffic_light_name || !traffic_light_timer) {
        console.log("Invalid light or timer information");
        return;
      }

      // Split the traffic light timer into segments (Green, Yellow, Red times)
      const timerSegments = traffic_light_timer.split(";").map((segment) => {
        const [timeRange, timer] = segment.split(" : ");
        return { timeRange, timer: parseInt(timer.trim(), 10) };
      });

      // Extract only the Green Timer (assuming it's the first segment)
      const greenTimer = timerSegments[0]?.timer || 0;

      // Send the Green Timer to Arduino
      const response = await axios.post("http://localhost:5000/pyduino/set-green-timer", {
        lightName: traffic_light_name,
        greenTimer: greenTimer,
      });

      console.log("Green Timer sent to Arduino:", response.data);
    } catch (error) {
      console.error("Error sending Green Timer to Arduino:", error);
    }
  };

  useEffect(() => {
    // Check if countdown has reached zero and the Green Timer has not been sent yet
    if (
      staticLights &&
      activeStaticTimers[currentTimerIndex] &&
      countdown === 0 && // Trigger only when the countdown reaches 0
      !isGreenTimerSent // Only send if not already sent
    ) {
      const currentLight = staticLights.find(
        (light) =>
          light.traffic_light_id === activeStaticTimers[currentTimerIndex]?.id
      );
      if (currentLight) {
        sendGreenTimerToArduino(currentLight);
        setIsGreenTimerSent(true); // Set flag to true to prevent sending again
      }
    }

    // Reset isGreenTimerSent when countdown changes (for the next cycle)
    if (countdown > 0 && isGreenTimerSent) {
      setIsGreenTimerSent(false); // Reset flag when countdown starts again
    }
  }, [staticLights, currentTimerIndex, countdown, activeStaticTimers, isGreenTimerSent]); 

  return (
    <>
      <h6>Active Static Traffic Lights</h6>
      {staticLights ? (
        staticLights
          .filter(
            (light) =>
              light.traffic_light_id ===
              (activeStaticTimers[currentTimerIndex]?.id || null)
          )
          .map((light) => (
            <tr key={light.traffic_light_id}>
              <td>{light.traffic_light_name || <i>No Name</i>}</td>
              <td>
                {light.traffic_light_timer ? (
                  light.traffic_light_timer.split(";").map((segment, index) => {
                    const [timeRange, timer] = segment.split(" : ");
                    return (
                      <div key={index}>
                        {timeRange?.trim()}
                        {timer ? (
                          <span style={{ color: "red" }}>
                            {` : ${timer.trim()}`}
                          </span>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <i>No Timer</i>
                )}
              </td>
              <td>
                {delayCountdown !== null ? (
                  <span className="text-warning fw-bold">
                    {`${delayCountdown} get ready...`}
                  </span>
                ) : countdown !== null ? (
                  <span className="text-success fw-bold">
                    {`${countdown} seconds remaining`}
                  </span>
                ) : (
                  "Finished"
                )}
              </td>
            </tr>
          ))
      ) : (
        <i>No active static lights</i>
      )}
    </>
  );
};

export default StaticTrafficLights;
