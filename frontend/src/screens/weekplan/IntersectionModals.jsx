import React from "react";

const IntersectionModals = ({
  found,
  deleteCamera,
}) => {
  return (
    <>
      <div
        className="modal fade"
        id="deleteCameraBackdrop"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-danger border-bottom-0 text-white align-items-center justify-content-center">
              <h4 className="mt-3 fw-medium">Confirmation</h4>
            </div>
            {found ? (
              <div className="modal-body">
                <div className="text-center">
                  <p
                    className="bi bi-exclamation-circle text-danger"
                    style={{ fontSize: "3rem" }}
                  ></p>
                  <p className="fw-medium">
                    Are you sure you want to delete this camera?
                  </p>
                </div>

                <strong className="mt-2">Camera Information</strong>
                <p>
                  <strong>ID:</strong> {found.id}
                </p>
                <p>
                  <strong>Name:</strong> {found.name}
                </p>
                <p>
                  <strong>RTSP URL:</strong> {found.rtsp_url}
                </p>
                <p>
                  <strong>Location:</strong> {found.location}
                </p>

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
                    onClick={() => deleteCamera(found.id)}
                    className="btn btn-danger"
                    data-bs-dismiss="modal"
                  >
                    <i className="bi bi-check me-2"></i>
                    Yes, Delete
                  </button>
                </div>
              </div>
            ) : (
              <p>No camera selected.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default IntersectionModals;
