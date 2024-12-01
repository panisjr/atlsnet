import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Footage from "./screens/Footage";
import CCTVMonitoring from "./screens/monitoring/CCTVMonitoring";
import AccountManagement from "./screens/account/AccountManagement";
import WeekPlanSetting from "./screens/weekplan/WeekPlanSetting";
import ViolationRecord from "./screens/ViolationRecord";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "./screens/dashboard/Dashboard";
import SignIn from "./screens/landingSignIn/SignIn";
import LandingPage from "./screens/landingSignIn/LandinPage";
import CommandCenter from "./screens/monitoring/CommandCenter";
import TrafficLightActive from "./screens/monitoring/TrafficLightActive";
import TrafficLightStatus from "./screens/monitoring/TrafficLightStatus";
// import { StreamProvider } from "./screens/StreamProvider";
function App() {
  return (
    // <StreamProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage/>}/>
        <Route path="/signIn" element={<SignIn />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cctvMonitoring"
          element={
            <ProtectedRoute>
              <CCTVMonitoring />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trafficLightStatus"
          element={
            <ProtectedRoute>
              <TrafficLightStatus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts"
          element={
            <ProtectedRoute>
              <AccountManagement />
          </ProtectedRoute>
          }
        />
        <Route
          path="/weekPlanSetting"
          element={
            <ProtectedRoute>
              <WeekPlanSetting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/violationRecord"
          element={
            <ProtectedRoute>
              <ViolationRecord />
            </ProtectedRoute>
          }
        />
        <Route path="/trafficLightActive" element={<TrafficLightActive />} />
        <Route path="/commandCenter" element={<CommandCenter />} />
      </Routes>
    </BrowserRouter>
    // </StreamProvider>
  );
}
// huhu
export default App;
