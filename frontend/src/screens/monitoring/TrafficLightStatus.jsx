import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TrafficLight from "./TrafficLight";
import LogoutModal from "../LogoutModal";
import SideNavbar from "../SideNavbar";
import "./CCTVMonitoring.css";
import config from "../../config";

const TrafficLightStatus = () => {
  const apiUrl = config.API_URL;
  // State variables
  const [selectedFiles, setSelectedFiles] = useState([null, null, null, null]);
  const [processedVideoUrls, setProcessedVideoUrls] = useState([
    null,
    null,
    null,
    null,
  ]);
  const [errorMessages, setErrorMessages] = useState([null, null, null, null]);
  const [counts, setCounts] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [countdowns, setCountdowns] = useState([null, null, null, null]);
  const [sortedTimers, setSortedTimers] = useState([]);
  const [allVideosUploaded, setAllVideosUploaded] = useState(false);
  const [uploading, setUploading] = useState(false); // New state variable
  const [uploadProgress, setUploadProgress] = useState(0); // State variable to store upload progress
  const [active, setActive] = useState("trafficLightStatus");
  const [vidSrc, setVidSrc] = useState([]);
  const [selected, setSelected] = useState([]);
  // Effect to calculate sorted timers whenever counts change
  const navigate = useNavigate();
  useEffect(() => {
    const timers = Object.values(counts).map((count) => count.in_counts * 3);
    const sorted = timers.slice().sort((a, b) => b - a);
    setSortedTimers(sorted);
  }, [counts]);

  // Fetch Datas
  useEffect(() => {
    document.title = "ATLS | Traffic Light Status";
    fetchWeekPlan();
    fetchTrafficLightSetting();
    fetchVideo();
    return () => {
      // Cleanup, if necessary
    };
  }, []);
  // Effect to check if all videos are uploaded and sorted timers are available
  useEffect(() => {
    if (
      sortedTimers.length > 0 &&
      processedVideoUrls.every((url) => url !== null)
    ) {
      setAllVideosUploaded(true);
    }
  }, [sortedTimers, processedVideoUrls]);

  // Effect to start timers once all videos are uploaded and sorted timers are available
  useEffect(() => {
    if (allVideosUploaded && sortedTimers.length > 0) {
      const startTimers = async () => {
        // Start each timer based on the sorted order
        for (let i = 0; i < sortedTimers.length; i++) {
          const timer = sortedTimers[i];
          const index = Object.keys(counts).find(
            (key) => counts[key].in_counts * 3 === timer
          );
          if (index !== undefined) {
            const timerValue = counts[index].in_counts * 3; // Get the timer value for the current lane
            setCountdowns((prevCountdowns) => {
              const newCountdowns = [...prevCountdowns];
              newCountdowns[index] = { value: timerValue, slow: false }; // Initialize the countdown value
              return newCountdowns;
            });
            await new Promise((resolve) => {
              const intervalId = setInterval(() => {
                setCountdowns((prevCountdowns) => {
                  const newCountdowns = [...prevCountdowns];
                  if (newCountdowns[index] && newCountdowns[index].value > 0) {
                    newCountdowns[index] = {
                      ...newCountdowns[index],
                      value: newCountdowns[index].value - 1,
                    };
                  } else if (
                    newCountdowns[index] &&
                    newCountdowns[index].value === 0 &&
                    !newCountdowns[index].slow
                  ) {
                    newCountdowns[index] = {
                      ...newCountdowns[index],
                      slow: true,
                      value: 5,
                    };
                  } else {
                    clearInterval(intervalId);
                    resolve(); // Resolve the promise to move to the next timer
                  }
                  return newCountdowns;
                });
              }, 1000);
            });
          }
        }
      };

      startTimers();
    }
  }, [allVideosUploaded, sortedTimers, counts]);

  // Function to handle file change
  const handleFileChange = (index, event) => {
    const files = event.target.files;
    const newSelectedFiles = [...selectedFiles];
    newSelectedFiles[index] = files[0];
    setSelectedFiles(newSelectedFiles);
  };

  // Function to handle upload
  const handleUpload = async (index) => {
    setUploading(true); // Set uploading to true
    try {
      const formData = new FormData();
      formData.append("video_file", selectedFiles[index]);

      const response = await axios.post(
        `${apiUrl}/videos/video_feed`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "json",
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress); // Update upload progress
          },
        }
      );
      const { in_counts, out_counts, video_file, video_id } = response.data;

      // Update counts state
      setCounts((prevCounts) => ({
        ...prevCounts,
        [index]: { in_counts, out_counts },
      }));

      // Get processed video URL using the video_id
      const processedVideoResponse = await axios.get(
        `${apiUrl}/videos/processed_video/${video_id}`, // Pass the video_id here
        {
          responseType: "blob",
        }
      );
      const processedVideoBlob = new Blob([processedVideoResponse.data], {
        type: "video/mp4",
      });
      const processedVideoUrl = URL.createObjectURL(processedVideoBlob);

      // Update processed video URLs state
      const newProcessedVideoUrls = [...processedVideoUrls];
      newProcessedVideoUrls[index] = processedVideoUrl;
      setProcessedVideoUrls(newProcessedVideoUrls);

      // Set initial countdown for the lane
      const newCountdowns = [...countdowns];
      newCountdowns[index] = { value: in_counts * 3, slow: false };
      setCountdowns(newCountdowns);

      // Clear any previous error messages
      setErrorMessages((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[index] = null;
        return newErrors;
      });
      fetchVideo();
    } catch (error) {
      // Handle upload and processing error
      setErrorMessages((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[index] = "Failed to upload and process video.";
        return newErrors;
      });

      console.error("Error uploading and processing video:", error);

      // Clear error message after 2 seconds
      setTimeout(() => {
        setErrorMessages((prevErrors) => {
          const newErrors = [...prevErrors];
          newErrors[index] = null;
          return newErrors;
        });
      }, 2000);
    } finally {
      // Set uploading back to false and reset upload progress
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Function to handle lane deletion
  const handleDelete = (index) => {
    const newSelectedFiles = [...selectedFiles];
    newSelectedFiles[index] = null;
    setSelectedFiles(newSelectedFiles);

    const newProcessedVideoUrls = [...processedVideoUrls];
    newProcessedVideoUrls[index] = null;
    setProcessedVideoUrls(newProcessedVideoUrls);

    const newCountdowns = [...countdowns];
    newCountdowns[index] = null;
    setCountdowns(newCountdowns);
  };
  const logout = () => {
    sessionStorage.clear();
    navigate("/");
  };
  // For underline of current screen in in the navbar
  const handleClick = (event, item) => {
    event.preventDefault();
    setActive(item);
    if (item === "dashboard") {
      navigate("/dashboard");
    }
    if (item === "accounts") {
      navigate("/accounts");
    }
    if (item === "weekPlanSetting") {
      navigate("/weekPlanSetting");
    }
    if (item === "cctvMonitoring") {
      navigate("/cctvMonitoring");
    }
    if (item === "violationRecord") {
      navigate("/violationRecord");
    }
  };

  // NEW ADDED CODES
  const [weekPlan, setWeekPlan] = useState([]);
  const fetchWeekPlan = async () => {
    const response = await axios.get(`${apiUrl}/weekPlan/get_weekPlan`);
    setWeekPlan(response.data);
  };
  const [trafficLightSettings, setTrafficLightSettings] = useState([]);
  const fetchTrafficLightSetting = async () => {
    const response = await axios.get(`${apiUrl}/weekPlan/get_trafficLight`);
    setTrafficLightSettings(response.data);
  };
  const groupedByDay = trafficLightSettings.reduce((acc, light) => {
    // Create an array for each day if it doesn't exist
    if (!acc[light.day]) {
      acc[light.day] = [];
    }
    // Push the light setting into the appropriate day array
    acc[light.day].push(light);
    return acc;
  }, {});

  // Video Upload for vehicle counting
  const fetchVideo = async () => {
    const response = await axios.get(`${apiUrl}/videos/get_videos`);
    setVidSrc(response.data);
    console.log(response.data);
  };
  // DELETE IMAGE
  const deleteVideo = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.delete(
        `${apiUrl}/videos/delete_video/${id}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      fetchVideo();
      setShowMessage(true);
      setSuccess(response.data.msg);
      setTimeout(() => {
        setShowMessage(false);
        setSuccess(null);
      }, 3000);
    } catch (error) {
      showMessage(true);
      setError(error.reponse?.data?.error);
      setTimeout(() => {
        showMessage(false);
        setError(null);
      }, 3000);
    }
  };

  return (
    <>
      <div className="container-fluid  vh-100 vw-100">
        <div className="row">
          <SideNavbar handleClick={handleClick} active={active} />

          <div className="col-10 col-md-10 p-4">
            <h6 className="p-3">
              <span className="text-secondary">Pages</span> / Traffic Light Status
            </h6>
            <div className="row monitoringContainer">
              {/* Lane selection and upload section */}
              <div className="d-flex align-items-center justify-content-center">
                <select
                  onChange={(event) =>
                    setSelectedIndex(parseInt(event.target.value))
                  }
                >
                  <option value="">Select Lane</option>
                  {[0, 1, 2, 3].map((index) => (
                    <option key={index} value={index}>
                      Lane {index + 1}
                    </option>
                  ))}
                </select>
                {selectedIndex !== null &&
                  !processedVideoUrls[selectedIndex] && (
                    <>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(event) =>
                          handleFileChange(selectedIndex, event)
                        }
                      />
                      {uploading && (
                        <div
                          className="progress mt-2"
                          style={{ width: "100px" }}
                        >
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${uploadProgress}%` }}
                            aria-valuenow={uploadProgress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          >
                            upload {uploadProgress}%
                          </div>
                        </div>
                      )}
                      <button
                        className="btn btn-success"
                        onClick={() => handleUpload(selectedIndex)}
                        disabled={uploading}
                      >
                        {uploading ? "Processing..." : "Upload & Process"}
                      </button>
                    </>
                  )}
              </div>
              <div className="weekPlanContainer">
                {weekPlan && weekPlan.length > 0 ? (
                  weekPlan.map((road) => (
                    <TrafficLight
                      key={road.week_plan_id}
                      groupedByDay={groupedByDay}
                      road={road}
                      apiUrl={apiUrl}
                      trafficLightSettings={trafficLightSettings}
                    />
                  ))
                ) : (
                  <p>No weekPlan available.</p>
                )}
              </div>
              <div>
                {vidSrc && vidSrc.length > 0 ? (
                  vidSrc.map((src, index) => (
                    <div>
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                          <th>No.</th>
                          <th>In Counts</th>
                          <th>Out Counts</th>
                          <th>Video</th>
                          <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{src.in_counts}</td>
                            <td>{src.out_counts}</td>
                            <td>
                              <video
                                width="540"
                                height="260"
                                autoPlay
                                loop
                                muted
                              >
                                <source src={src.filename} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            </td>
                            <td>
                              <button
                                className="btn btn-outline-danger bi bi-trash"
                                onClick={() => deleteVideo(src.id)}
                              ></button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ))
                ) : (
                  <i>No video</i>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <LogoutModal logout={logout} />
    </>
  );
};

export default TrafficLightStatus;
