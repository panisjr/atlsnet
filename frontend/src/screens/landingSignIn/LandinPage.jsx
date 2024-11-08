import React, { useEffect, useState } from "react";
import "./LandingPage.css";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS styles
const LandingPage = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    document.title = "ATLS | Welcome ";
  }, []);
  useEffect(() => {
    AOS.init({ duration: 1000, easing: "ease-out", once: false });
  }, []);
  const [scrolling, setScrolling] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 50) {
      setScrolling(true);
    } else {
      setScrolling(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  // To navigate screens
  const navigate = useNavigate();

  const handleClick = (event, item) => {
    if (item === "landingPage") {
      navigate("/landingPage");
    }
    if (item === "signIn") {
      navigate("/signIn");
    }
  };
  return (
    <>
      <div className="container-fluid vw-100">
        <div className="row vh-100">
          <nav
            id="navScroll"
            className={`navbar navbar-expand-lg navbar-light fixed-top bg-white transition ${
              scrolling ? "scrolled" : ""
            }`}
            tabIndex="0"
          >
            <div className="container">
              <a className="navbar-brand pe-4 fs-4" href="/">
                <img className="logo" src="logo.png" alt="" />
                <span className="ms-1 fw-bolder">ATLS</span>
              </a>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
              <div
                className="collapse navbar-collapse"
                id="navbarSupportedContent"
              >
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  <li className="nav-item">
                    <a className="nav-link" href="#services">
                      Services
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#aboutus">
                      About Us
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#contact">
                      Contact
                    </a>
                  </li>
                </ul>
                <i className="bi bi-person-fill me-2 pb-1 fs-4"></i>
                <a
                  className="link-dark pb-1 link-fancy me-2 cursor-pointer"
                  onClick={(e) => handleClick(e, "signIn")}
                >
                  Sign In
                </a>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <div className="col-12 d-flex align-items-center justify-content-center">
            <div>
              <div className="w-100 overflow-hidden bg-gray-100" id="top">
                <div className="container vh-100 position-relative">
                  <div
                    className="col-12 col-lg-8 mt-0 h-100 position-absolute top-0 end-0 bg-cover"
                    data-aos="fade-left"
                    style={{ backgroundImage: "url('./traffic.jpg')" }}
                  ></div>
                  <div className="row vh-100 align-items-center">
                    <div className="col-lg-7 py-vh-6" data-aos="fade-right">
                      <h1 className="display-1 fw-bold mt-5">
                        Enhance T<span className="text-white">raffic</span>{" "}
                        Flow!
                      </h1>
                      <p className="lead ">
                        ATLS: For a smooth flow of traffic using adva
                        <span className="text-white">
                          nced technology to reduce
                        </span>{" "}
                        congestion.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Section */}
              <div
                className="py-vh-5 vh-100 d-flex align-items-center  h-100 p-5 overflow-hidden"
                id="services"
              >
                <div className="container">
                  <div className="row d-flex justify-content-end">
                    <div className="col-lg-8" data-aos="fade-down">
                      <h2 className="display-6 fw-semibold mb-5">
                        Our Services
                      </h2>
                    </div>
                  </div>
                  <div className="row d-flex align-items-center">
                    <div
                      className="col-md-6 col-lg-4"
                      data-aos="fade-up"
                      data-aos-delay="200"
                    >
                      <span className="h5 fw-lighter">01.</span>
                      <h3 className="py-5 border-top border-dark">
                        Innovative Traffic Solutions
                      </h3>
                      <p>
                        Advanced technology to streamline urban traffic
                        management.
                      </p>
                      <a href="#" className="link-fancy">
                        Learn more
                      </a>
                    </div>

                    <div
                      className="col-md-6 col-lg-4 py-vh-4"
                      data-aos="fade-up"
                      data-aos-delay="400"
                    >
                      <span className="h5 fw-lighter">02.</span>
                      <h3 className="py-5 border-top border-dark">
                        Data-Driven Insights
                      </h3>
                      <p>
                        Real-time analytics and insights to improve traffic
                        flow.
                      </p>
                      <a href="#" className="link-fancy">
                        Learn more
                      </a>
                    </div>

                    <div
                      className="col-md-6 col-lg-4 py-vh-6"
                      data-aos="fade-up"
                      data-aos-delay="600"
                    >
                      <span className="h5 fw-lighter">03.</span>
                      <h3 className="py-5 border-top border-dark">
                        Seamless User Experience
                      </h3>
                      <p>
                        Empowering users with accessible, easy-to-use
                        interfaces.
                      </p>
                      <a href="#" className="link-fancy">
                        Learn more
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              {/* About us section */}
              <div
                class="py-vh-4 bg-gray vw-100 vh-100 p-5 overflow-hidden"
                id="aboutus"
              >
                <div class="container">
                  <div class="row d-flex justify-content-between align-items-center">
                    <div class="col-lg-6">
                      <div class="row gx-5 d-flex">
                        <div class="col-md-11">
                          <div
                            class="shadow ratio ratio-16x9 rounded bg-cover bp-center align-self-end"
                            data-aos="fade-right"
                            style={{
                              backgroundImage: "url('./intersection.png')",
                            }}
                          ></div>
                        </div>
                        <div class="col-md-5 offset-md-1">
                          <div
                            class="shadow ratio ratio-1x1 rounded bg-cover mt-5 bp-center float-end"
                            data-aos="fade-up"
                            style={{
                              backgroundImage: "url('./intersection2.png')",
                            }}
                          ></div>
                        </div>
                        <div class="col-md-4 offset-md-1">
                          <div
                            class="shadow ratio ratio-1x1 rounded bg-cover mt-5 bp-center float-end"
                            data-aos="fade-up"
                            style={{ backgroundImage: "url('./people.jpg')" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div class="col-lg-4">
                      <h3
                        class="py-5 border-top border-dark"
                        data-aos="fade-left"
                      >
                        We did some interesting stuff in our field of work. For
                        example amoung of vehicle everyday to analyze the
                        traffic flow.
                      </h3>
                      <p data-aos="fade-left" data-aos-delay="200">
                        With the use of advanced technologies we can be able to
                        enhance the traffic flow and address traffic congestion.
                      </p>
                      <p>
                        <a
                          href="#"
                          class="link-fancy"
                          data-aos="fade-left"
                          data-aos-delay="400"
                        >
                          Learn more
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Contact Section */}
              <div className="py-vh-5 w-100 overflow-hidden p-5 " id="contact">
                <div className="container">
                  <div className="row d-flex justify-content-between align-items-center">
                    <div className="col-lg-5" data-aos="fade-right">
                      <h3 className="py-5 border-top border-dark">
                        Our magic numbers
                      </h3>
                    </div>
                    <div className="col-lg-6">
                      <div className="row">
                        <div className="col-12" data-aos="fade-down">
                          <h2 className="display-6 mb-5">Contact Us</h2>
                        </div>
                        <div className="row">
                          <div className="col-md-6" data-aos="fade-up">
                            <p className="fs-6 fw-semibold">Email</p>
                            <p className="text-black-50">
                              <a
                                href="#"
                                class="link-fancy link-dark"
                                data-aos="fade-left"
                                data-aos-delay="400"
                              >
                               <i className="fs-5 bi bi-envelope-at"></i> atls@gmail.com
                              </a>
                            </p>
                          </div>
                          <div className="col-md-6" data-aos="fade-up">
                            <p className="fs-6 fw-semibold">Social</p>
                            <div className="d-flex">
                              <a
                                href="https://web.facebook.com/ramel.panis.1/"
                                class="link-fancy link-dark"
                                data-aos="fade-left"
                                data-aos-delay="400"
                              >
                                <p className="text-primary fs-3 me-2 bi bi-facebook"></p>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Section */}
              <div className="small py-vh-3 w-100 p-5 bg-secondary text-white">
                <div className="container">
                  <div className="row">
                    <div
                      className="col-md-6 col-lg-4 border-end"
                      data-aos="fade-up"
                    >
                      <h3 className="h5 my-2">Services</h3>
                      <p>
                        Efficient service for all necessary traffic issues and concern.
                      </p>
                    </div>
                    <div
                      className="col-md-6 col-lg-4 border-end"
                      data-aos="fade-up"
                      data-aos-delay="200"
                    >
                      <h3 className="h5 my-2">Verified Systems</h3>
                      <p>
                        Our solutions are tested and certified to ensure
                        reliability.
                      </p>
                    </div>
                    <div
                      className="col-md-6 col-lg-4"
                      data-aos="fade-up"
                      data-aos-delay="400"
                    >
                      <h3 className="h5 my-2">Online Support</h3>
                      <p>
                        24/7 support available to assist with any inquiries or
                        issues.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="container py-vh-3 border-top"
                data-aos="fade"
                data-aos-delay="200"
              ></div>
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
    </>
  );
};

export default LandingPage;
