import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Hls from "hls.js";
import { io } from "socket.io-client";

function Testing2() {
  const [inCounts, setInCounts] = useState(0);
  const [outCounts, setOutCounts] = useState(0);
  const [serverMessage, setServerMessage] = useState("");
  const videoRef = useRef(null);
  const socket = useRef(null);
  const hlsStreamUrl = "http://localhost:5000/stream.m3u8"; // HLS Stream URL


  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  // Function to start object counting by sending a POST request to /start_counting
  const startCounting = async () => {
    try {
      await axios.post("http://localhost:5000/start_counting");
      console.log("Started object counting");
    } catch (error) {
      console.error("Error starting object counting:", error);
    }
  };

  // Function to start HLS streaming by sending a POST request to /start_hls
  const startHLS = async () => {
    try {
      await axios.post("http://localhost:5000/start_hls");
      console.log("Started HLS streaming");
    } catch (error) {
      console.error("Error starting HLS streaming:", error);
    }
  };

  useEffect(() => {
    // Automatically trigger counting and HLS streaming upon component mount
    const startCountingTimeout = setTimeout(startCounting, 3000);
    const startHLSTimeout = setTimeout(startHLS, 5000);

    // Initialize Socket.IO connection to receive real-time object counts
    socket.current = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
    });

    socket.current.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    // Handle real-time updates from the backend server
    socket.current.on("update_message", (data) => {
      setServerMessage(data.message || "");
      if (data.in_counts !== undefined) setInCounts(data.in_counts);
      if (data.out_counts !== undefined) setOutCounts(data.out_counts);
    });

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
      clearTimeout(startCountingTimeout);
      clearTimeout(startHLSTimeout);
      hls.destroy();
      socket.current.disconnect();
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
     
      {/* Toast for success or error messages */}
      {showMessage && (
        <div
          aria-live="polite"
          aria-atomic="true"
          className="toastContainer"
          style={{ zIndex: 9999 }}
        >
          <div className="toast-wrapper">
            <div
              className={`toast show ${error ? "bg-danger" : "bg-success"}`}
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            >
              <div className="toast-header">
                <strong className="me-auto">Notification</strong>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="toast"
                  aria-label="Close"
                ></button>
              </div>
              <div className="toast-body text-white">{error || success}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Testing2;