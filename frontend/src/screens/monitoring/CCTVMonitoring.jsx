import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LogoutModal from "../LogoutModal";
import SideNavbar from "../SideNavbar";
import "./CCTVMonitoring.css";
import CommandCenter from "./CommandCenter";
import config from "../../config";

const CCTVMonitoring = () => {
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
  const [countdowns, setCountdowns] = useState([null, null, null, null]);
  const [sortedTimers, setSortedTimers] = useState([]);
  const [allVideosUploaded, setAllVideosUploaded] = useState(false);
  const [uploading, setUploading] = useState(false); // New state variable
  const [uploadProgress, setUploadProgress] = useState(0); // State variable to store upload progress
  const [active, setActive] = useState("cctvMonitoring");
  const [vidSrc, setVidSrc] = useState([]);
  const [selected, setSelected] = useState([]);
  // Effect to calculate sorted timers whenever counts change
  const navigate = useNavigate();
  // Fetch Datas
  useEffect(() => {
    document.title = "ATLS | CCTV Monitoring";
    fetchWeekPlan();
    fetchTrafficLightSetting();
    fetchVideo();
    return () => {
      // Cleanup, if necessary
    };
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
    if (item === "accounts") {
      navigate("/accounts");
    }
    if (item === "weekPlanSetting") {
      navigate("/weekPlanSetting");
    }
    if (item === "trafficLightStatus") {
      navigate("/trafficLightStatus");
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
  return (
    <>
      <div className="container-fluid  vh-100 vw-100">
        <div className="row">
          <SideNavbar handleClick={handleClick} active={active} />

          <div className="col-10 col-md-10 p-4">
            <h6 className="p-3">
              <span className="text-secondary">Pages</span> / CCTV Monitoring
            </h6>
            <div className="row monitoringContainer">
              <CommandCenter />
            </div>
          </div>
        </div>
      </div>
      <LogoutModal logout={logout} />
    </>
  );
};

export default CCTVMonitoring;
