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
  const [active, setActive] = useState("trafficLightStatus");
  // Effect to calculate sorted timers whenever counts change
  const navigate = useNavigate();
 
  // Fetch Datas
  useEffect(() => {
    document.title = "ATLS | Traffic Light Status";
    fetchWeekPlan();
    fetchTrafficLightSetting();
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
            </div>
          </div>
        </div>
      </div>
      <LogoutModal logout={logout} />
    </>
  );
};

export default TrafficLightStatus;
