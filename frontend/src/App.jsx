import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Footage from "./screens/Footage";
import RealTime from "./screens/RealTime";
import Testing from "./screens/Testing";
import Monitoring from "./screens/monitoring/Monitoring";
import AccountManagement from "./screens/account/AccountManagement";
import WeekPlanSetting from "./screens/weekplan/WeekPlanSetting";
import ViolationRecord from "./screens/ViolationRecord";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "./screens/dashboard/Dashboard";
import SignIn from "./screens/landingSignIn/SignIn";
import LandingPage from "./screens/landingSignIn/LandinPage";
function App() {
  return (
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
          path="/monitoring"
          element={
            <ProtectedRoute>
              <Monitoring />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts"
          element={
            // <ProtectedRoute>
              <AccountManagement />
            // </ProtectedRoute>
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
        {/* <Route path="/footage" element={<Footage />} /> */}
        <Route path="/realtime" element={<RealTime />} />
        <Route path="/testing" element={<Testing />} />
        {/* <Route path="/accounts" element={<AccountManagement />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
