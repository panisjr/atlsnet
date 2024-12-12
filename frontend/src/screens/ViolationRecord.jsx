import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SideNavbar from "./SideNavbar";
import "./css/Violation.css";

import config from "../config";
import LogoutModal from "./LogoutModal";
const ViolationRecord = () => {
  const apiUrl = config.API_URL;
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [active, setActive] = useState("violationRecord");

  // FOR OCR
  const [file, setFile] = useState(null);
  const [imgSrc, setImgSrc] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState([]);

  // FOR UPLOAD VIDEO
  const [countdowns, setCountdowns] = useState([null, null, null, null]);
  const [sortedTimers, setSortedTimers] = useState([]);
  const [allVideosUploaded, setAllVideosUploaded] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([null, null, null, null]);
  const [processedVideoUrls, setProcessedVideoUrls] = useState([
    null,
    null,
    null,
    null,
  ]);
  const [errorMessages, setErrorMessages] = useState([null, null, null, null]);
  const [counts, setCounts] = useState({});
  const [vidSrc, setVidSrc] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [uploading, setUploading] = useState(false); // New state variable
  const [uploadProgress, setUploadProgress] = useState(0); // State variable to store upload progress

  // THIS IS FOR OCR
  const handleFileChangeOCR = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${apiUrl}/ocr/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Handle the response from the Flask backend
      fetchImages();
      handleFileChange(null);
      setExtractedText(response.data.extracted_text);
      setImgSrc(response.data.img_src);
      setShowMessage(true);
      setSuccess(response.data.message);
      setTimeout(() => {
        setShowMessage(false);
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("Error uploading the file:", error);
      setError("An error occurred while uploading the file.");
    }
  };
  // DELETE IMAGE
  const deleteImage = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.delete(`${apiUrl}/ocr/delete_image/${id}`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      fetchImages();
      setShowMessage(true);
      setSuccess(response.data.message);
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
  // END FOR OCR
  // To navigate screens
  const navigate = useNavigate();
  const fetchImages = async () => {
    try {
      const response = await axios.get(`${apiUrl}/ocr/images`); // Adjust the URL as needed

      setImages(response.data);
    } catch (error) {
      console.error("Error fetching images", error);
    }
  };
  useEffect(() => {
    fetchImages();
    fetchVideo();
    document.title = "ATLS | Violation Records";
    console.log(images);
  }, []);

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
    if (item === "cctvMonitoring") {
      navigate("/cctvMonitoring");
    }
    if (item === "trafficLightStatus") {
      navigate("/trafficLightStatus");
    }
    if (item === "accounts") {
      navigate("/accounts");
    }
    if (item === "weekPlanSetting") {
      navigate("/weekPlanSetting");
    }
  };

  // =================== Upload video to Process Vehicle Detection and Counting ===========
  useEffect(() => {
    const timers = Object.values(counts).map((count) => count.in_counts * 3);
    const sorted = timers.slice().sort((a, b) => b - a);
    setSortedTimers(sorted);
  }, [counts]);
  // Video Upload for vehicle counting
  const fetchVideo = async () => {
    const response = await axios.get(`${apiUrl}/videos/get_videos`);
    setVidSrc(response.data);
    console.log(response.data);
  };
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
      const { in_counts, out_counts, video_file } = response.data;

      // Update counts state
      setCounts((prevCounts) => ({
        ...prevCounts,
        [index]: { in_counts, out_counts },
      }));

      // Get processed video URL
      const processedVideoResponse = await axios.get(
        `${apiUrl}/videos/processed_video`,
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
      <div className="container-fluid vw-100 vh-100">
        <div className="row">
          <SideNavbar active={active} handleClick={handleClick} />

          <div className="col-10 accountManagementContainer">
            <div className="row d-flex align-items-center justify-content-start">
              <div className="col-12">
                <div className="row">
                  <div className="col-5">
                    <h6 className="p-3">Violation Records</h6>
                    <button
                      className="btn btn-outline-dark"
                      data-bs-toggle="modal"
                      data-bs-target="#createAccountStaticBackdrop"
                    >
                      <i className="bi bi-person-plus"></i>
                    </button>
                    <h5>Upload new File</h5>
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                      <input
                        type="file"
                        name="file"
                        onChange={handleFileChangeOCR}
                      />
                      <input type="submit" value="Upload" />
                    </form>
                  </div>
                  <div className="col-5">
                    <h5>Result:</h5>
                    {imgSrc && (
                      <img
                        src={imgSrc}
                        alt="Uploaded file"
                        style={{ maxWidth: "100%", height: "auto" }}
                      />
                    )}
                    {extractedText ? (
                      <p>
                        The extracted text from the image above is:{" "}
                        <b>{extractedText}</b>
                      </p>
                    ) : (
                      <p>The extracted text will be displayed here</p>
                    )}
                  </div>
                </div>
              </div>
              <div
                className="col-12"
                style={{ height: "291px", width: "100%", overflowY: "auto" }}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <table className="table table-striped table-rounded">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Plate No.</th>
                        <th>Date</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {images && images.length > 0 ? (
                        images.map((src, index) => (
                          <tr key={index}>
                            <td>
                              {" "}
                              <img
                                src={src.filename}
                                alt={`Uploaded ${index}`}
                                style={{
                                  maxWidth: "20%",
                                  height: "auto",
                                  margin: "5px",
                                }}
                              />
                            </td>
                            <td>
                              <h5>{src.extracted_text}</h5>
                            </td>
                            <td>
                              <h5>{src.uploaded_at}</h5>
                            </td>
                            <td>
                              <button
                                className="btn btn-outline-danger bi bi-trash"
                                data-bs-toggle="modal"
                                data-bs-target="#deleteBackdrop"
                                onClick={() => setSelected(src)}
                              ></button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center">
                            <i className="d-flex align-items-center justify-content-end">
                              No violation found...
                            </i>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="col-12">
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
                <div className="uploadVideoContainer">
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
                      {vidSrc && vidSrc.length > 0 ? (
                        vidSrc.map((src, index) => (
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
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center">
                            <i>No video</i>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

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
      {/* Logout Modal */}
      <LogoutModal logout={logout} />
      {/* Delete  Modal */}
      <div
        className="modal fade"
        id="deleteBackdrop"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header d-flex align-items-center justify-content-center">
              <div className="warningLogo"></div>
              <div>
                <h4 className="ms-4 mt-3">
                  <strong>DELETE CONFIRMATION</strong>
                </h4>
                <p className="ms-4">This action cannot be undone.</p>
              </div>
            </div>
            {selected ? (
              <div className="modal-body">
                <p>Are you sure you want to delete this?</p>
                <div>
                  <input
                    type="text"
                    className="form-control mb-2"
                    disabled
                    value={selected.id}
                  />
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteImage(selected.id)}
                      className="btn btn-danger"
                      data-bs-dismiss="modal"
                    >
                      Yes
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default ViolationRecord;
