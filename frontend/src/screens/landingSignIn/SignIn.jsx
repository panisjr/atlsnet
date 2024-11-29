import React, { useEffect, useState } from "react";
import "./SignIn.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { decodeJwt } from "jose";
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS styles
import ToastNotification from "../ToastNotification";
import config from '../../config'; 
const SignIn = () => {
  // const apiUrl = config.API_URL;
  const apiUrl = "http://localhost:5000";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  // For animation
  useEffect(() => {
    AOS.init({ duration: 500, easing: "ease-out", once: true });
  }, []);
  // To verify account signIn
  const handleLogin = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await axios.post(`${apiUrl}/users/signIn`, {
        email,
        password,
      });

      const { token } = response.data;
      setData(response.data);

      // Decode JWT token
      const decodedToken = decodeJwt(token);
      const userRole = decodedToken.role;

      // Optionally store token in sessionStorage or context
      sessionStorage.setItem("token", token);
      // Navigate to different screens based on the role
      if (userRole === "Admin") {
        navigate("/dashboard");
      } else if (userRole === "User") {
        navigate("/dashboard");
      } else {
        navigate("/user-dashboard"); // Default screen for other users
      }
    } catch (error) {
      setShowMessage(true);
      setError(error.response?.data?.error);

      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    }
  };

  useEffect(() => {
    document.title = "ATLS | Sign In";
  }, []);

  // To navigate screens
  const navigate = useNavigate();

  const handleClick = (event, item) => {
    if (item === "/") {
      navigate("/");
    }
  };
  return (
    <>
      <div className="container-fluid vw-100">
        <div className="row vh-100 undraw">
          <div className="col-12 d-flex align-items-center justify-content-center">
            <div
              className="col-9 p-3 pt-4 pb-4 signIn-container"
            >
              <div className="logoContainer justify-content-around">
                <img
                  src="/logo.png"
                  alt="Automated Traffic Light Icon"
                  className="signIn-logo"
                />
                <h4 className="text-center text-white">Sign In</h4>
              </div>
              <form onSubmit={handleLogin}>
                <div className="input-group mb-3 mt-3">
                  <input
                    type="email"
                    className="form-control border border-secondary"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                  />
                </div>
                <div className="input-group mb-3">
                  <input
                    type="password"
                    className="form-control border border-secondary"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                  />
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="signIn-button btn btn-primary mb-4 fw-semibold"
                  >
                    Sign In
                  </button>
                  <p className="fs-6">
                    Want to know more{" "}
                    <span
                      className="text-danger cursor-pointer"
                      onClick={(e) => handleClick(e, "/")}
                    >
                      about us
                    </span>
                    ?
                  </p>
                </div>
              </form>
            </div>
          </div>
          <footer class="bg-dark text-light pt-3 " data-aos="slide-up">
            <div class="container">
              <div class="row">
                <div class="col-12 col-md-4" data-aos="fade-up">
                  <h5>About Us</h5>
                  <p>
                    Ensuring a smooth traffic flow and provide valuable insight
                    of traffic trends.
                  </p>
                </div>
                <div class="col-12 col-md-4" data-aos="fade-up">
                  <h5>Contact</h5>
                  <ul class="list-unstyled">
                    <li>
                      <a href="https://mail.google.com" class="text-light">
                        Email Us <span className="ms-5">atls@gmail.com</span>
                      </a>
                    </li>
                    <li>
                      <a href="#" class="text-light">
                        Location <span className="ms-5">example</span>
                      </a>
                    </li>
                  </ul>
                </div>
                <div class="col-12 col-md-4" data-aos="fade-up">
                  <h5>Follow Us</h5>
                  <a href="#" class="text-light me-3">
                    <i class="bi bi-facebook"></i>
                  </a>
                  <a href="#" class="text-light">
                    <i class="bi bi-instagram"></i>
                  </a>
                </div>
              </div>
              {/* <div class="text-center mt-3">
                <p>&copy; 2024 Your Company Name. All rights reserved.</p>
              </div> */}
            </div>
          </footer>
        </div>
      </div>
      {/* Toast for success or error messages */}
     <ToastNotification success={success} showMessage={showMessage} error={error}/>

      {/* Forgot Modal */}
      <div
        className="modal fade"
        id="staticBackdrop"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Forgot Password?
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="input-group mb-3">
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    id="email"
                    placeholder="Email"
                    required
                  />
                </div>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    id="name"
                    placeholder="Full Name"
                    required
                  />
                </div>
                <div className="input-group mb-3">
                  <input
                    type="password"
                    className="form-control"
                    name="password1"
                    id="password1"
                    placeholder="Password"
                    required
                  />
                </div>
                <div className="input-group mb-3">
                  <input
                    type="password"
                    className="form-control"
                    name="password2"
                    id="password2"
                    placeholder="Confirm Password"
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
