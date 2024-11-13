// DynamicTrafficLights.jsx
import React from "react";
const DynamicTrafficLights = ({
  dynamicLights,
  activeDynamicTimers,
  videoRef,
  inCounts,
  outCounts,
}) => {
  console.log("In counts: ", inCounts)
  console.log("Out counts: ", outCounts)
  return (
    <>
      <h6>Active Dynamic Traffic Lights</h6>

      <tbody>
        {dynamicLights
          .filter((light) =>
            activeDynamicTimers.some(
              (dynamicLight) => dynamicLight.id === light.traffic_light_id
            )
          )
          .map((light) => (
            <tr key={light.traffic_light_id}>
              {/* Video stream display */}
              <div className="video-container mt-3">
                <video
                  ref={videoRef}
                  autoPlay
                  controls
                  muted
                  style={{ width: "100%", maxHeight: "300px" }}
                ></video>
              </div>
              <td>{light.traffic_light_name || <i>No Name</i>}</td>
              <td>{light.traffic_light_timer || <i>No Timer</i>}</td>
              <td>
                <span className="text-success fw-bold">Active</span>
              </td>
            </tr>
          ))}
      </tbody>
    </>
  );
};

export default DynamicTrafficLights;
