import React, { useEffect, useState } from "react";
import "./LandingPage.css";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    document.title = "ATLS | Welcome ";
  }, []);

  // To navigate screens
  const navigate = useNavigate();

  const handleClick = (event, item) => {
    if (item === "landingPage") {
      navigate("/landingPage");
    }
    if (item === "/") {
      navigate("/");
    }
  };
  return (
    <>
      <div className="container-fluid vw-100">
        <div className="row vh-100">
          <nav
            id="navScroll"
            class="navbar navbar-expand-lg navbar-light fixed-top bg-white"
            tabindex="0"
          >
            <div class="container">
              <a class="navbar-brand pe-4 fs-4" href="/">
                <svg
                  width="32"
                  height="32"
                  fill="currentColor"
                  class="bi bi-layers-half"
                  viewbox="0 0 16 16"
                ></svg>
                <span class="ms-1 fw-bolder">ATLS</span>
              </a>

              <button
                class="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span class="navbar-toggler-icon"></span>
              </button>
              <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                  <li class="nav-item">
                    <a
                      class="nav-link"
                      href="#services"
                      aria-label="Brings you to the frontpage"
                    >
                      Services
                    </a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="#aboutus">
                      About us
                    </a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="#numbers">
                      Numbers
                    </a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="#gallery">
                      Gallery
                    </a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="#workwithus">
                      Work with us
                    </a>
                  </li>
                </ul>
                <i className="bi bi-person-fill me-2 pb-1 fs-4"></i>
                <a
                  class="link-dark pb-1 link-fancy me-2 cursor-pointer"
                  onClick={(e)=>handleClick(e,"/")}
                >
                 Sign In
                </a>
              </div>
            </div>
          </nav>
          <div className="col-12 d-flex align-items-center justify-content-center">
            <div>
              <div class="w-100 overflow-hidden bg-gray-100" id="top">
                <div class="container position-relative">
                  <div
                    class="col-12 col-lg-8 mt-0 h-100 position-absolute top-0 end-0 bg-cover"
                    data-aos="fade-left"
                  ></div>
                  <div class="row">
                    <div
                      class="col-lg-7 py-vh-6 position-relative"
                      data-aos="fade-right"
                    >
                      <h1 class="display-1 fw-bold mt-5">
                        Enhance traffic flow!
                      </h1>
                      <p class="lead">
                        ATLS, to have a smooth flow of traffic using advanced technology and lessen the traffic congestions.
                      </p>
                    
                    </div>
                  </div>
                </div>
              </div>

              <div class="py-vh-5 w-100 overflow-hidden" id="services">
                <div class="container">
                  <div class="row d-flex justify-content-end">
                    <div class="col-lg-8" data-aos="fade-down">
                      <h2 class="display-6">
                        Okay, there are three really good reasons for us. There
                        are no more than three, but we think three is a
                        reasonable good number of good stuff.
                      </h2>
                    </div>
                  </div>
                  <div class="row d-flex align-items-center">
                    <div
                      class="col-md-6 col-lg-4"
                      data-aos="fade-up"
                      data-aos-delay="200"
                    >
                      <span class="h5 fw-lighter">01.</span>
                      <h3 class="py-5 border-top border-dark">
                        We rented this fancy startup office in an old factory
                        building.
                      </h3>
                      <p>
                        Lorem, ipsum dolor sit amet consectetur adipisicing
                        elit. Minus culpa, voluptatibus ex itaque, sapiente a
                        consequatur inventore beatae, ipsam debitis omnis
                        consequuntur iste asperiores. Similique quisquam debitis
                        corrupti deserunt, dolor.
                      </p>
                      <a href="#" class="link-fancy">
                        Learn more{" "}
                      </a>
                    </div>

                    <div
                      class="col-md-6 col-lg-4 py-vh-4 pb-0"
                      data-aos="fade-up"
                      data-aos-delay="400"
                    >
                      <span class="h5 fw-lighter">02.</span>
                      <h3 class="py-5 border-top border-dark">
                        We don´t know exactly what we are doing. But thats good
                        because we can´t break something intentionally.
                      </h3>
                      <p>
                        Lorem, ipsum dolor sit adipisicing elit. Minus culpa,
                        voluptatibus ex itaque, sapiente a consequatur inventore
                        beatae, ipsam debitis omnis consequuntur iste
                        asperiores. Similique quisquam debitis corrupti
                        deserunt, dolor.
                      </p>
                      <a href="#" class="link-fancy">
                        Learn more{" "}
                      </a>
                    </div>

                    <div
                      class="col-md-6 col-lg-4 py-vh-6 pb-0"
                      data-aos="fade-up"
                      data-aos-delay="600"
                    >
                      <span class="h5 fw-lighter">03.</span>
                      <h3 class="py-5 border-top border-dark">
                        There is no real number three reason. So please read
                        again number one and two.
                      </h3>
                      <p>
                        Lorem, ipsum dolor sit amet consectetur adipisicing
                        elit. Minus culpa, voluptatibus ex itaque, sapiente a
                        consequatur inventore beatae, ipsam debitis omnis
                        consequuntur iste asperiores. Similique quisquam debitis
                        corrupti deserunt, dolor.
                      </p>
                      <a href="#" class="link-fancy">
                        Learn more{" "}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="py-vh-4 bg-gray-100 w-100 overflow-hidden"
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
                          ></div>
                        </div>
                        <div class="col-md-5 offset-md-1">
                          <div
                            class="shadow ratio ratio-1x1 rounded bg-cover mt-5 bp-center float-end"
                            data-aos="fade-up"
                          ></div>
                        </div>
                        <div class="col-md-6">
                          <div
                            class="col-12 shadow ratio rounded bg-cover mt-5 bp-center"
                            data-aos="fade-left"
                          
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
                        example we collect a lot of these free photos and use
                        them on our website.
                      </h3>
                      <p data-aos="fade-left" data-aos-delay="200">
                        Donec id elit non mi porta gravida at eget metus. Fusce
                        dapibus, tellus ac cursus commodo, tortor mauris
                        condimentum nibh, ut fermentum massa justo sit amet
                        risus.
                      </p>
                      <p>
                        <a
                          href="#"
                          class="link-fancy link-dark"
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

              <div class="py-vh-5 w-100 overflow-hidden" id="numbers">
                <div class="container">
                  <div class="row d-flex justify-content-between align-items-center">
                    <div class="col-lg-5">
                      <h3
                        class="py-5 border-top border-dark"
                        data-aos="fade-right"
                      >
                        Our magic numbers
                      </h3>
                    </div>
                    <div class="col-lg-6">
                      <div class="row">
                        <div class="col-12">
                          <h2 class="display-6 mb-5" data-aos="fade-down">
                            There are some important numbers for us. They are
                            just numbers without any meaning, but we just love
                            them.
                          </h2>
                        </div>
                        <div class="col-lg-6" data-aos="fade-up">
                          <div class="display-1 fw-bold py-4">42%</div>
                          <p class="text-black-50">
                            Donec id elit non mi porta gravida at eget metus.
                            Fusce dapibus, tellus ac cursus commodo, tortor
                            mauris condimentum nibh, ut fermentum massa justo
                            sit amet risus. Etiam porta sem malesuada magna
                            mollis euismod. Donec sed odio dui.
                          </p>
                        </div>
                        <div class="col-lg-6" data-aos="fade-up">
                          <div class="display-1 fw-bold py-4">+300</div>
                          <p class="text-black-50">
                            Donec id elit non mi porta gravida at eget metus.
                            Fusce dapibus, tellus ac cursus commodo, tortor
                            mauris condimentum nibh, ut fermentum massa justo
                            sit amet risus. Etiam porta sem malesuada magna
                            mollis euismod. Donec sed odio dui.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="position-relative overflow-hidden w-100 bg-light"
                id="gallery"
              >
                <div class="container-fluid">
                  <div class="row overflow-scroll">
                    <div class="col-12">
                      <div class="row vw-100 px-0 py-vh-5 d-flex align-items-center scrollx">
                        <div class="col-md-2" data-aos="fade-up">
                          <img
                            class="rounded shadow img-fluid"
                            alt="nice gallery image"
                            width="512"
                            height="341"
                          />
                        </div>

                        <div
                          class="col-md-2"
                          data-aos="fade-up"
                          data-aos-delay="200"
                        >
                          <img
                            class="img-fluid rounded shadow"
                            alt="nice gallery image"
                            width="1164"
                            height="776"
                          />
                        </div>

                        <div
                          class="col-md-3"
                          data-aos="fade-up"
                          data-aos-delay="400"
                        >
                          <img
                            src="img/webp/people2.webp"
                            class="img-fluid rounded shadow"
                            alt="nice gallery image"
                            width="844"
                            height="1054"
                          />
                        </div>

                        <div
                          class="col-md-3"
                          data-aos="fade-up"
                          data-aos-delay="600"
                        >
                          <img
                            class="img-fluid rounded shadow"
                            alt="nice gallery image"
                            width="844"
                            height="562"
                          />
                        </div>

                        <div
                          class="col-md-2"
                          data-aos="fade-up"
                          data-aos-delay="800"
                        >
                          <img
                            src="img/webp/people23.webp"
                            class="rounded shadow img-fluid"
                            alt="nice gallery image"
                            width="512"
                            height="341"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="container py-vh-4 w-100 overflow-hidden">
                <div class="row d-flex justify-content-center align-items-center">
                  <div class="col-lg-5">
                    <h3
                      class="py-5 border-top border-dark"
                      data-aos="fade-right"
                    >
                      What our clients say
                    </h3>
                  </div>
                  <div class="col-md-7" data-aos="fade-left">
                    <blockquote>
                      <div class="fs-4 my-3 fw-light pt-4 border-bottom pb-3">
                        “I´am the CEO of this company. So maybe you think "he
                        will tell us something super awesome about it only". But
                        no. Its a really strange place to work with creepy
                        people all around. They do some computer stuff I don´t
                        understand. But I wear expensive Glasses and a Patagonia
                        Hoodie. So I´am fine with it.”
                      </div>
                      <img
                        width="64"
                        height="64"
                        class="img-fluid rounded-circle me-3"
                        alt=""
                        data-aos="fade"
                      />
                      <span>
                        <span class="fw-bold">John Doe,</span> CEO of Stride
                        Ltd.
                      </span>
                    </blockquote>
                  </div>
                </div>
              </div>

              <div
                class="py-vh-6 bg-gray-900 text-light w-100 overflow-hidden"
                id="workwithus"
              >
                <div class="container">
                  <div class="row d-flex justify-content-center">
                    <div class="row d-flex justify-content-center text-center">
                      <div class="col-lg-8 text-center" data-aos="fade">
                        <p class="text-secondary lead">
                          Let´s start a project together!
                        </p>
                        <h2 class="display-6 mb-5">
                          Hell no! This button is linked to a none working
                          contact form. A none working form without any user
                          feedback. So you might think you done something wrong.
                          But in reality we just don´t want to start anything
                          with you or anyone else.
                        </h2>
                      </div>
                      <div class="col-12">
                        <a
                          href="#"
                          class="btn btn-warning btn-xl shadow me-3 mt-4"
                          data-aos="fade-down"
                        >
                          Get in contact
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-light w-100 overflow-hidden" id="testimonials">
                <div class="container py-vh-6">
                  <div class="row d-flex justify-content-center">
                    <div class="col-12 col-lg-10 col-xl-8 text-center">
                      <h2 class="display-6">
                        Loved by people all around the globe
                      </h2>
                      <p class="lead">
                        Our spaces and offices are soooooo lovely, no one would
                        give us a negative rating! And look at these trustworthy
                        avatar pictures! Trust us!
                      </p>
                    </div>
                    
                  </div>
                </div>
              </div>

              <div class="small py-vh-3 w-100 overflow-hidden">
                <div class="container">
                  <div class="row">
                    <div
                      class="col-md-6 col-lg-4 border-end"
                      data-aos="fade-up"
                    >
                      <div class="d-flex">
                        <div class="col-md-3 flex-fill pt-3 pe-3 pe-md-0">
                         
                        </div>
                        <div class="col-md-9 flex-fill">
                          <h3 class="h5 my-2">Delivery Service</h3>
                          <p>
                            If we had any physical goods we would deliver them
                            to your door steps. Of course in time and to the
                            right adress. But we have no products...
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      class="col-md-6 col-lg-4 border-end"
                      data-aos="fade-up"
                      data-aos-delay="200"
                    >
                      <div class="d-flex">
                        <div class="col-md-3 flex-fill pt-3 pt-3 pe-3 pe-md-0">
                         
                        </div>
                        <div class="col-md-9 flex-fill">
                          <h3 class="h5 my-2">Independently Checked</h3>
                          <p>
                            Maybe we would do something to ensure that you get
                            what you ordered. But you can´t order anything here,
                            so we can give you a 100% gurantee that anything
                            would be great!
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      class="col-md-6 col-lg-4"
                      data-aos="fade-up"
                      data-aos-delay="400"
                    >
                      <div class="d-flex">
                        <div class="col-md-3 flex-fill pt-3 pt-3 pe-3 pe-md-0">
                         
                        </div>
                        <div class="col-md-9 flex-fill">
                          <h3 class="h5 my-2">Online Support</h3>
                          <p>
                            Okay, we have this crazy online support form. Fill
                            it out and the content will be mailed to you as PDF.
                            Print it out. Than send it via Fax to our super
                            duper hidden Fax number.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="container py-vh-3 border-top"
                data-aos="fade"
                data-aos-delay="200"
              >
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
    </>
  );
};

export default LandingPage;
