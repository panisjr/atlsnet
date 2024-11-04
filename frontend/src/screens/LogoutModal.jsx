// LogoutModal.jsx
import React from 'react';

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
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <div className="d-flex align-items-center justify-content-center">
              <div className="logo"></div>
              <h4 className="mt-3">
                <strong>ATLS</strong>
              </h4>
            </div>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <p>Are you sure you want to logout?</p>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                <i className="bi bi-x me-2"></i>
                Cancel
              </button>
              <button
                onClick={logout}
                className="btn btn-danger"
                data-bs-dismiss="modal"
              >
                <i className="bi bi-check2 me-2"></i>
                Yes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
