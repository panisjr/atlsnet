import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import StaticTrafficLights from "./StaticTrafficLights";
import DynamicTrafficLights from "./DynamicTrafficLights";
import Hls from "hls.js";
import { io } from "socket.io-client";
const TrafficLight = ({ groupedByDay, road, api, trafficLightSettings }) => {
  const [inCounts, setInCounts] = useState(0);
  const [outCounts, setOutCounts] = useState(0);
  const [serverMessage, setServerMessage] = useState("");
  const videoRef = useRef(null);
  const hls = useRef(null); // useRef to persist hls instance
  const socket = useRef(null);
  const hlsStreamUrl = "http://localhost:5000/videos/stream.m3u8"; // HLS Stream URL

  const [activeStaticTimers, setActiveStaticTimers] = useState([]);
  const [activeDynamicTimers, setActiveDynamicTimers] = useState([]);
  const [currentTimerIndex, setCurrentTimerIndex] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [delayCountdown, setDelayCountdown] = useState(null);

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
    if (
      activeStaticTimers.length > 0 &&
      !isCountingDown &&
      delayCountdown === null
    ) {
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
    const selectedCameraId = road.camera_info.camera_id;
    if (selectedCameraId && api) {
      try {
        const { data } = await axios.post(
          `${api}/videos/start_counting/${selectedCameraId}`
        );
        console.log(data.message);
      } catch (error) {
        console.error("Error starting counting:", error);
      }
    } else alert("Please select a camera first.");
  };
  const startHLS = async () => {
    const selectedCameraId = road.camera_info.camera_id;
    if (selectedCameraId && api) {
      try {
        const { data } = await axios.post(
          `${api}/videos/start_hls/${selectedCameraId}`
        );
        console.log(data.message);
      } catch (error) {
        console.error("Error starting HLS:", error);
      }
    } else alert("Please select a camera first.");
  };

 useEffect(() => {
    const startHLSTimeout = setTimeout(startHLS, 5000);
    const startCountingTimeout = setTimeout(startCounting, 3000);

    // Initialize socket connection and listeners only once
    if (!socket.current) {
      socket.current = io("http://localhost:5000", {
        transports: ["websocket", "polling"],
      });

      socket.current.on("connect", () => {
        console.log("Connected to Socket.IO server");
      });

      socket.current.on("update_message", (data) => {
        setServerMessage(data.message || "");
        setInCounts(data.in_counts || 0);
        setOutCounts(data.out_counts || 0);
      });
    }

    // Initialize HLS.js for video streaming only once
    if (!hls.current && videoRef.current) {
      hls.current = new Hls({
        maxBufferLength: 10,
        maxBufferSize: 100 * 1024,
        maxMaxBufferLength: 15,
        lowLatencyMode: true,
        liveSyncDuration: 2,
        liveMaxLatencyDuration: 3,
        levelLoadingMaxRetry: 3,
      });

      hls.current.loadSource(hlsStreamUrl);
      hls.current.attachMedia(videoRef.current);

      hls.current.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current.play();
      });

      hls.current.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setTimeout(() => {
                hls.current.loadSource(hlsStreamUrl);
                hls.current.attachMedia(videoRef.current);
              }, 3000);
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.current.recoverMediaError();
              break;
            default:
              hls.current.destroy();
              break;
          }
        }
      });
    }

    // Clean up resources on component unmount
    return () => {
      clearTimeout(startCountingTimeout);
      clearTimeout(startHLSTimeout);
      hls.current?.destroy();
      hls.current = null;
      socket.current?.disconnect();
      socket.current = null;
    };
  }, []);
  return (
    <div className="p-2" key={road.week_plan_id}>
      <div className="d-flex align-items-center justify-content-between">
        <p>{road.intersection_name}</p>
      </div>
      <div className="row m-0">
        {Object.keys(groupedByDay)
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
                </table>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default TrafficLight;
