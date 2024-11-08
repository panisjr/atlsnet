// StaticTrafficLights.jsx
import React from "react";

const StaticTrafficLights = ({
  staticLights,
  currentTimerIndex,
  activeStaticTimers,
  delayCountdown,
  countdown,
}) => {
  return (
    <>
      <h6>Active Static Traffic Lights</h6>
      <tbody>
        {staticLights
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
          ))}
      </tbody>
    </>
  );
};

export default StaticTrafficLights;
