import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import WeekPlanTable from "./WeekPlanTable"; // Adjust the path as necessary
import ToastNotification from "../ToastNotification";
import LogoutModal from "../LogoutModal";
import "./WeekPlanSetting.css";
import SideNavbar from "../SideNavbar";
import CameraManager from "../monitoring/CameraManager";
import IntersectionModals from "./IntersectionModals";
import config from '../../config'; 
const WeekPlanSetting = () => {
  const apiUrl = config.API_URL;
  // Search bar
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredIntersection, setFilteredIntersection] = useState([]);

  // This is for creating intersection
  const [intersection, setIntersection] = useState([]);
  const [newIntersection, setNewIntersection] = useState("");
  // This is for creating week plan for the intersection
  const [weekPlan, setWeekPlan] = useState([]);
  const [trafficLightSetting, setTrafficLightSetting] = useState([]);
  const [selectedIntersection, setSelectedIntersection] = useState("");
  const [selectedWeekPlan, setSelectedWeekPlan] = useState({
    intersection_id: "",
    intersection_name: "",
  });
  const [selected, setSelected] = useState({
    id: "",
    road_name: "",
    traffic_light_timer: "",
    traffic_light_name: "",
    traffic_light_id: "",
    intersection_id: "",
    camera_id: "",
    intersection_name: "",
    day: "",
    traffic_mode: "", //System Mode static or dynamic
    startTime: "", //Start time
    endTime: "",
    timer: "",
    time: "",
  });

  // For RTSP
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [camera_ip, setCameraIP] = useState("");
  const [port, setPort] = useState("");
  const [stream, setStream] = useState("");

  // DISPLAY MESSAGE
  const [showMessage, setShowMessage] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [active, setActive] = useState("weekPlanSetting");
  // To navigate screens
  const navigate = useNavigate();
  // To fetch the data
  useEffect(() => {
    fetchWeekPlan();
    fetchIntersection();
    fetchTrafficLightSetting();
    fetchCameras();
    setSelectedWeekPlan("");
    document.title = "ATLS | Week Plan Setting";
  }, []);
  // START OF INTERSECTION
  const fetchIntersection = async () => {
    const response = await axios.get(`${apiUrl}/intersections/get_intersections`);
    setIntersection(response.data);
    setFilteredIntersection(response.data);
  };
  const handleAddIntersection = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        `${apiUrl}/intersections/add_intersections`,
        {
          newIntersection,
        }
      );
      setNewIntersection("");
      setShowMessage(true);
      setSuccess(response.data.message);
      fetchIntersection(); // Refresh the list after adding
      setTimeout(() => {
        setShowMessage(false);
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setSelected(null);
      setShowMessage(true);
      setError(error.response?.data?.error);
      setTimeout(() => {
        setShowMessage(false);
        setError(null);
      }, 3000);
    }
  };
  const editIntersection = async (id) => {
    try {
      console.log(id);

      const token = sessionStorage.getItem("token");

      const response = await axios.put(
        `${apiUrl}/intersections/update_intersections/${id}`,
        { intersection_name: selected.intersection_name },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      setShowMessage(true);
      setSuccess(response.data.message);
      fetchIntersection(); // Refresh the list after editing
      fetchWeekPlan();
      setTimeout(() => {
        setShowMessage(false);
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setShowMessage(true);
      setError(error.response?.data?.error);
      setTimeout(() => {
        setShowMessage(false);
        setError(null);
      }, 3000);
    }
  };
  // DELETE INTERSECTION
  const deleteIntersection = async (id) => {
    console.log(id);
    try {
      const token = sessionStorage.getItem("token"); // Ensure this key matches the one used when storing the token

      const response = await axios.delete(
        `${apiUrl}/intersections/delete_intersection/${id}`,
        {
          headers: {
            Authorization: `${token}`, // Ensure the token is prefixed with "Bearer " if your backend expects it
          },
        }
      );
      setShowMessage(true);
      setSuccess(response.data.message);
      fetchIntersection(); // Refresh the list after deletion
      fetchTrafficLightSetting(); // Refresh the list after deletion
      clearForm();
      setTimeout(() => {
        setShowMessage(false);
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setShowMessage(true);
      setError(error.response?.data?.error);
      setTimeout(() => {
        setShowMessage(false);
        setError(null);
      }, 3000);
    }
  };
  // END OF INTERSECTION
  // START OF WEEK PLAN
  // GET WEEK PLAN
  const fetchWeekPlan = async () => {
    const response = await axios.get(`${apiUrl}/weekPlan/get_weekPlan`);
    setWeekPlan(response.data);
    console.log(response.data);
  };
  const fetchTrafficLightSetting = async () => {
    const response = await axios.get(`${apiUrl}/weekPlan/get_trafficLight`);
    setTrafficLightSetting(response.data);
  };
  // ADD WEEK PLAN
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const handleAddWeekPlan = async (id) => {
    try {
      let newTime;
      let trafficMode = selected.traffic_mode;
      if (trafficMode == "Static") {
        newTime = `${selected.startTime} - ${selected.endTime} : ${selected.timer}`;
      }
      if (trafficMode == "Dynamic") {
        newTime = `${selected.startTime} - ${selected.endTime}`;
      }
      const setTrafficMode = `${selected.traffic_mode}`;

      const dataToSend = {
        ...selected,
        selected_intersection: selectedIntersection,
        day: selected.day,
        traffic_light_name: selected.traffic_light_name,
        time: newTime,
        traffic_mode: setTrafficMode,
        selectedCameraId: selectedCameraId,
      };
      const response = await axios.post(
        `${apiUrl}/weekPlan/add_weekPlan/${id}`,
        dataToSend
      );
      setShowMessage(true);
      setSuccess(response.data.message);
      fetchWeekPlan();
      fetchTrafficLightSetting();
      clearForm();
      setTimeout(() => {
        setShowMessage(false);
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setShowMessage(true);
      setError(error.response?.data?.error);
      clearForm();
      setTimeout(() => {
        setShowMessage(false);
        setError(null);
      }, 3000);
    }
  };
  // DELETE WEEK PLAN
  const deleteWeekPlan = async (id) => {
    try {
      const token = sessionStorage.getItem("token"); // Ensure this key matches the one used when storing the token

      if (!token) {
        setShowMessage(true);
        setError("Token is missing!");
        setTimeout(() => {
          setShowMessage(false);
          setError(null);
        }, 3000);
      }
      const response = await axios.delete(
        `${apiUrl}/weekPlan/delete_weekPlan/${id}`,
        {
          headers: {
            Authorization: `${token}`, // Ensure the token is prefixed with "Bearer " if your backend expects it
          },
        }
      );
      setShowMessage(true);
      setSuccess(response.data.message);
      fetchWeekPlan(); // Refresh the list after deletion
      fetchIntersection();
      fetchTrafficLightSetting();
      setTimeout(() => {
        setShowMessage(false);
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setSelectedWeekPlan(null);
      setShowMessage(true);
      setError(error.response?.data?.error);
      setTimeout(() => {
        setShowMessage(false);
        setError(null);
      }, 3000);
    }
  };

  const editWeekPlan = async (id) => {
    try {
      console.log(id);
      const token = sessionStorage.getItem("token");

      const response = await axios.put(
        `${apiUrl}/trafficLight/update_trafficLight/${id}`,
        {
          traffic_light_timer: selected.traffic_light_timer,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      setShowMessage(true);
      setSuccess(response.data.message);
      fetchIntersection(); // Refresh the list after editing
      fetchWeekPlan();
      fetchTrafficLightSetting();
      setTimeout(() => {
        setShowMessage(false);
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setShowMessage(true);
      setError(error.response?.data?.error);
      setTimeout(() => {
        setShowMessage(false);
        setError(null);
      }, 3000);
    }
  };

  // END OF WEEK PLAN

  const handleSelectedIntersection = (road) => {
    setSelectedWeekPlan(null);
    setSelected(road);
  };
  const handleSelectedWeekPlan = (road) => {
    setSelected(null);
    setSelectedWeekPlan(road);
  };
  const [found, setFound] = useState(null); // Initialize as null
  const [mode, setMode] = useState(null);
  const handleSelectedCamera = (id, item) => {
    const camera = cameras.find((cam) => cam.id === id);
    if (camera) {
      if (item === "edit") {
        setMode("edit");
        setFound(camera);
        setName(camera.name || "");
        setLocation(camera.location || "");
        // Parse the RTSP URL
        const rtspRegex = /rtsp:\/\/(.*?):(.*?)@(.*?):(\d+)\/(.*)/;
        const match = camera.rtsp_url.match(rtspRegex);

        if (match) {
          const [, user, pass, ip, port, streamPath] = match;

          // Set state variables for editing
          setUsername(user || "");
          setPassword(pass || "");
          setCameraIP(ip || "");
          setPort(port || "");
          setStream(streamPath || "");
        }
      }

      if (item === "delete") {
        setFound(camera); // Set the found camera
        setMode("delete");
      }
    }
    setSelected(null); // Reset selected (if needed)
  };
  const clearCameraForm = () => {
    setMode(null);
    setName("");
    setLocation("");
    setUsername("");
    setPassword("");
    setCameraIP("");
    setPort("");
    setStream("");
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
    if (item === "monitoring") {
      navigate("/monitoring");
    }
    if (item === "accounts") {
      navigate("/accounts");
    }
    if (item === "violationRecord") {
      navigate("/violationRecord");
    }
  };
  // START SETTING TRAFFIC LIGHT TIMER
  // SET TRAFFIC LIGHT
  const setTrafficLight = async (id) => {
    let newTime; // Declare newTime outside the if-else block
    let trafficMode = selected.traffic_mode; // Get the timer mode directly
    if (trafficMode === "Static") {
      newTime = `${selected.startTime} - ${selected.endTime} : ${selected.timer}`;
    } else if (trafficMode === "Dynamic") {
      newTime = `${selected.startTime} - ${selected.endTime}`;
    } else {
      console.error("Invalid timer mode selected.");
      return; // Exit early if the mode is invalid
    }
    const setTrafficMode = `${selected.traffic_mode}`;
    console.log("Traffic Mode: ", setTrafficMode);
    const dataToSend = {
      ...selected, // Spread the existing properties from selected
      time: newTime, // Add the constructed time
      traffic_mode: setTrafficMode,
      selectedCameraId: selectedCameraId,
    };

    try {
      const response = await axios.post(
        `${apiUrl}/weekPlan/set_trafficLight/${id}`,
        dataToSend
      );
      setShowMessage(true);
      setSuccess(response.data.message);
      fetchWeekPlan();
      fetchTrafficLightSetting(); // Clear selected values
      clearForm();
      setTimeout(() => {
        setShowMessage(false);
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setShowMessage(true);
      setError(error.response?.data?.error);
      clearForm();
      setTimeout(() => {
        setShowMessage(false);
        setError(null);
      }, 5000);
    }
  };
  // DELETE TRAFFIC LIGHT
  const deleteTrafficLight = async (id) => {
    try {
      const token = sessionStorage.getItem("token"); // Ensure this key matches the one used when storing the token

      if (!token) {
        setShowMessage(true);
        setError("Token is missing!");
        setTimeout(() => {
          setShowMessage(false);
          setError(null);
        }, 3000);
      }
      const response = await axios.delete(
        `${apiUrl}/trafficLight/delete_trafficLight/${id}`,
        {
          headers: {
            Authorization: `${token}`, // Ensure the token is prefixed with "Bearer " if your backend expects it
          },
        }
      );
      setShowMessage(true);
      setSuccess(response.data.message);
      fetchIntersection(); // Refresh the list after deletion
      fetchTrafficLightSetting(); // Refresh the list after deletion
      setSelected({
        ...selected,
        traffic_light_name: "",
        startTime: "", // Clear start time
        endTime: "", // Clear end time
        timer: "", // Clear timer
        day: "", // Clear day
      });
      setTimeout(() => {
        setShowMessage(false);
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setShowMessage(true);
      setError(error.response?.data?.error);
      setTimeout(() => {
        setShowMessage(false);
        setError(null);
      }, 3000);
    }
  };
  // ADD TRAFFIC LIGHT
  const addTrafficLightTimer = async (id) => {
    try {
      console.log(selectedCameraId);
      let newTime; // Declare newTime outside the if-else block
      let trafficMode = selected.traffic_mode; // Get the timer mode directly
      if (trafficMode === "Static") {
        newTime = `${selected.startTime} - ${selected.endTime} : ${selected.timer}`;
      } else if (trafficMode === "Dynamic") {
        newTime = `${selected.startTime} - ${selected.endTime}`;
      } else {
        console.error("Invalid timer mode selected.");
        return; // Exit early if the mode is invalid
      }
      const setTrafficMode = `${selected.traffic_mode}`;
      console.log("Traffic Mode: ", setTrafficMode);
      const dataToSend = {
        ...selected, // Spread the existing properties from selected
        time: newTime, // Add the constructed time
        traffic_mode: setTrafficMode,
        selectedCameraId: selectedCameraId,
      };

      const response = await axios.post(
        `${apiUrl}/trafficLight/add_trafficLight/${id}/time`,
        dataToSend
      );
      fetchWeekPlan();
      fetchTrafficLightSetting();
      clearForm();
      setShowMessage(true);
      setSuccess(response.data.message);
      setTimeout(() => {
        setShowMessage(false);
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setShowMessage(true);
      setError(error.response?.data?.error);
      setTimeout(() => {
        setShowMessage(false);
        setError(null);
      }, 3000);
      // Handle error (e.g., show a toast notification)
    }
  };
  // UPDATE TRAFFIC LIGHT
  const updateTimeAtIndex = (index, updatedTime) => {
    // Split the traffic_light_timer by ";"
    const updatedTimers = selected.traffic_light_timer
      .split(";")
      .map((time, i) => {
        // If it's the index we are editing, return the updated time, otherwise keep it the same
        return i === index ? updatedTime : time.trim();
      });

    // Join the updated timers back and update the selected state
    setSelected((prevSelected) => ({
      ...prevSelected,
      traffic_light_timer: updatedTimers.join("; "),
    }));
  };
  const groupedByDay = trafficLightSetting.reduce((acc, light) => {
    // Create an array for each day if it doesn't exist
    if (!acc[light.day]) {
      acc[light.day] = [];
    }
    // Push the light setting into the appropriate day array
    acc[light.day].push(light);
    return acc;
  }, {});

  const dayOrder = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };

  // Sort the days by the predefined order (Monday to Sunday)
  const sortedDays = Object.keys(groupedByDay)
    .sort((a, b) => dayOrder[a] - dayOrder[b])
    .map((day) => ({
      day,
      lights: groupedByDay[day],
    }));
  // END OF SETTING TRAFFIC LIGHT TIMER
  // =========================== Start of Camera
  const [cameras, setCameras] = useState([]);
  const fetchCameras = async () => {
    const response = await axios.get(`${apiUrl}/intersections/get_cameras`);
    setCameras(response.data);
  };
  const addCamera = async () => {
    try {
      const rtsp_url = `rtsp://${username}:${password}@${camera_ip}:${port}/${stream}`;
      const response = await axios.post(`${apiUrl}/intersections/add_camera`, {
        name: name,
        rtsp_url: rtsp_url,
        location: location,
      });
      clearCameraForm();
      fetchCameras();
      setShowMessage(true);
      setSuccess(response.data.message);
      setTimeout(() => {
        setShowMessage(false);
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setShowMessage(true);
      setError(error.response?.data?.error);
      setTimeout(() => {
        setShowMessage(false);
        setError(null);
      }, 3000);
    }
  };
  const deleteCamera = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.delete(
        `${apiUrl}/intersections/delete_camera/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Ensure the token is prefixed with "Bearer " if your backend expects it
          },
        }
      );
      setShowMessage(true);
      fetchCameras();
      clearCameraForm();
      setSuccess(response.data.message);
      setTimeout(() => {
        setShowMessage(false);
        setSuccess(null);
      }, 3000);
      fetchCameras();
    } catch (error) {
      setShowMessage(true);
      setError(error.response?.data?.error);
      setTimeout(() => {
        setShowMessage(false);
        setError(null);
      }, 3000);
    }
  };
  const editCamera = async (id) => {
    console.log("id: ", id);
    try {
      const rtsp_url = `rtsp://${username}:${password}@${camera_ip}:${port}/${stream}`;
      const token = sessionStorage.getItem("token");
      const response = await axios.put(
        `${apiUrl}/intersections/edit_camera/${id}`,
        {
          name,
          location,
          rtsp_url, // Pass the full RTSP URL
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchCameras();
      clearCameraForm();
      setShowMessage(true);
      setSuccess(response.data.message);
      setTimeout(() => {
        setShowMessage(false);
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setShowMessage(true);
      setError(error.reponse?.data?.error);
      setTimeout(() => {
        setShowMessage(false);
        setError(null);
      }, 3000);
    }
  };
  const clearForm = () => {
    setSelectedCameraId("");
    setSelectedIntersection("");
    setSelectedCameraId("");
    setSelected({
      ...selected,
      traffic_light_name: "",
      startTime: "", // Clear start time
      endTime: "", // Clear end time
      timer: "", // Clear timer
      day: "", // Clear day
      traffic_mode: "",
    });
  };
  // Handle intersection search
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    console.log(searchQuery);
    console.log(filteredIntersection);
    // Filter intersections based on the search query
    const filtered = intersection.filter((name) =>
      `${name.intersection_name.toLowerCase()} ${name.id}`.includes(query)
    );

    setFilteredIntersection(filtered);
  };
  return (
    <>
      <div className="container-fluid vw-100 vh-100">
        <div className="row">
          <SideNavbar active={active} handleClick={handleClick} />

          <div className="col-10 col-md-10 p-4">
            <h6 className="p-3">
              <span className="text-secondary">Pages</span> / Week Plan
            </h6>
            <div class="row weekPlanContainer p-2">
              <div className="d-flex align-items-center justify-content-between">
                <div
                  class="weekplan-button-container nav nav-pills"
                  id="v-pills-tab"
                  role="tablist"
                  aria-orientation="vertical"
                >
                  <p
                    class="weekPlan-button active"
                    id="v-pills-intersection-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#v-pills-intersection"
                    type="button"
                    role="tab"
                    aria-controls="v-pills-intersection"
                    aria-selected="true"
                  >
                    Intersection Setting
                  </p>
                  <p
                    class="weekPlan-button"
                    id="v-pills-weekPlan-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#v-pills-weekPlan"
                    type="button"
                    role="tab"
                    aria-controls="v-pills-weekPlan"
                    aria-selected="false"
                  >
                    Week Plan Setting
                  </p>
                </div>
              </div>
              {/* Side Bar */}
              <div class="tab-content pt-4 vw-100" id="v-pills-tabContent">
                {/* Intersection Tab */}
                <div
                  class="tab-pane fade show active"
                  id="v-pills-intersection"
                  role="tabpanel"
                  aria-labelledby="v-pills-intersection-tab"
                  tabindex="0"
                >
                  <div className="add-intersection-container row">
                    <div className="col-4 add-intersection-form">
                      <form onSubmit={handleAddIntersection}>
                        <div>
                          <label
                            className="fw-semibold mb-3"
                            htmlFor="newIntersection"
                          >
                            Add new intersection
                          </label>
                          <input
                            type="text"
                            className="form-control mb-2"
                            id="newIntersection"
                            value={newIntersection}
                            onChange={(e) => setNewIntersection(e.target.value)}
                            placeholder="Enter new intersection"
                            required
                          />
                        </div>
                        <button type="submit" className=" btn btn-success">
                          Add Intersection
                        </button>
                      </form>
                    </div>
                    <div className="col-8 intersection-table ">
                      <table className="table table-bordered table-striped">
                        <thead>
                          <th>No.</th>
                          <th>Intersection</th>
                          <th></th>
                        </thead>
                        <tbody>
                          {intersection ? (
                            intersection.map((intersection, i) => (
                              <tr key={i}>
                                <td>{i + 1}</td>
                                <td>{intersection.intersection_name}</td>
                                <td className="d-flex align-items-center">
                                  <h5
                                    className="bi bi-pencil btn btn-outline-warning me-2"
                                    data-bs-toggle="modal"
                                    data-bs-target="#editBackdrop"
                                    onClick={() =>
                                      handleSelectedIntersection(intersection)
                                    }
                                  ></h5>
                                  <h5
                                    className="bi bi-trash btn btn-danger"
                                    data-bs-toggle="modal"
                                    data-bs-target="#deleteBackdrop"
                                    onClick={() =>
                                      handleSelectedIntersection(intersection)
                                    }
                                  ></h5>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <i>No intersection</i>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="camera-container row">
                    <div className="add-camera-form">
                      <form>
                        <p className="fw-semibold">Add RTSP URL</p>
                        {/* Custom Camera Name and Location */}
                        <div className="d-flex justify-content-around mb-2">
                          <div className="col-md-6 form-floating">
                            <input
                              required
                              className="form-control form-control-sm"
                              type="text"
                              name="name"
                              id="cameraName"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Name"
                            />
                            <label for="cameraName">
                              {" "}
                              <i>Custom Camera Name</i>
                            </label>
                          </div>
                          <div className="form-floating">
                            <select
                              className="form-select form-select-sm"
                              id="floatingSelect"
                              aria-label="Floating label select example"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              required
                            >
                              <option value="" disabled selected>
                                Select Location
                              </option>
                              {intersection.map((intersection) => (
                                <option
                                  key={intersection.id}
                                  value={intersection.intersection_name}
                                >
                                  {intersection.intersection_name}
                                </option>
                              ))}
                            </select>
                            <label htmlFor="floatingSelect">Location</label>
                          </div>
                        </div>
                        {/* Username , Password, Camera IP, Stream Name, Port*/}
                        <div className="d-flex justify-content-around mb-2">
                          <div className="col-md-3 form-floating">
                            <input
                              className="form-control form-control-sm"
                              required
                              type="text"
                              id="username"
                              name="username"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              placeholder="Username"
                            />
                            <label for="username">
                              <i>Username</i>
                            </label>
                          </div>
                          <div className="col-md-3 form-floating">
                            <input
                              className="form-control form-control-sm"
                              required
                              id="password"
                              type="text"
                              name="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Password"
                            />
                            <label for="password">
                              <i>Password</i>
                            </label>
                          </div>
                          <div className="col-md-2 form-floating">
                            <input
                              className="form-control form-control-sm"
                              required
                              id="camera_ip"
                              type="text"
                              name="camera_ip"
                              value={camera_ip}
                              onChange={(e) => setCameraIP(e.target.value)}
                              placeholder="Camera IP(192.168.100.25)"
                            />
                            <label for="camera_ip">
                              <i>Camera IP</i>
                            </label>
                          </div>
                          <div className="col-md-2 form-floating">
                            <input
                              className="form-control form-control-sm"
                              required
                              id="port"
                              type="text"
                              name="port"
                              value={port}
                              onChange={(e) => setPort(e.target.value)}
                              placeholder="Port(554)"
                            />
                            <label for="port">
                              <i>Port</i>
                            </label>
                          </div>
                          <div className="col-md-2 form-floating">
                            <input
                              className="form-control form-control-sm"
                              required
                              id="stream"
                              type="text"
                              name="stream"
                              value={stream}
                              onChange={(e) => setStream(e.target.value)}
                              placeholder="Stream Name"
                            />
                            <label for="stream">
                              <i>Stream Path (stream1)</i>
                            </label>
                          </div>
                        </div>
                        {mode === "edit" ? (
                          <div>
                            <button
                              type="button"
                              onClick={clearCameraForm}
                              className="btn btn-secondary me-2"
                            >
                              <i className="bi bi-x me-2"></i>
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => editCamera(found.id)} // Wrap the function call in an arrow function
                              className="btn btn-success"
                            >
                              <i className="bi bi-check me-2"></i>
                              Edit Camera
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={addCamera}
                            className="btn btn-success"
                          >
                            Add Camera
                          </button>
                        )}
                      </form>
                    </div>
                    <div className="camera-table">
                      <table className="table table-bordered table-striped">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Camera Name</th>
                            <th>Location</th>
                            <th>RTSP URL</th>
                            <th>Status</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {cameras && cameras.length > 0 ? (
                            cameras.map((camera) => (
                              <tr key={camera.id}>
                                <td>{camera.id}</td>
                                <td>{camera.name}</td>
                                <td>{camera.location}</td>
                                <td>{camera.rtsp_url}</td>
                                <td>{camera.status}</td>
                                <td>
                                  <i
                                    className="bi bi-pencil btn btn-outline-warning me-2 cursor-pointer"
                                    onClick={() =>
                                      handleSelectedCamera(camera.id, "edit")
                                    }
                                  ></i>
                                  <i
                                    className="bi bi-trash btn btn-danger cursor-pointer"
                                    data-bs-toggle="modal"
                                    data-bs-target="#deleteCameraBackdrop"
                                    onClick={() =>
                                      handleSelectedCamera(camera.id, "delete")
                                    }
                                  ></i>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="text-center">
                                No camera
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                {/* Week Plan Tab */}
                <div
                  class="tab-pane fade"
                  id="v-pills-weekPlan"
                  role="tabpanel"
                  aria-labelledby="v-pills-weekPlan-tab"
                  tabindex="0"
                >
                  <div className="mb-3 d-flex">
                    <button
                      className="btn btn-dark"
                      data-bs-toggle="modal"
                      data-bs-target="#addIntersectionBackdrop"
                    >
                      Add <i className="bi bi-plus-circle ms-2"></i>
                    </button>
                    <input
                      className="form-control searchBar"
                      type="search"
                      placeholder="Search"
                      aria-label="Search"
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                  </div>
                  <WeekPlanTable
                    intersection={filteredIntersection}
                    weekPlan={weekPlan}
                    cameras={cameras}
                    sortedDays={sortedDays}
                    handleSelectedIntersection={handleSelectedIntersection}
                    handleSelectedWeekPlan={handleSelectedWeekPlan}
                    setSelected={setSelected}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToastNotification
          showMessage={showMessage}
          error={error}
          success={success}
        />
        <LogoutModal logout={logout} />
      </div>
      <IntersectionModals found={found} deleteCamera={deleteCamera} />
      {/* Add Intersection Modal */}
      <div
        className="modal fade"
        id="addIntersectionBackdrop"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <div className="d-flex align-items-center justify-content-center">
                <div className="logo"></div>
                <h4 className="mt-3">
                  <strong>ATLS</strong>
                </h4>
              </div>
            </div>
            {intersection ? (
              <div className="modal-body">
                <form>
                  <div className="form-floating m-2">
                    <select
                      className="form-select"
                      id="floatingSelect"
                      aria-label="Floating label select example"
                      value={selectedIntersection}
                      onChange={(e) => setSelectedIntersection(e.target.value)}
                      required
                    >
                      <option value="" disabled selected>
                        Open this select menu
                      </option>
                      {intersection.map((intersection) => (
                        <option key={intersection.id} value={intersection.id}>
                          {intersection.intersection_name}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="floatingSelect">Select Intersection</label>
                  </div>
                  {selected ? (
                    <div className="mt-2">
                      {selected.intersection_name}
                      <div class="form-floating m-2">
                        <select
                          class="form-select"
                          id="floatingSelect"
                          value={selected.day}
                          onChange={(e) =>
                            setSelected({ ...selected, day: e.target.value })
                          }
                          required
                        >
                          <option selected>Open this select menu</option>
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                          <option value="Sunday">Sunday</option>
                        </select>
                        <label for="floatingSelect">Select Day</label>
                      </div>
                      <div class="form-floating m-2">
                        <select
                          class="form-select"
                          id="floatingSelect"
                          value={selected.traffic_light_name}
                          onChange={(e) =>
                            setSelected({
                              ...selected,
                              traffic_light_name: e.target.value,
                            })
                          }
                          required
                        >
                          <option selected>Open this select menu</option>
                          <option value="North">North</option>
                          <option value="South">South</option>
                          <option value="East">East</option>
                          <option value="West">West</option>
                        </select>
                        <label for="floatingSelect">Select Traffic Light</label>
                      </div>
                      <CameraManager
                        selectedCameraId={selectedCameraId}
                        setSelectedCameraId={setSelectedCameraId}
                      />
                      <div>
                        {/* New Timer Mode Selection */}
                        <div className="form-floating m-2">
                          <select
                            className="form-select"
                            id="traffic_mode"
                            value={selected.traffic_mode}
                            onChange={(e) =>
                              setSelected({
                                ...selected,
                                traffic_mode: e.target.value,
                              })
                            }
                            required
                          >
                            <option value="" disabled>
                              Select Timer Mode
                            </option>
                            <option value="Static">Static</option>
                            <option value="Dynamic">Dynamic</option>
                          </select>
                          <label htmlFor="traffic_mode">
                            Select Timer Mode
                          </label>
                        </div>

                        {/* Shared Start Time and End Time */}
                        <div className="d-flex align-items-center justify-content-start">
                          <div className="form-floating mt-2">
                            <input
                              className="form-control"
                              type="time"
                              id="startTime"
                              value={selected.startTime}
                              onChange={(e) =>
                                setSelected({
                                  ...selected,
                                  startTime: e.target.value,
                                })
                              }
                              required
                            />
                            <label htmlFor="startTime">Start Time</label>
                          </div>

                          <div className="form-floating mt-2">
                            <input
                              type="time"
                              className="form-control"
                              id="endTime"
                              value={selected.endTime}
                              onChange={(e) =>
                                setSelected({
                                  ...selected,
                                  endTime: e.target.value,
                                })
                              }
                              required
                            />
                            <label htmlFor="endTime">End Time</label>
                          </div>
                        </div>

                        {/* Timer Input for Static Mode */}
                        {selected.traffic_mode === "Static" && (
                          <div className="form-floating mt-2">
                            <input
                              type="number"
                              id="timer"
                              className="form-control"
                              value={selected.timer}
                              onChange={(e) =>
                                setSelected({
                                  ...selected,
                                  timer: e.target.value,
                                })
                              }
                              required
                            />
                            <label htmlFor="timer">Timer (in seconds)</label>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p>No road found.</p>
                  )}
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                      onClick={() => {
                        setSelectedIntersection("");
                        setSelected({
                          ...selected,
                          traffic_mode: "",
                          startTime: "",
                          endTime: "",
                          traffic_light_name: "",
                        });
                      }}
                    >
                      <i className="bi bi-x me-2"></i>
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddWeekPlan(selectedIntersection)}
                      className="btn btn-success"
                    >
                      <i className="bi bi-plus me-2"></i>
                      Add
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="modal-body">
                <i>No Intersection</i>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    <i className="bi bi-x me-2"></i>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Add Traffic Light Timer Modal */}
      <div
        className="modal fade"
        id="addTrafficLightTimer"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <div className="d-flex align-items-center justify-content-center">
                <div className="logo"></div>
                <h4 className="mt-3">
                  <strong>ATLS</strong>
                </h4>
              </div>
            </div>
            {selected ? (
              <div className="modal-body">
                <form>
                  {selected ? (
                    <div className="mt-2">
                      {selected.traffic_light_name}

                      <div>
                        {/* New Timer Mode Selection */}
                        <div className="form-floating m-2">
                          <select
                            className="form-select"
                            id="traffic_mode"
                            value={selected.traffic_mode}
                            onChange={(e) =>
                              setSelected({
                                ...selected,
                                traffic_mode: e.target.value,
                              })
                            }
                            required
                          >
                            <option value="" disabled>
                              Select Timer Mode
                            </option>
                            <option value="Static">Static</option>
                            <option value="Dynamic">Dynamic</option>
                          </select>
                          <label htmlFor="traffic_mode">
                            Select Timer Mode
                          </label>
                        </div>
                        <CameraManager
                          selectedCameraId={selectedCameraId}
                          setSelectedCameraId={setSelectedCameraId}
                        />
                        {/* Shared Start Time and End Time */}
                        <div className="d-flex align-items-center justify-content-start">
                          <div className="form-floating mt-2">
                            <input
                              className="form-control"
                              type="time"
                              id="startTime"
                              value={selected.startTime}
                              onChange={(e) =>
                                setSelected({
                                  ...selected,
                                  startTime: e.target.value,
                                })
                              }
                              required
                            />
                            <label htmlFor="startTime">Start Time</label>
                          </div>

                          <div className="form-floating mt-2">
                            <input
                              type="time"
                              className="form-control"
                              id="endTime"
                              value={selected.endTime}
                              onChange={(e) =>
                                setSelected({
                                  ...selected,
                                  endTime: e.target.value,
                                })
                              }
                              required
                            />
                            <label htmlFor="endTime">End Time</label>
                          </div>
                        </div>

                        {/* Timer Input for Static Mode */}
                        {selected.traffic_mode === "Static" && (
                          <div className="form-floating mt-2">
                            <input
                              type="number"
                              id="timer"
                              className="form-control"
                              value={selected.timer}
                              onChange={(e) =>
                                setSelected({
                                  ...selected,
                                  timer: e.target.value,
                                })
                              }
                              required
                            />
                            <label htmlFor="timer">Timer (in seconds)</label>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p>No road found.</p>
                  )}
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                      onClick={() =>
                        setSelected({
                          day: "",
                          startTime: "",
                          endTime: "",
                          traffic_light_timer: "",
                          traffic_mode: "",
                        })
                      }
                    >
                      <i className="bi bi-x me-2"></i>
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => (
                        addTrafficLightTimer(selected.traffic_light_id),
                        setSelectedCameraId(selected.camera_id)
                      )}
                      className="btn btn-success"
                    >
                      <i className="bi bi-plus me-2"></i>
                      Add
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="modal-body">
                <i>No Intersection</i>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    <i className="bi bi-x me-2"></i>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Edit Modal */}
      <div
        className="modal fade"
        id="editBackdrop"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <div className="d-flex align-items-center justify-content-center">
                <div className="logo"></div>
                <h4 className="mt-3">
                  <strong>ATLS</strong>
                </h4>
              </div>
            </div>
            <div className="modal-body">
              {selected ? (
                <div>
                  {/* Traffic Light Name Input */}
                  {selected.traffic_light_name && (
                    <div className="mb-3">
                      <h5>Traffic Light Name:</h5>
                      <input
                        className="form-control"
                        type="text"
                        value={selected.traffic_light_name}
                        onChange={(e) =>
                          setSelected({
                            ...selected,
                            traffic_light_name: e.target.value,
                          })
                        }
                        placeholder="Traffic Light Name"
                        disabled
                      />
                    </div>
                  )}

                  {/* Intersection Name Input */}
                  {selected.intersection_name && (
                    <div className="mb-3">
                      <h5>Intersection Name:</h5>
                      <input
                        className="form-control"
                        type="text"
                        value={selected.intersection_name}
                        onChange={(e) =>
                          setSelected({
                            ...selected,
                            intersection_name: e.target.value,
                          })
                        }
                        placeholder="Intersection Name"
                      />
                    </div>
                  )}

                  {/* Traffic Light Timers Inputs */}
                  <h5>Traffic Light Timers:</h5>
                  {selected.traffic_light_timer &&
                    selected.traffic_light_timer
                      .split(";")
                      .map((timeEntry, index) => {
                        const [startTime, endTime, timer] = timeEntry
                          .trim()
                          .split(/ - | : /);

                        return (
                          <div key={index} className="mb-3">
                            <h6>Timer {index + 1}</h6>
                            <div>
                              <strong>Start Time:</strong>
                              <input
                                type="time"
                                value={startTime}
                                onChange={(e) => {
                                  const updatedTime =
                                    e.target.value +
                                    ` - ${endTime}` +
                                    (selected.traffic_mode === "Static"
                                      ? ` : ${timer}`
                                      : "");
                                  updateTimeAtIndex(index, updatedTime);
                                }}
                                className="form-control mb-2"
                              />
                            </div>
                            <div>
                              <strong>End Time:</strong>
                              <input
                                type="time"
                                value={endTime}
                                onChange={(e) => {
                                  const updatedTime =
                                    `${startTime} - ${e.target.value}` +
                                    (selected.traffic_mode === "Static"
                                      ? ` : ${timer}`
                                      : "");
                                  updateTimeAtIndex(index, updatedTime);
                                }}
                                className="form-control mb-2"
                              />
                            </div>
                            {selected.traffic_mode === "Static" && (
                              <div>
                                <strong>Timer Duration:</strong>
                                <input
                                  type="number"
                                  value={timer}
                                  onChange={(e) => {
                                    const updatedTime = `${startTime} - ${endTime} : ${e.target.value}`;
                                    updateTimeAtIndex(index, updatedTime);
                                  }}
                                  className="form-control"
                                  placeholder="Duration in seconds"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}

                  {/* Modal Footer Buttons */}
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                      onClick={() =>
                        setSelected({
                          traffic_light_name: "",
                          intersection_name: "",
                          traffic_light_timer: "",
                          day: "",
                        })
                      }
                    >
                      <i className="bi bi-x me-2"></i>
                      Cancel
                    </button>
                    {selected.intersection_name && (
                      <button
                        type="button"
                        onClick={() => editIntersection(selected.id)}
                        className="btn btn-warning"
                        data-bs-dismiss="modal"
                      >
                        <i className="bi bi-pencil me-2"></i>
                        Yes
                      </button>
                    )}
                    {selected.traffic_light_timer && (
                      <button
                        type="button"
                        onClick={() => editWeekPlan(selected.traffic_light_id)}
                        className="btn btn-warning"
                        data-bs-dismiss="modal"
                      >
                        <i className="bi bi-pencil me-2"></i>
                        Yes
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <p>No road found.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Set Traffic Light Modal */}
      <div
        className="modal fade"
        id="setWeekPlanBackdrop"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <div className="d-flex align-items-center justify-content-center">
                <div className="logo"></div>
                <h4 className="mt-3">
                  <strong>ATLS</strong>
                </h4>
              </div>
            </div>
            <div className="modal-body">
              {selected ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setTrafficLight(selected.intersection_id); // Add your submit logic here
                  }}
                >
                  <div className="mt-2">
                    {selected.intersection_name}

                    {/* Select Day */}
                    <div className="form-floating m-2">
                      <select
                        className="form-select"
                        id="floatingSelect"
                        value={selected.day}
                        onChange={(e) =>
                          setSelected({ ...selected, day: e.target.value })
                        }
                        required
                      >
                        <option value="" disabled>
                          Open this select menu
                        </option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                      <label htmlFor="floatingSelect">Select Day</label>
                    </div>

                    {/* Select Traffic Light */}
                    <div className="form-floating m-2">
                      <select
                        className="form-select"
                        id="floatingSelect"
                        value={selected.traffic_light_name}
                        onChange={(e) =>
                          setSelected({
                            ...selected,
                            traffic_light_name: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="" disabled>
                          Open this select menu
                        </option>
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="East">East</option>
                        <option value="West">West</option>
                      </select>
                      <label htmlFor="floatingSelect">
                        Select Traffic Light
                      </label>
                    </div>
                    <CameraManager
                      selectedCameraId={selectedCameraId}
                      setSelectedCameraId={setSelectedCameraId}
                    />
                    {/* New Timer Mode Selection */}
                    <div className="form-floating m-2">
                      <select
                        className="form-select"
                        id="traffic_mode"
                        value={selected.traffic_mode}
                        onChange={(e) =>
                          setSelected({
                            ...selected,
                            traffic_mode: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="" disabled>
                          Select Timer Mode
                        </option>
                        <option value="Static">Static</option>
                        <option value="Dynamic">Dynamic</option>
                      </select>
                      <label htmlFor="traffic_mode">Select Timer Mode</label>
                    </div>

                    {/* Shared Start Time and End Time */}
                    <div className="d-flex align-items-center justify-content-start">
                      <div className="form-floating mt-2">
                        <input
                          className="form-control"
                          type="time"
                          id="startTime"
                          value={selected.startTime}
                          onChange={(e) =>
                            setSelected({
                              ...selected,
                              startTime: e.target.value,
                            })
                          }
                          required
                        />
                        <label htmlFor="startTime">Start Time</label>
                      </div>

                      <div className="form-floating mt-2">
                        <input
                          type="time"
                          className="form-control text-black"
                          id="endTime"
                          value={selected.endTime}
                          onChange={(e) =>
                            setSelected({
                              ...selected,
                              endTime: e.target.value,
                            })
                          }
                          required
                        />
                        <label htmlFor="endTime">End Time</label>
                      </div>
                    </div>

                    {/* Timer Input for Static Mode */}
                    {selected.traffic_mode === "Static" && (
                      <div className="form-floating mt-2">
                        <input
                          type="number"
                          id="timer"
                          className="form-control"
                          value={selected.timer}
                          onChange={(e) =>
                            setSelected({ ...selected, timer: e.target.value })
                          }
                          required
                        />
                        <label htmlFor="timer">Timer (in seconds)</label>
                      </div>
                    )}

                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        data-bs-dismiss="modal"
                        onClick={() =>
                          setSelected({
                            traffic_light_name: "",
                            day: "",
                            startTime: "",
                            endTime: "",
                            traffic_mode: "",
                            timer: "", // Reset the timer when switching modes
                          })
                        }
                      >
                        <i className="bi bi-x me-2"></i>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-success">
                        <i className="bi bi-check2 me-2"></i>
                        Add
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <p>No road found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Delete Modal */}
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
                  {selected.traffic_light_name && (
                    <input
                      type="text"
                      className="form-control mb-2"
                      disabled
                      value={selected.traffic_light_name}
                    />
                  )}
                  {selected.intersection_name && (
                    <input
                      type="text"
                      className="form-control mb-2"
                      disabled
                      value={selected.intersection_name}
                    />
                  )}
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                      onClick={() =>
                        setSelected({
                          traffic_light_name: "",
                          traffic_light_id: "",
                        })
                      }
                    >
                      <i className="bi bi-x me-2"></i>
                      Cancel
                    </button>
                    {selected.traffic_light_name && (
                      <button
                        type="button"
                        onClick={() =>
                          deleteTrafficLight(selected.traffic_light_id)
                        }
                        className="btn btn-danger"
                        data-bs-dismiss="modal"
                      >
                        <i className="bi bi-check2 me-2"></i>
                        Yes
                      </button>
                    )}
                    {selected.id && (
                      <button
                        type="button"
                        onClick={() => deleteIntersection(selected.id)}
                        className="btn btn-danger"
                        data-bs-dismiss="modal"
                      >
                        <i className="bi bi-check2 me-2"></i>
                        Yes
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
            {selectedWeekPlan ? (
              <div className="modal-body">
                <p>Are you sure you want to delete this week plan?</p>
                <div>
                  {selectedWeekPlan.intersection_name && (
                    <input
                      type="text"
                      className="form-control mb-2"
                      disabled
                      value={selectedWeekPlan.intersection_name}
                    />
                  )}
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                      onClick={() => setSelectedWeekPlan(null)}
                    >
                      <i className="bi bi-x me-2"></i>
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        deleteWeekPlan(selectedWeekPlan.week_plan_id)
                      }
                      className="btn btn-danger"
                      data-bs-dismiss="modal"
                    >
                      <i className="bi bi-check2 me-2"></i>
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

export default WeekPlanSetting;
