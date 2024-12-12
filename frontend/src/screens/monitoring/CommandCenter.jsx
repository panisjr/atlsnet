import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { io } from "socket.io-client";
import axios from "axios";
import "./CommandCenter.css";
import config from '../../config'; 

function CommandCenter() {
  const [cameras, setCameras] = useState([]); // Store the list of active cameras
  const socket = useRef(null);
  const hlsInstances = useRef({}); // Store HLS instances for cleanup

  const apiUrl = config.API_URL;

  // Fetch all cameras from the backend
  const fetchCameras = async () => {
    try {
      const response = await axios.get(`${apiUrl}/intersections/get_cameras`);
      setCameras(response.data);
    } catch (error) {
      console.error("Error fetching cameras:", error);
    }
  };

  // Trigger HLS stream for a camera
  const startHlsStream = async (cameraId) => {
    try {
      const response = await axios.post(
        `${apiUrl}/commandCenter/videos/start_hls/${cameraId}`
      );
      console.log(response.data.message);
    } catch (error) {
      console.error("Error starting HLS stream:", error);
    }
  };

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!socket.current) {
      socket.current = io(`${apiUrl}`, {
        transports: ["websocket", "polling"],
      });

      socket.current.on("connect", () => {
        console.log("Connected to Socket.IO server");
      });

      // Handle real-time updates from the server
      socket.current.on("update_message", (data) => {
        console.log("Real-time update received:", data);
        // Example: Update camera list if needed
      });
      
      socket.current.on("disconnect", () => {
        console.log("Disconnected from server");
      });
    }

    // Clean up socket connection on unmount
    return () => {
      socket.current?.disconnect();
      socket.current = null;
    };
  }, [apiUrl]);

  useEffect(() => {
    fetchCameras(); // Fetch cameras on component mount
  }, []);

  useEffect(() => {
    // Trigger HLS stream for each camera once fetched
    cameras.forEach((camera) => {
      startHlsStream(camera.id); // Start HLS stream for each camera
    });
  }, [cameras]); // Trigger when cameras are fetched or updated

  // Function to initialize HLS for a specific camera
  const initializeHls = (streamUrl, videoElement) => {
    if (!videoElement || !Hls.isSupported()) return;

    // Check if an instance already exists to avoid recreating it
    if (hlsInstances.current[videoElement.src]) {
      hlsInstances.current[videoElement.src].destroy();
    }

    const hlsInstance = new Hls({
      maxBufferLength: 10,
      maxBufferSize: 100 * 1024,
      maxMaxBufferLength: 15,
      lowLatencyMode: true,
      liveSyncDuration: 2,
      liveMaxLatencyDuration: 3,
      levelLoadingMaxRetry: 3,
    });

    hlsInstance.loadSource(streamUrl);
    hlsInstance.attachMedia(videoElement);

    // Listen for the MANIFEST_PARSED event to play the video
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
      if (videoElement.paused) {
        videoElement.play();
      }
    });

    // Handle errors in the HLS instance
    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.error("HLS network error, retrying...");
            setTimeout(() => {
              hlsInstance.loadSource(streamUrl);
              hlsInstance.attachMedia(videoElement);
            }, 3000);
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hlsInstance.recoverMediaError();
            break;
          default:
            hlsInstance.destroy();
            break;
        }
      }
    });

    // Store the HLS instance for cleanup
    hlsInstances.current[videoElement.src] = hlsInstance;

    // Clean up the HLS instance when the component unmounts or when a video ref changes
    return () => {
      hlsInstance.destroy();
      delete hlsInstances.current[videoElement.src];
    };
  };

  return (
    <div className="command-center">
      <p>Command Center - Active Cameras</p>
      <div className="camera-grid">
        {cameras.map((camera) => (
          <div key={camera.id} className="camera-card">
            <h4>{camera.name}</h4>
            <p>Location: {camera.location}</p>
            <video
              controls
              autoPlay
              muted
              loop
              ref={(video) => {
                if (video) {
                  // Initialize HLS for the video element
                  initializeHls(
                    `${apiUrl}/commandCenter/videos/${camera.id}/stream.m3u8`,
                    video
                  );
                }
              }}
              style={{ width: "100%", maxHeight: "300px" }}
            ></video>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommandCenter;
