import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SideNavbar from "../SideNavbar";
import LogoutModal from "../LogoutModal";
import { useTheme } from "../ThemeProvider";
import "./Dashboard.css";
import "../css/DarkLightMode.css";
import DailyCountsChart from "./DailyCountsChart";

const Dashboard = () => {
  const [active, setActive] = useState("dashboard");
  // User Evaluation
  const [totalUsers, setTotalUsers] = useState(0);
  const [todayUsers, setTodayUsers] = useState(0);
  const [userPercentage, setUserPercentage] = useState(0);
  const [percentageToday, setPercentageToday] = useState(0);

  // Video Evaluation
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [todayVehicle, setTodayVehicle] = useState(0);
  const [vehiclePercentageToday, setVehiclePercentageToday] = useState(0);
  const [vehiclePercentageTotal, setVehiclePercentageTotal] = useState(0);
  // For Light and Dark Mode
  const { isDarkMode, setIsDarkMode } = useTheme();
  // Function to toggle theme
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };
  const navigate = useNavigate();
  // Fetch Datas
  useEffect(() => {
    document.title = "ATLS | Dashboard";
    fetchTotalUsers();
    fetchDailyCounts();
  }, []);
  const logout = () => {
    sessionStorage.clear();
    navigate("/");
  };
  const fetchTotalUsers = async () => {
    const response = await axios.get("http://localhost:5000/users/get_users");
    // Users
    setTotalUsers(response.data.total_users);
    setTodayUsers(response.data.daily_count);
    setUserPercentage(response.data.increase_percentage);
    setPercentageToday(response.data.percentage_today);
    // Vehicles
    setTotalVehicles(response.data.total_vehicle_count);
    setTodayVehicle(response.data.today_vehicle_count);
    setVehiclePercentageToday(response.data.vehicle_percentage_today);
    setVehiclePercentageTotal(response.data.vehicle_percentage_today);
  };

  // For underline of current screen in in the navbar
  const handleClick = (event, item) => {
    event.preventDefault();
    setActive(item);
    if (item === "monitoring") {
      navigate("/monitoring");
    }
    if (item === "accounts") {
      navigate("/accounts");
    }
    if (item === "weekPlanSetting") {
      navigate("/weekPlanSetting");
    }
    if (item === "violationRecord") {
      navigate("/violationRecord");
    }
  };
  // Daily Counts
  const [dailyData, setDailyData] = useState([]);
  const fetchDailyCounts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/videos/daily_counts"
      );
      setDailyData(response.data);
      console.log("Fetched daily counts:", response.data);
    } catch (error) {
      console.error("Error fetching daily counts:", error);
    }
  };
  return (
    <>
      <div className="container-fluid vw-100">
        <div className="row">
          <SideNavbar active={active} handleClick={handleClick} />
          <div className="col-10 col-md-10 vh-100 p-4">
            {/* <!-- Main content area --> */}
            <div className="d-flex align-items-center justify-content-between">
              <h6 className="p-3">
                <span className="text-secondary">Pages</span> / Dashboard
              </h6>
              <div className="align-items-center justify-content-center d-flex">
                <i
                  className={`switch-button fs-3 bi ${
                    isDarkMode ? "bi-toggle-on" : "bi-toggle-off"
                  }`}
                  onClick={toggleTheme}
                  style={{ cursor: "pointer" }}
                ></i>
                <span className="ms-2">
                  {isDarkMode ? "Dark Mode" : "Light Mode"}
                </span>
              </div>
            </div>
            <div>
              <h4 className="fw-bold ">Dashboard</h4>
              <p className="text-secondary fw-medium">
                Monitor traffic flow, light schedules, and congestion by
                intersection.
              </p>
            </div>
            {/* 4 Cards */}
            <div className="row d-flex align-items-center justify-content-around">
              {/* Today's Users */}
              <div className="col-3 col-md-3 dashboard-card1 ">
                <div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <p className="text-secondary fw-medium m-0">New Users</p>
                      <p className="text-dark fs-3 fw-semibold m-0 ms-3">
                        {todayUsers}
                      </p>
                    </div>
                    <i className="bi bi-person"></i>
                  </div>

                  <div className="border-bottom-custom-gray"></div>
                </div>
                <div className="d-flex pt-2">
                  <span
                    className="fw-semibold me-1"
                    style={{
                      color: "#57af5b",
                    }}
                  >
                    +{percentageToday}%
                  </span>
                  <p className="text-secondary">than yesterday</p>
                </div>
              </div>

              {/* Today's Vehicle Count */}
              <div className="col-3 col-md-3 dashboard-card1 ">
                <div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <p className="text-secondary fw-medium m-0">
                        Today's Vehicle Count
                      </p>
                      <p className="text-dark fs-4 fw-semibold m-0 ms-3">
                        {todayVehicle}
                      </p>
                    </div>
                    <i className="bi bi-car-front"></i>
                  </div>
                  <div className="border-bottom-custom-gray"></div>
                </div>
                <div className="d-flex pt-2 mb-0">
                  <span
                    className="fw-semibold me-1"
                    style={{
                      color: "#57af5b",
                    }}
                  >
                    +{vehiclePercentageToday}%
                  </span>
                  <p className="text-secondary">than yesterday</p>
                </div>
              </div>
              {/* Today's Vehicle Count */}
              <div className="col-3 col-md-3 dashboard-card1 ">
                <div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <p className="text-secondary fw-medium m-0">
                        Total Users
                      </p>
                      <p className="text-dark fs-4 fw-semibold m-0 ms-3">
                        {totalUsers}
                      </p>
                    </div>
                    <i className="bi bi-people"></i>
                  </div>
                  <div className="border-bottom-custom-gray"></div>
                </div>
                <div className="d-flex pt-2 mb-0">
                  <span
                    className="fw-semibold me-1"
                    style={{
                      color: "#57af5b",
                    }}
                  >
                    +{userPercentage}%
                  </span>
                  <p className="text-secondary">than last month</p>
                </div>
              </div>
              {/* Total Vehicle Count */}
              <div className="col-3 col-md-3 dashboard-card1 ">
                <div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <p className="text-secondary fw-medium m-0">
                        Total Vehicle
                      </p>
                      <p className="text-dark fs-4 fw-semibold m-0 ms-3">
                        {totalVehicles}
                      </p>
                    </div>
                    <i className="bi bi-truck-front"></i>
                  </div>
                  <div className="border-bottom-custom-gray"></div>
                </div>
                <div className="d-flex pt-2 mb-0">
                  <span
                    className="fw-semibold me-1"
                    style={{
                      color: "#57af5b",
                    }}
                  >
                    +{userPercentage}%
                  </span>
                  <p className="text-secondary">than last month</p>
                </div>
              </div>
            </div>
            <div>
              {dailyData.length > 0 && <DailyCountsChart data={dailyData} />}
            </div>
          </div>
          <div className="col-2 col-md-2">
            {/* <!-- Optional right sidebar or blank space --> */}
          </div>
        </div>
      </div>
      <LogoutModal logout={logout} />
    </>
  );
};

export default Dashboard;
