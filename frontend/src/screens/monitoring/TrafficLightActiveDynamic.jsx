import React, { useEffect, useState } from "react";
import axios from "axios";

function TrafficLightActiveDynamic() {
  const api = "http://localhost:5000";
  const [comPort, setComPort] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [trafficLightSetting, setTrafficLightSetting] = useState([]);
  const fetchTrafficLightSetting = async () => {
    const response = await axios.get(`${api}/pyduino/get_trafficLight`);
    setTrafficLightSetting(response.data);
  };

  const [videos, setVideos] = useState([]);
  const fetchVideos = async (cameraId) => {
    const response = await axios.get(`${api}/pyduino/get_videos`);
    setVideos(response.data);

    // Filter the videos by the specified camera ID
    const filteredVideos = response.data.filter(video => video.camera_id === cameraId);

    // Get the latest video for the specified camera
    if (filteredVideos.length > 0) {
      const latestVideo = filteredVideos[filteredVideos.length - 1];
      const latestOutCounts = latestVideo.out_counts;
      // const latestInCounts = latestVideo.in_counts;

      // Set the timer to the latest in_counts
      handleSetGreenTimer(latestOutCounts);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await axios.get(
        `${api}/pyduino/initialize-serial?com=${comPort}`
      );
      setStatusMessage(response.data.message);
    } catch (error) {
      setStatusMessage(
        error.response ? error.response.data.message : "Connection error"
      );
    }
  };

  const handleSendGo = async () => {
    try {
      const response = await axios.post(`${api}/pyduino/send-go`);
      setStatusMessage(response.data.message);
    } catch (error) {
      setStatusMessage(
        error.response ? error.response.data.message : "Failed to send command"
      );
    }
  };

  const handleSendStop = async () => {
    try {
      const response = await axios.post(`${api}/pyduino/send-stop`);
      setStatusMessage(response.data.message);
    } catch (error) {
      setStatusMessage(
        error.response ? error.response.data.message : "Failed to send command"
      );
    }
  };

  const handleSetGreenTimer = async (timer) => {
    try {
      const response = await axios.post(`${api}/pyduino/set-green-timer-dynamic`, {
        timer: timer,
      });
      setStatusMessage(response.data.message || response.data.error);
    } catch (error) {
      setStatusMessage(
        error.response ? error.response.data.message : "Failed to set timer"
      );
    }
  };

  useEffect(() => {
    fetchTrafficLightSetting();
    fetchVideos(15);  // Fetch latest video for camera ID 1
    document.title = "ATLS | Arduino Control";
  }, []);

  return (
    <>
      <div>
        <h1>Traffic Light Control</h1>

        <input
          type="text"
          placeholder="Enter COM Port (e.g., 3)"
          value={comPort}
          onChange={(e) => setComPort(e.target.value)}
        />
        <button onClick={handleConnect}>Connect to Serial</button>

        <div>
          <button onClick={handleSendGo}>Send 'Go'</button>
          <button onClick={handleSendStop}>Send 'Stop'</button>
        </div>

        <p>{statusMessage}</p>
      </div>

      <div>
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Camera ID</th>
              <th>In Counts</th>
              <th>Out Counts</th>
              <th>Filename</th>
            </tr>
          </thead>
          <tbody>
            {videos.length > 0 ? (
              videos.map((video) => (
                <tr key={video.id}>
                  <td>{video.camera_id}</td>
                  <td>{video.in_counts}</td>
                  <td>{video.out_counts}</td>
                  <td>{video.filename}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No Traffic Data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default TrafficLightActiveDynamic;