import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "./CommandCenter.css";
import config from '../../config'; 

function CommandCenter() {
  const [cameras, setCameras] = useState([]); // Store the list of active cameras
  const [isHlsStream, setIsHlsStream] = useState(true); // Toggle for HLS or RTMP stream type

  const apiUrl = config.API_URL;
  // const apiUrl = "http://localhost:5000";
  const videoRefs = useRef([]);

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

  // Function to initialize RTMP stream using video.js
  const initializeRtmpStream = (streamUrl, videoElement) => {
    if (!videoElement) return;

    // Initialize video.js player for RTMP
    const player = videojs(videoElement, {
      techOrder: ['flash', 'html5'],
      sources: [
        {
          type: "rtmp/mp4",
          src: streamUrl,
        },
      ],
    });

    // Play the stream
    player.play();

    // Clean up when component unmounts or video changes
    return () => {
      player.dispose();
    };
  };

  // Function to initialize HLS stream
  const initializeHlsStream = (streamUrl, videoElement) => {
    if (!videoElement) return;

    const hlsInstance = new Hls();
    hlsInstance.loadSource(streamUrl);
    hlsInstance.attachMedia(videoElement);

    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
      if (videoElement.paused) {
        videoElement.play();
      }
    });

    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        console.error("Error occurred in HLS stream:", data);
      }
    });

    return () => {
      hlsInstance.destroy();
    };
  };

  useEffect(() => {
    fetchCameras(); // Fetch cameras on component mount
  }, []);

  useEffect(() => {
    // Trigger stream for each camera once fetched
    cameras.forEach((camera) => {
      if (isHlsStream) {
        startHlsStream(camera.id); // Start HLS stream if enabled
      }
    });
  }, [cameras, isHlsStream]); // Trigger when cameras are fetched or updated

  return (
    <div className="command-center">
      <p>Command Center - Active Cameras</p>
      <div className="camera-grid">
        {cameras.map((camera) => (
          <div key={camera.id} className="camera-card">
            <h4>{camera.name}</h4>
            <p>Location: {camera.location}</p>

            <div className="stream-toggle">
              <label>
                <input
                  type="radio"
                  name={`stream-type-${camera.id}`}
                  checked={isHlsStream}
                  onChange={() => setIsHlsStream(true)}
                />
                HLS
              </label>
              <label>
                <input
                  type="radio"
                  name={`stream-type-${camera.id}`}
                  checked={!isHlsStream}
                  onChange={() => setIsHlsStream(false)}
                />
                RTMP
              </label>
            </div>

            <div className="video-wrapper">
              <video
                controls
                autoPlay
                muted
                ref={(video) => {
                  if (video) {
                    if (isHlsStream) {
                      initializeHlsStream(
                        `http://localhost:5000/commandCenter/videos/${camera.id}/stream.m3u8`,
                        video
                      );
                    } else {
                      // RTMP stream URL
                      initializeRtmpStream(
                        `rtmp://localhost:1935/live/${camera.id}`,
                        video
                      );
                    }
                  }
                }}
                className="video-js vjs-default-skin"
                style={{ width: "100%", maxHeight: "300px" }}
              ></video>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommandCenter;
