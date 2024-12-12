import React, { useEffect, useState } from "react";
import axios from "axios";

import config from '../../config'; 
const CameraManager = ({ selectedCameraId, setSelectedCameraId }) => {
  const [cameras, setCameras] = useState([]);
  const apiUrl = config.API_URL;

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const response = await axios.get(`${apiUrl}/intersections/get_cameras`);
        setCameras(response.data);
      } catch (error) {
        console.error("Error fetching cameras:", error);
      }
    };

    fetchCameras();
  }, []);

  const handleCameraSelect = (e) => {
    setSelectedCameraId(e.target.value);
  };

  //   const startCounting = async () => {
  //     if (selectedCameraId) {
  //       try {
  //         const response = await axios.get(
  //           `${apiUrl}/videos/start_counting/${selectedCameraId}`
  //         );
  //         console.log(response.data.message); // Display success message
  //       } catch (error) {
  //         console.error("Error starting counting:", error);
  //       }
  //     } else {
  //       alert("Please select a camera first.");
  //     }
  //   };

  //   const startHLS = async () => {
  //     if (selectedCameraId) {
  //       try {
  //         const response = await axios.post(
  //           `${apiUrl}/videos/start_hls/${selectedCameraId}`
  //         );
  //         console.log(response.data.message); // Display success message
  //       } catch (error) {
  //         console.error("Error starting HLS:", error);
  //       }
  //     } else {
  //       alert("Please select a camera first.");
  //     }
  //   };

  return (
    <div>
      <h2>Select a Camera</h2>
      {cameras && cameras.length > 0 ? (
        <div className="form-floating">
          <select
            className="form-select"
            id="floatingSelect"
            value={selectedCameraId || ""}
            onChange={handleCameraSelect}
          >
            <option value="">
              Select a camera
            </option>
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.name} (Active:{" "}
                {camera.status === "active" ? "Yes" : "No"})
              </option>
            ))}
          </select>
          <label htmlFor="floatingSelect">Camera</label>
        </div>
      ) : null}
      {/* <div>
        <button onClick={startCounting}>Start Counting</button>
        <button onClick={startHLS}>Start HLS Stream</button>
      </div> */}
    </div>
  );
};

export default CameraManager;
