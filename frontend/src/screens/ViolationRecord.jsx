import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SideNavbar from "./SideNavbar";

import config from '../config'; 
import LogoutModal from "./LogoutModal";
const ViolationRecord = () => {
  const apiUrl = config.API_URL;
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [active, setActive] = useState("violationRecord");

  // FOR OCR
  const [file, setFile] = useState(null);
  const [imgSrc, setImgSrc] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState([]);

  // THIS IS FOR OCR
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMsg("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${apiUrl}/ocr/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Handle the response from the Flask backend
      fetchImages();
      handleFileChange(null)
      setExtractedText(response.data.extracted_text);
      setImgSrc(response.data.img_src);
      setShowMessage(true);
      setSuccess(response.data.message);
      setTimeout(() => {
        setShowMessage(false);
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("Error uploading the file:", error);
      setMsg("An error occurred while uploading the file.");
    }
  };
  // DELETE IMAGE
  const deleteImage = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.delete(
        `${apiUrl}/ocr/delete_image/${id}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      fetchImages();
      setShowMessage(true);
      setSuccess(response.data.message);
      setTimeout(() => {
        setShowMessage(false);
        setSuccess(null);
      }, 3000);
    } catch (error) {
      showMessage(true);
      setError(error.reponse?.data?.error);
      setTimeout(() => {
        showMessage(false);
        setError(null);
      }, 3000);
    }
  };
  // END FOR OCR
  // To navigate screens
  const navigate = useNavigate();
  const fetchImages = async () => {
    try {
      const response = await axios.get(`${apiUrl}/ocr/images`); // Adjust the URL as needed

      setImages(response.data);
    } catch (error) {
      console.error("Error fetching images", error);
    }
  };
  useEffect(() => {
    fetchImages();
    document.title = "ATLS | Violation Records";
    console.log(images);
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
    if (item === "monitoring") {
      navigate("/monitoring");
    }
    if (item === "accounts") {
      navigate("/accounts");
    }
    if (item === "weekPlanSetting") {
      navigate("/weekPlanSetting");
    }
  };
  return (
    <>
      <div className="container-fluid vw-100 vh-100">
        <div className="row">
          <SideNavbar active={active} handleClick={handleClick} />

          <div className="col-10 accountManagementContainer">
            <div className="row d-flex align-items-center justify-content-start">
              <div className="col-12">
                <div className="row">
                  <div className="col-5">
                    <h6 className="p-3">Violation Records</h6>
                    <button
                      className="btn btn-outline-dark"
                      data-bs-toggle="modal"
                      data-bs-target="#createAccountStaticBackdrop"
                    >
                      <i class="bi bi-person-plus"></i>
                    </button>
                    <h5>Upload new File</h5>
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                      <input
                        type="file"
                        name="file"
                        onChange={handleFileChange}
                      />
                      <input type="submit" value="Upload" />
                    </form>
                  </div>
                  <div className="col-5">
                    <h5>Result:</h5>
                    {imgSrc && (
                      <img
                        src={imgSrc}
                        alt="Uploaded file"
                        style={{ maxWidth: "100%", height: "auto" }}
                      />
                    )}
                    {extractedText ? (
                      <p>
                        The extracted text from the image above is:{" "}
                        <b>{extractedText}</b>
                      </p>
                    ) : (
                      <p>The extracted text will be displayed here</p>
                    )}
                  </div>
                </div>
              </div>
              <div
                className="col-12"
                style={{ height: "291px", width: "100%", overflowY: "auto" }}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <table className="table table-striped table-rounded">
                    <thead>
                      <th>Image</th>
                      <th>Plate No.</th>
                      <th>Date</th>
                      <th></th>
                    </thead>
                    {images && images.length > 0 ? (
                      images.map((src, index) => (
                        <tbody key={index}>
                          <tr>
                            <td>
                              {" "}
                              <img
                                src={src.filename}
                                alt={`Uploaded ${index}`}
                                style={{
                                  maxWidth: "20%",
                                  height: "auto",
                                  margin: "5px",
                                }}
                              />
                            </td>
                            <td>
                              <h5>{src.extracted_text}</h5>
                            </td>
                            <td>
                              <h5>{src.uploaded_at}</h5>
                            </td>
                            <td>
                              <button
                                className="btn btn-outline-danger bi bi-trash"
                                data-bs-toggle="modal"
                                data-bs-target="#deleteBackdrop"
                                onClick={() => setSelected(src)}
                              ></button>
                            </td>
                          </tr>
                        </tbody>
                      ))
                    ) : (
                      <i className="d-flex align-items-center justify-content-end">
                        No violation found...
                      </i>
                    )}
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toast for success or error messages */}
        {showMessage && (
          <div
            aria-live="polite"
            aria-atomic="true"
            className="toastContainer"
            style={{ zIndex: 9999 }}
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
        )}
      </div>
      {/* Logout Modal */}
      <LogoutModal logout={logout} />
      {/* Delete  Modal */}
      <div
        className="modal fade"
        id="deleteBackdrop"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header d-flex align-items-center justify-content-center">
              <div className="warningLogo"></div>
              <div>
                <h4 className="ms-4 mt-3">
                  <strong>DELETE CONFIRMATION</strong>
                </h4>
                <p className="ms-4">This action cannot be undone.</p>
              </div>
            </div>
            {selected ? (
              <div className="modal-body">
                <p>Are you sure you want to delete this?</p>
                <div>
                  <input
                    type="text"
                    className="form-control mb-2"
                    disabled
                    value={selected.id}
                  />
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteImage(selected.id)}
                      className="btn btn-danger"
                      data-bs-dismiss="modal"
                    >
                      Yes
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default ViolationRecord;
