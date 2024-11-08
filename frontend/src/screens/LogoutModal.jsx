// LogoutModal.jsx
import React from "react";

const LogoutModal = ({ logout }) => {
  return (
    <div
      className="modal fade"
      id="logoutBackdrop"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          {/* Modal Header */}
          <div className="modal-header border-bottom-0 bg-danger text-white">
            <div className="d-flex align-items-center justify-content-center w-100">
             
              <h4 className="mt-3 mb-0">
                <strong>Logout</strong>
              </h4>
            </div>
          </div>

          {/* Modal Body */}
          <div className="modal-body text-center">
            <i
              className="bi bi-exclamation-circle text-danger"
              style={{ fontSize: "3rem" }}
            ></i>
            <p className="mt-4 fs-5">Are you sure you want to logout?</p>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer justify-content-center border-top-0">
            <button
              type="button"
              className="btn btn-secondary px-4"
              data-bs-dismiss="modal"
            >
              <i className="bi bi-x me-2"></i>
              Cancel
            </button>
            <button
              onClick={logout}
              className="btn btn-danger px-4"
              data-bs-dismiss="modal"
            >
              <i className="bi bi-check2 me-2"></i>
              Yes, Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
