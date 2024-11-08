// ToastNotification.jsx
import React, { useEffect } from 'react';
import AOS from 'aos';

export const ToastNotification = ({ showMessage, error, success }) => {
  useEffect(()=>{
    AOS.init({duration:500, easing:"ease-in-out", once:false})
  },[])
  return (
    showMessage && (
      <div
        aria-live="polite"
        aria-atomic="true"
        className="toastContainer"
        style={{ zIndex: 9999 }}
        data-aos="slide-left"
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
    )
  );
};

export default ToastNotification;
