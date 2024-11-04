import React from 'react';
import "./css/SideNavbar.css"
const SideNavbar = ({ active, handleClick }) => {
  return (
    <div className="col-2 col-md-2">
      <div className="side-navbar">
        {/* Sidebar content */}
        <div className="logo-container">
          <img src="/logo.png" alt="Logo" className="logo" />
          <h5 className="logo-name pb-2 ps-2">ATLS</h5>
        </div>
        <div className="border-bottom-custom"></div>
        <div
          onClick={(e) => handleClick(e, "dashboard")}
          className={`navbar-button ${active === "dashboard" ? "active" : ""}`}
        >
          <i className="bi bi-columns-gap ms-3"></i>
          <p className="navbar-button-font mt-3 ms-2">Dashboard</p>
        </div>
        <div
          onClick={(e) => handleClick(e, "monitoring")}
          className={`navbar-button ${active === "monitoring" ? "active" : ""}`}
        >
          <i className="bi bi-bar-chart ms-3"></i>
          <p className="navbar-button-font mt-3 ms-2">Monitoring</p>
        </div>
        <div
          onClick={(e) => handleClick(e, "accounts")}
          className={`navbar-button ${active === "accounts" ? "active" : ""}`}
        >
          <i className="bi bi-person-lines-fill ms-3"></i>
          <p className="navbar-button-font mt-3 ms-2">Accounts</p>
        </div>
        <div
          onClick={(e) => handleClick(e, "weekPlanSetting")}
          className={`navbar-button ${active === "weekPlanSetting" ? "active" : ""}`}
        >
          <i className="bi bi-calendar2-week ms-3"></i>
          <p className="navbar-button-font mt-3 ms-2">Week Plan</p>
        </div>
        <div
          onClick={(e) => handleClick(e, "violationRecord")}
          className={`navbar-button ${active === "violationRecord" ? "active" : ""}`}
        >
          <i className="bi bi-columns-gap ms-3"></i>
          <p className="navbar-button-font mt-3 ms-2">Violation Records</p>
        </div>
        <div className="navbar-button-logout" data-bs-toggle="modal" data-bs-target="#logoutBackdrop">
          <i className="bi bi-box-arrow-left"></i>
          <p className="mt-3 ms-2">Logout</p>
        </div>
      </div>
    </div>
  );
};

export default SideNavbar;
