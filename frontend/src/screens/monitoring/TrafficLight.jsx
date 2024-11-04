import React, { useEffect, useState } from "react";

const TrafficLight = ({ groupedByDay, road }) => {
  const [activeStaticTimers, setActiveStaticTimers] = useState([]); // Store active Static timers
  const [activeDynamicTimers, setActiveDynamicTimers] = useState([]); // Store active Dynamic timers
  const [currentTimerIndex, setCurrentTimerIndex] = useState(0); // Index of the currently active Static timer
  const [countdown, setCountdown] = useState(null); // Store the countdown value for Static timers
  const [isCountingDown, setIsCountingDown] = useState(false); // Track if countdown is active for Static timers
  const [delayCountdown, setDelayCountdown] = useState(null); // Store the 3-second delay countdown for Static timers

  const dayOrder = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const getCurrentDay = () => {
    const now = new Date();
    const options = { weekday: "long" };
    return now.toLocaleDateString("en-US", options);
  };

  const isCurrentTimeInRange = (timeRange) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startTime, endTime] = timeRange.split(" - ").map((time) => {
      const [hours, minutes] = time.trim().split(":").map(Number);
      return hours * 60 + minutes;
    });

      // Handle scenarios where the end time may wrap around (e.g., from 23:00 to 00:01)
  if (endTime < startTime) {
    return currentTime >= startTime || currentTime <= endTime;
  }

  return currentTime >= startTime && currentTime <= endTime;
};

  const updateActiveTimers = () => {
    const newStaticTimers = [];
    const newDynamicTimers = [];

    const currentDay = getCurrentDay();

    Object.keys(groupedByDay).forEach((day) => {
      if (day === currentDay) {
        groupedByDay[day].forEach((light) => {
          if (light.traffic_mode === "Static") {
            const timers = light.traffic_light_timer?.split(";") || [];
            timers.forEach((segment) => {
              const [timeRange, timer] = segment.split(" : ");
              if (isCurrentTimeInRange(timeRange)) {
                const timerValue = parseInt(timer.trim(), 10);
                newStaticTimers.push({
                  id: light.traffic_light_id,
                  name: light.traffic_light_name,
                  duration: timerValue,
                });
              }
            });
          } else if (light.traffic_mode === "Dynamic") {
            const timers = light.traffic_light_timer?.split(";") || [];
            const isDynamicActive = timers.some((segment) => {
              const [timeRange] = segment.split(" : ");
              return isCurrentTimeInRange(timeRange);
            });

            if (isDynamicActive) {
              newDynamicTimers.push({
                id: light.traffic_light_id,
                name: light.traffic_light_name,
              });
              // Activate counting and HLS for dynamic traffic lights
              startCounting();
              startHLS();
            }
          }
        });
      }
    });

    newStaticTimers.sort((a, b) => b.duration - a.duration);
    setActiveStaticTimers(newStaticTimers);
    setActiveDynamicTimers(newDynamicTimers);
  };

  const startNextStaticTimer = () => {
    if (currentTimerIndex < activeStaticTimers.length) {
      const nextTimer = activeStaticTimers[currentTimerIndex];
      setDelayCountdown(3);
    }
  };

  useEffect(() => {
    updateActiveTimers();

    const interval = setInterval(() => {
      updateActiveTimers();
    }, 60000);

    return () => clearInterval(interval);
  }, [groupedByDay]);

  useEffect(() => {
    if (activeStaticTimers.length > 0 && !isCountingDown && delayCountdown === null) {
      startNextStaticTimer();
    }

    const delayInterval = setInterval(() => {
      if (delayCountdown !== null) {
        setDelayCountdown((prevDelay) => {
          if (prevDelay > 1) {
            return prevDelay - 1;
          } else {
            const nextTimer = activeStaticTimers[currentTimerIndex];
            setCountdown(nextTimer.duration);
            setIsCountingDown(true);
            setDelayCountdown(null);
            return null;
          }
        });
      }
    }, 1000);

    return () => clearInterval(delayInterval);
  }, [delayCountdown, activeStaticTimers, currentTimerIndex]);

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      if (isCountingDown) {
        setCountdown((prevCountdown) => {
          if (prevCountdown > 0) {
            return prevCountdown - 1;
          } else {
            setIsCountingDown(false);
            setCurrentTimerIndex((prevIndex) => prevIndex + 1);
            return null;
          }
        });
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [isCountingDown, activeStaticTimers, currentTimerIndex]);

  useEffect(() => {
    if (countdown === null && delayCountdown === null) {
      if (currentTimerIndex < activeStaticTimers.length) {
        startNextStaticTimer();
      } else {
        setCurrentTimerIndex(0);
      }
    }
  }, [countdown, delayCountdown]);
  
  const startCounting = async () => {
    if (selectedCameraId) {
      try {
        const response = await axios.get(
          `${api}/videos/start_counting/${selectedCameraId}`
        );
        console.log(response.data.message); // Display success message
      } catch (error) {
        console.error("Error starting counting:", error);
      }
    } else {
      alert("Please select a camera first.");
    }
  };

  const startHLS = async () => {
    if (selectedCameraId) {
      try {
        const response = await axios.post(
          `${api}/videos/start_hls/${selectedCameraId}`
        );
        console.log(response.data.message); // Display success message
      } catch (error) {
        console.error("Error starting HLS:", error);
      }
    } else {
      alert("Please select a camera first.");
    }
  };
  return (
    <div className="p-2" key={road.week_plan_id}>
      <div className="d-flex align-items-center justify-content-between">
        <p>{road.intersection_name}</p>
      </div>
      <div className="row m-0">
        {Object.keys(groupedByDay)
          .filter((day) =>
            groupedByDay[day].some(
              (light) => light.intersection_id === road.intersection_id
            )
          )
          .sort((a, b) => dayOrder[a] - dayOrder[b])
          .map((day) => (
            <div
              key={day}
              className="col-5 m-1 rounded p-2"
              style={{ backgroundColor: "#e0f7fa" }}
            >
              <h5>{day}</h5>
              <div className="bg-white">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>Traffic Light</th>
                      <th>Timer</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <h6>Static Traffic Lights</h6>
                  <tbody>
                    {groupedByDay[day]
                      .filter(
                        (light) =>
                          light.intersection_id === road.intersection_id &&
                          light.traffic_mode === "Static"
                      )
                      .map((light) => {
                        const isActive =
                          light.traffic_light_id ===
                          (activeStaticTimers[currentTimerIndex]?.id || null);
                        return (
                          <tr key={light.traffic_light_id}>
                            <td>{light.traffic_light_name || <i>No Name</i>}</td>
                            <td>
                              {light.traffic_light_timer ? (
                                light.traffic_light_timer
                                  .split(";")
                                  .map((segment, index) => {
                                    const [timeRange, timer] =
                                      segment.split(" : ");
                                    return (
                                      <div
                                        key={index}
                                        style={{
                                          color: isActive ? "green" : "black",
                                          fontWeight: isActive ? "bold" : "normal",
                                        }}
                                      >
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
                              {isActive ? (
                                delayCountdown !== null ? (
                                  <span className="text-warning fw-bold">
                                    {`${delayCountdown} get ready...`}
                                  </span>
                                ) : countdown !== null ? (
                                  <span className="text-success fw-bold">
                                    {`${countdown} seconds remaining`}
                                  </span>
                                ) : (
                                  "Finished"
                                )
                              ) : (
                                <span className="text-danger fw-bold">STOP</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                  <h6>Dynamic Traffic Lights</h6>
                  <tbody>
                    {groupedByDay[day]
                      .filter(
                        (light) =>
                          light.intersection_id === road.intersection_id &&
                          light.traffic_mode === "Dynamic"
                      )
                      .map((light) => {
                        const isActive = activeDynamicTimers.some(
                          (dynamicLight) => dynamicLight.id === light.traffic_light_id
                        );
                        return (
                          <tr key={light.traffic_light_id}>
                            <td>{light.traffic_light_name || <i>No Name</i>}</td>
                            <td>{light.traffic_light_timer || <i>No Timer</i>}</td>
                            <td>
                              {isActive ? (
                                <span className="text-success fw-bold">Active</span>
                              ) : (
                                <span className="text-danger fw-bold">Inactive</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default TrafficLight;
