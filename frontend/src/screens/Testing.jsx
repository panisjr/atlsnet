import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Hls from "hls.js";
import { io } from "socket.io-client";

function Testing() {
  const [inCounts, setInCounts] = useState(0);
  const [outCounts, setOutCounts] = useState(0);
  const [serverMessage, setServerMessage] = useState("");
  const videoRef = useRef(null);
  const hls = useRef(null); // useRef to persist hls instance
  const socket = useRef(null);
  const hlsStreamUrl = "http://localhost:5000/videos/stream.m3u8"; // HLS Stream URL

  const startCounting = async () => {
    try {
      await axios.post("http://localhost:5000/videos/start_counting");
    } catch (error) {
      console.error("Error starting object counting:", error);
    }
  };

  const startHLS = async () => {
    try {
      await axios.post("http://localhost:5000/videos/start_hls");
    } catch (error) {
      console.error("Error starting HLS streaming:", error);
    }
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
    <div style={{ textAlign: "center" }}>
      <h1>Traffic Object Counter</h1>
      <div style={{ margin: "20px 0" }}>
        <h2>Object Counts</h2>
        <p>In Counts: {inCounts}</p>
        <p>Out Counts: {outCounts}</p>
      </div>
      {videoRef && (
        <div>
          <video ref={videoRef} width="540" height="260" controls muted loop>
            Your browser does not support the video tag.
          </video>
          <div>
            <h3>Real-Time Server Updates</h3>
            <p>{serverMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Testing;
