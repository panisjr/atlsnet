import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { io } from "socket.io-client"; // Import Socket.IO client

const RealTime = () => {
  const videoRef = useRef(null);
  const socket = useRef(null); // Create a ref for the Socket.IO connection
  const [serverMessage, setServerMessage] = useState(""); // State to store real-time messages from the server
  const [isRetrying, setIsRetrying] = useState(false); // Track retry attempts

  useEffect(() => {
    // Initialize the Socket.IO connection
    socket.current = io("http://localhost:5000", {
      transports: ["websocket", "polling"], // Specify transports
    });

    // Log when connected
    socket.current.on("connect", () => {
      console.log("Connected to SocketIO server");
    });

    // Handle real-time messages from the server
    socket.current.on("update_message", (data) => {
      console.log("Received real-time update from server:", data);
      setServerMessage(data.message); // Update the message displayed in the frontend

      let currentStreamUrl = hlsStreamUrl;

      // Load the HLS stream only if the source has actually changed
      if (data.message && currentStreamUrl !== hlsStreamUrl) {
        console.log("Loading HLS stream due to server update...");
        hls.loadSource(hlsStreamUrl);
        currentStreamUrl = hlsStreamUrl;
      }
    });

    // Log connection errors
    socket.current.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });

    const video = videoRef.current;
    const hls = new Hls({
      maxBufferLength: 10, // Increase buffer length to 10 seconds for more stability
      maxBufferSize: 100 * 1024, // 100 KB buffer size
      maxMaxBufferLength: 15, // Max buffer length increased to 15 seconds
      lowLatencyMode: true, // Keep low-latency mode enabled
      liveSyncDuration: 2, // Allow a small sync duration to avoid jumps
      liveMaxLatencyDuration: 3, // Max latency before jumping ahead
      levelLoadingMaxRetry: 3, // Retry loading on failure
    });

    const hlsStreamUrl = "http://localhost:5000/stream.m3u8"; // Ensure this is correct

    const handleHlsError = (data) => {
      console.error("HLS error:", data);

      // If media error is fatal, reload the stream instead of the page
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.error("A network error occurred, trying to reload...");
            setTimeout(() => {
              hls.loadSource(hlsStreamUrl);
              hls.attachMedia(video);
            }, 3000); // Retry after 3 seconds
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error("Media error, attempting to recover...");
            hls.recoverMediaError(); // Try to recover from media errors
            break;
          default:
            hls.destroy();
            break;
        }
      }
    };

    hls.loadSource(hlsStreamUrl);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      console.log("HLS manifest parsed. Starting playback...");
      video.play();
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      handleHlsError(data);
    });

    // Cleanup function to destroy HLS instance on component unmount
    return () => {
      hls.destroy();
      socket.current.disconnect(); // Disconnect the Socket.IO client
    };
  }, [isRetrying]);

  return (
    <div>
      <h2>Live Stream</h2>
      <video ref={videoRef} width="540" height="260" controls muted loop>
        Your browser does not support the video tag.
      </video>
      <div>
        <h3>Real-Time Update from Server</h3>
        <p>{serverMessage}</p>
      </div>
      {isRetrying && <p>Attempting to recover stream...</p>}{" "}
      {/* Display a retry message */}
    </div>
  );
};

export default RealTime;
