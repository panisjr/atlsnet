import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Hls from "hls.js";
import { io } from "socket.io-client";
import StaticTrafficLights from "./StaticTrafficLights";
import DynamicTrafficLights from "./DynamicTrafficLights";
import { debounce } from "lodash";

const TrafficLight = ({ groupedByDay, road, apiUrl, trafficLightSettings }) => {
  // State management
  const [inCounts, setInCounts] = useState(0);
  const [outCounts, setOutCounts] = useState(0);
  const [activeStaticTimers, setActiveStaticTimers] = useState([]);
  const [activeDynamicTimers, setActiveDynamicTimers] = useState([]);
  const [currentTimerIndex, setCurrentTimerIndex] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [delayCountdown, setDelayCountdown] = useState(null);
  const [dynamicTimer, setDynamicTimer] = useState("");
  const videoRef = useRef(null);
  const [hlsStreamUrl, setHlsStreamUrl] = useState("");
  const socket = useRef(null);

  const dayOrder = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  // Helper functions
  const getCurrentDay = () =>
    new Date().toLocaleDateString("en-US", { weekday: "long" });

  const isCurrentTimeInRange = (timeRange) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startTime, endTime] = timeRange.split(" - ").map((time) => {
      const [hours, minutes] = time.trim().split(":").map(Number);
      return hours * 60 + minutes;
    });

    return endTime < startTime
      ? currentTime >= startTime || currentTime <= endTime
      : currentTime >= startTime && currentTime <= endTime;
  };
  let isFirstStart = true; // To track whether we've started with a 15-second duration.
  let dynamicTimerRunning = false;
  let isUpdatingTimers = false;
  const updateActiveTimers = () => {
    if (isUpdatingTimers) return;
    isUpdatingTimers = true;
    try {
      const currentDay = getCurrentDay();
      const newStaticTimers = [];
      const newDynamicTimers = [];
      if (groupedByDay[currentDay]) {
        groupedByDay[currentDay].forEach((light) => {
          const timers = light.traffic_light_timer?.split(";") || [];
          if (light.traffic_mode === "Static") {
            timers.forEach((segment) => {
              const [timeRange, timer] = segment.split(" : ");
              if (isCurrentTimeInRange(timeRange)) {
                newStaticTimers.push({
                  id: light.traffic_light_id,
                  name: light.traffic_light_name,
                  duration: parseInt(timer.trim(), 10),
                });
              }
            });
          } else if (light.traffic_mode === "Dynamic") {
            if (
              timers.some((segment) =>
                isCurrentTimeInRange(segment.split(" : ")[0])
              )
            ) {
              // const fallbackDuration = 15; // Default 15 seconds fallback duration
              // const dynamicCountDuration =
              //   outCounts > 0 ? outCounts * 5 : fallbackDuration;

              newDynamicTimers.push({
                id: light.traffic_light_id,
                name: light.traffic_light_name,
                duration: outCounts * 3,
              });
              startCounting(light);
              // startHLS(light);
            }
          }
        });
      }

      setActiveStaticTimers(
        newStaticTimers.sort((a, b) => b.duration - a.duration)
      );
      setActiveDynamicTimers(
        newDynamicTimers.sort((a, b) => b.duration - a.duration)
      );
    } finally {
      isUpdatingTimers = false;
    }
  };

  const startCounting = async (light) => {
    const { camera_id: selectedCameraId } = light.camera_info || {};
    if (!selectedCameraId || !apiUrl) {
      console.error("Camera ID or apiUrl is missing");
      alert("Please select a camera first.");
      return;
    }

    try {
      const response = await axios.post(
        `${apiUrl}/videos/start_counting/${selectedCameraId}`
      );
      console.log(response.data.out_counts);
      setOutCounts(response.data.out_counts)
    } catch (error) {
      console.error("Error starting counting:", error);
    }
};
  
  // const startCounting = async (light, duration) => {
  //   console.log("Out Counts Timer: ", duration); // Log the duration being used for debugging
  //   const { camera_id: selectedCameraId } = light.camera_info || {};

  //   try {
  //     const { data } = await axios.post(
  //       `${apiUrl}/videos/start_counting/${selectedCameraId}`,
  //       { duration } // Pass duration in request payload
  //     );
  //     console.log("Response from server:", data.message);
  //   } catch (error) {
  //     console.error("Error starting counting:", error);
  //   }
  // };

  const startHLS = async (light) => {
    const { camera_id: selectedCameraId } = light.camera_info || {};
    // if (!selectedCameraId || !apiUrl) {
    //   alert("Please select a camera first.");
    //   return;
    // }

    try {
      const { data } = await axios.post(
        `${apiUrl}/videos/start_hls/${selectedCameraId}`
      );
      console.log(data.message);
      // Update the HLS stream URL after starting the stream
      const updatedHlsStreamUrl = `${apiUrl}/hls/${selectedCameraId}/stream.m3u8`;
      setHlsStreamUrl(updatedHlsStreamUrl); // Update state with the new URL
    } catch (error) {
      console.error("Error starting HLS:", error);
    }
  };

  const startNextStaticTimer = () => {
    if (currentTimerIndex < activeStaticTimers.length) {
      setIsCountingDown(false); // Stop the countdown for the current timer
      setDelayCountdown(3); // Set 3-second delay
    }
  };
  const startNextDynamicTimer = () => {
    if (currentTimerIndex < activeDynamicTimers.length) {
      // Use inCounts for dynamic timer
      setIsCountingDown(false); // Start countdown
      setDelayCountdown(3); // Optional: set a 3-second delay before the countdown starts
    }
  };

  // Effects
  useEffect(() => {
    updateActiveTimers();
  }, [groupedByDay]);
  
  // const debouncedUpdateActiveTimers = debounce(updateActiveTimers, 60000);
  // useEffect(() => {
  //   debouncedUpdateActiveTimers();
  //   return () => debouncedUpdateActiveTimers.cancel();
  // }, [groupedByDay]);
  // useEffect(() => {
  //   updateActiveTimers();
  //   const interval = setInterval(updateActiveTimers, 60000);
  //   return () => clearInterval(interval);
  // }, [groupedByDay]);
  useEffect(() => {
    if (delayCountdown !== null) {
      const delayInterval = setInterval(() => {
        setDelayCountdown((prev) => {
          if (prev > 1) return prev - 1;
          setCountdown(activeStaticTimers[currentTimerIndex]?.duration || null);
          setIsCountingDown(true);
          setDelayCountdown(null);
          return null;
        });
      }, 1000);

      return () => clearInterval(delayInterval);
    }
  }, [delayCountdown, activeStaticTimers, currentTimerIndex]);

  // Effect to handle countdown
  useEffect(() => {
    if (isCountingDown) {
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev > 0) return prev - 1;
          setIsCountingDown(false); // Stop the countdown
          setCurrentTimerIndex((prevIndex) => {
            // Move to the next timer in the list (static or dynamic)
            if (prevIndex + 1 < activeStaticTimers.length) {
              return prevIndex + 1; // Move to next static timer
            } else if (prevIndex + 1 < activeDynamicTimers.length) {
              return prevIndex + 1; // Move to next dynamic timer
            } else {
              return 0; // Restart from the beginning (loop)
            }
          });
          return null; // Reset countdown
        });
      }, 1000);

      return () => clearInterval(countdownInterval); // Clean up the interval on unmount
    }
  }, [isCountingDown, activeStaticTimers, activeDynamicTimers]);

  useEffect(() => {
    if (countdown === null && delayCountdown === null) {
      // Check if we are in a static or dynamic timer phase
      if (currentTimerIndex < activeStaticTimers.length) {
        startNextStaticTimer(); // Start the next static timer
      } else if (currentTimerIndex < activeDynamicTimers.length) {
        startNextDynamicTimer();
      } else {
        // If all timers are completed, restart from the beginning
        setCurrentTimerIndex(0); // Reset the timer index
        setDelayCountdown(null); // Ensure delayCountdown is reset after finishing all timers
        setCountdown(activeStaticTimers[0]?.duration || null); // Start from the first static timer
        setIsCountingDown(true); // Restart the countdown from the first timer
      }
    }
  }, [
    countdown,
    delayCountdown,
    activeStaticTimers.length,
    activeDynamicTimers.length,
    inCounts,
  ]);

  useEffect(() => {
    // Initialize Socket.IO connection to receive real-time object counts
    socket.current = io(`${apiUrl}`, {
      transports: ["websocket", "polling"],
    });

    socket.current.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    // Handle real-time updates from the backend server
    socket.current.on("update_message", (data) => {
      if (data.out_counts !== undefined) {
        setOutCounts(data.out_counts); // Multiply in_counts by 2
      }
      if (data.in_counts !== undefined) setInCounts(data.in_counts);
    });

    // socket.current.on("video_counts_update", (data) => {
    //   if (data.error) {
    //     console.error("Error saving data:", data.error);
    //   } else {
    //     if (data.out_counts !== undefined) {
    //       setOutCounts(data.out_counts); // Multiply in_counts by 2
    //     }
    //     console.log(
    //       `Counts updated - Camera ID: ${data.camera_id}, IN: ${data.in_counts}, OUT: ${data.out_counts}`
    //     );
    //   }
    // });

    // Initialize HLS.js for video streaming
    const video = videoRef.current;
    const hls = new Hls({
      maxBufferLength: 10,
      maxBufferSize: 100 * 1024,
      maxMaxBufferLength: 15,
      lowLatencyMode: true,
      liveSyncDuration: 2,
      liveMaxLatencyDuration: 3,
      levelLoadingMaxRetry: 3,
    });

    hls.loadSource(hlsStreamUrl);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      console.log("HLS manifest parsed. Starting playback...");
      video.play();
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.error("Network error, attempting to reload...");
            setTimeout(() => {
              hls.loadSource(hlsStreamUrl);
              hls.attachMedia(video);
            }, 3000);
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error("Media error, attempting to recover...");
            hls.recoverMediaError();
            break;
          default:
            hls.destroy();
            break;
        }
      }
    });

    // Clean up resources on component unmount
    return () => {
      hls.destroy();
      socket.current.disconnect();
    };
  }, []);

  // Render
  return (
    <div className="p-2" key={road.week_plan_id}>
      <div className="d-flex align-items-center justify-content-between">
        <p>{road.intersection_name}</p>
      </div>
      <div className="row m-0">
        {Object.keys(groupedByDay).length > 0 ? (
          Object.keys(groupedByDay)
            .filter((day) =>
              groupedByDay[day].some(
                (light) =>
                  light.intersection_id === road.intersection_id &&
                  light.day === getCurrentDay()
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
                    <tbody>
                      {groupedByDay[day].filter(
                        (light) =>
                          light.intersection_id === road.intersection_id &&
                          light.traffic_mode === "Static"
                      ).length > 0 ? (
                        <StaticTrafficLights
                          staticLights={groupedByDay[day].filter(
                            (light) =>
                              light.intersection_id === road.intersection_id &&
                              light.traffic_mode === "Static"
                          )}
                          currentTimerIndex={currentTimerIndex}
                          activeStaticTimers={activeStaticTimers}
                          delayCountdown={delayCountdown}
                          countdown={countdown}
                        />
                      ) : (
                        <tr>
                          <td colSpan="3">
                            No static traffic lights available
                          </td>
                        </tr>
                      )}
                      {groupedByDay[day].filter(
                        (light) =>
                          light.intersection_id === road.intersection_id &&
                          light.traffic_mode === "Dynamic"
                      ).length > 0 ? (
                        <DynamicTrafficLights
                          dynamicLights={groupedByDay[day].filter(
                            (light) =>
                              light.intersection_id === road.intersection_id &&
                              light.traffic_mode === "Dynamic"
                          )}
                          activeDynamicTimers={activeDynamicTimers}
                          videoRef={videoRef}
                          inCounts={inCounts}
                          outCounts={outCounts}
                        />
                      ) : (
                        <tr>
                          <td colSpan="3">
                            No dynamic traffic lights available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
        ) : (
          <i>No active traffic lights available</i>
        )}
      </div>
    </div>
  );
};

export default TrafficLight;
