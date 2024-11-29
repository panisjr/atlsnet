import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DataTable from "./DataTable"; // Import the DataTable component
import "../css/SideNavbar.css";
import ToastNotification from "../ToastNotification";
import LogoutModal from "../LogoutModal";
import SideNavbar from "../SideNavbar";
import AOS from "aos";
import config from '../../config'; 
const AccountManagement = () => {
  const apiUrl = config.API_URL;
  useEffect(()=>{
    AOS.init({duration:500, easing:"ease-in-out", once:false})
  },[])
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [selected, setSelected] = useState({
    user_id: "",
    firstname: "",
    middlename: "",
    lastname: "",
    email: "",
    contact: "",
    address: "",
    newPassword: "",
    role: "",
  });

  const [firstname, setFirstname] = useState("");
  const [middlename, setMiddlename] = useState("");
  const [lastname, setLastname] = useState("");
  const [user_id, setUserID] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");
  const [status, setStatus] = useState("Active");
  const [active, setActive] = useState("accounts");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const handleRoleChange = (role) => {
    setRole(role);
  };

  // To register a new user
  const handleRegister = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await axios.post(
        `${apiUrl}/users/create_user`,
        {
          user_id,
          firstname,
          middlename,
          lastname,
          email,
          contact,
          address,
          password,
          role,
          status,
        }
      );
      setShowMessage(true);
      setSuccess(response.data.message);
      setFirstname("");
      setMiddlename("");
      setLastname("");
      setUserID("");
      setEmail("");
      setContact("");
      setAddress("");
      setPassword("");
      fetchUsers();
      setTimeout(() => {
        setShowMessage(false);
        setSuccess(null);
        fetchUsers();
      }, 3000);
    } catch (err) {
      setShowMessage(true);
      setError(err.response?.data?.error);
      setTimeout(() => {
        setShowMessage(false);
        setError(null);
      }, 3000);
    }
  };
  // To navigate screens
  const navigate = useNavigate();

  // Fetch users data from the backend
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${apiUrl}/users/get_users`);
      setUsers(response.data.users);
      setFilteredUsers(response.data.users); // Initialize filteredUsers
    } catch (error) {
      setError(error.message || "An error occurred while fetching data.");
    }
  };

  // Handle user search
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    // Filter users based on the search query
    const filtered = users.filter((user) =>
      `${user.firstname} ${user.middlename} ${user.lastname}${user.user_id}${user.email}${user.contact}${user.address}${user.role}${user.status}`
        .toLowerCase()
        .includes(query)
    );
    setFilteredUsers(filtered);
  };
  // To Delete User
  const handleSelectedUser = (user) => {
    setSelected(user);
  };
  // To Delete User
  const handleDelete = async (userID) => {
    try {
      const token = sessionStorage.getItem("token"); // Ensure this key matches the one used when storing the token

      if (!token) {
        setShowMessage(true);
        setError("Token is missing!");
        setTimeout(() => {
          setShowMessage(false);
          setError(null);
        }, 3000);
      }

      const response = await axios.delete(
        `${apiUrl}/users/delete_user/${userID}`,
        {
          headers: {
            Authorization: `${token}`, // Ensure the token is prefixed with "Bearer " if your backend expects it
          },
        }
      );

      setUsers(users.filter((user) => user.id !== userID));
      setFilteredUsers(filteredUsers.filter((user) => user.id !== userID));
      setShowMessage(true);
      setSuccess(response.data.message);
      setSelected(null);
      setTimeout(() => {
        setShowMessage(false);
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setShowMessage(true);
      setError(
        error.response?.data?.error || "An error occurred while deleting data."
      );
      setTimeout(() => {
        setShowMessage(false);
        setError(null);
      }, 3000);
    }
  };

  // To Edit User
  const handleEdit = async (userID) => {
    try {
      // Send the updated user data in the PUT request
      const response = await axios.put(
        `${apiUrl}/users/update_user/${userID}`,
        selected
      );
      setUsers(users.filter((user) => user.id !== userID));
      setFilteredUsers(filteredUsers.filter((user) => user.id !== userID));
      setShowMessage(true);
      setSuccess(response.data.message);
      setSelected(null);
      fetchUsers();
      // Trigger the modal close by simulating the dismiss action
      const closeButton = document.querySelector('[data-bs-dismiss="modal"]');
      if (closeButton) {
        closeButton.click(); // Simulate the dismiss button click
      }
      setTimeout(() => {
        setShowMessage(false);
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setShowMessage(true);
      setError(err.response?.data?.error);
      setTimeout(() => {
        setShowMessage(false);
        setError(null);
      }, 3000);
    }
  };
  // Deactivate and Activate User
  const handleDeactivate = async (userID) => {
    try {
      const token = sessionStorage.getItem("token");

      const response = await axios.put(
        `${apiUrl}/users/deactivate_user/${userID}`,
        {},
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      fetchUsers();
      setShowMessage(true);
      setSuccess(response.data.message);
      setTimeout(() => {
        setShowMessage(false);
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setShowMessage(true);
      setError(error.response?.data?.error);
      setTimeout(() => {
        setShowMessage(false);
        setError(null);
      }, 3000);
    }
  };
  const handleActivate = async (userID) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(
        `${apiUrl}/users/activate_user/${userID}`,
        {},
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      fetchUsers();
      setShowMessage(true);
      setSuccess(response.data.message);
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    } catch (error) {
      setShowMessage(true);
      setError(error.response.data.error);
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    }
  };

  useEffect(() => {
    fetchUsers();
    document.title = "ATLS | Account Management";
  }, []);

  const logout = () => {
    sessionStorage.clear();
    navigate("/");
  };
  // For underline of current screen in in the navbar
  const handleClick = (event, item) => {
    setActive(item);
    event.preventDefault();
    if (item === "dashboard") {
      navigate("/dashboard");
    }
    if (item === "monitoring") {
      navigate("/monitoring");
    }
    if (item === "weekPlanSetting") {
      navigate("/weekPlanSetting");
    }
    if (item === "violationRecord") {
      navigate("/violationRecord");
    }
  };
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  return (
    <>
      <div className="container-fluid vw-100">
        <div className="row">
          <div className="col-2 col-md-2">
            <SideNavbar active={active} handleClick={handleClick} />
          </div>
          <div className="col-10 col-md-10 vh-100 p-4">
            <div className="d-flex align-items-center justify-content-start mb-3">
              <h6 className="p-3">
                <span className="text-secondary">Pages</span> / Account
                Management
              </h6>
              <button
                className="btn btn-secondary"
                data-bs-toggle="modal"
                data-bs-target="#createAccountStaticBackdrop"
              >
                <i class="bi bi-person-plus"></i>
              </button>
              <input
                className="form-control searchBar"
                type="search"
                placeholder="Search"
                aria-label="Search"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            {/* {error && <p style={{ color: "red" }}>{error}</p>} */}
            <DataTable
              users={filteredUsers} // Pass filtered users to DataTable
              onEdit={handleSelectedUser}
              onDelete={handleSelectedUser}
              onActivate={handleSelectedUser}
              onDeactivate={handleSelectedUser}
            />
            <ToastNotification
              showMessage={showMessage}
              error={error}
              success={success}
            />
            <LogoutModal logout={logout} />
            {/* Update an Account Modal */}
            <div
              className="modal fade"
              id="editBackDrop"
              data-bs-backdrop="static"
              data-bs-keyboard="false"
              tabIndex="-1"
              aria-labelledby="staticBackdropLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-centered">
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
                    <h6 id="staticBackdropLabel">Update an Account</h6>
                    {selected ? (
                      <form>
                        <div className="input-group mb-3">
                          <input
                            type="text"
                            className="form-control fs-6"
                            name="firstname"
                            value={selected.user_id}
                            onChange={(e) =>
                              setSelected({
                                ...selected,
                                user_id: e.target.value,
                              })
                            }
                            placeholder="First Name"
                            required
                          />
                        </div>
                        <div className="input-group mb-3">
                          <input
                            type="text"
                            className="form-control fs-6"
                            name="firstname"
                            value={selected.firstname}
                            onChange={(e) =>
                              setSelected({
                                ...selected,
                                firstname: e.target.value,
                              })
                            }
                            placeholder="First Name"
                            required
                          />
                          <input
                            type="text"
                            className="form-control fs-6"
                            name="middlename"
                            value={selected.middlename}
                            onChange={(e) =>
                              setSelected({
                                ...selected,
                                middlename: e.target.value,
                              })
                            }
                            placeholder="M.N. (Optional)"
                          />
                          <input
                            type="text"
                            className="form-control fs-6"
                            name="lastname"
                            value={selected.lastname}
                            onChange={(e) =>
                              setSelected({
                                ...selected,
                                lastname: e.target.value,
                              })
                            }
                            placeholder="Last Name"
                            required
                          />
                        </div>
                        <div className="input-group mb-3">
                          <input
                            type="email"
                            className="form-control fs-6"
                            name="email"
                            value={selected.email}
                            onChange={(e) =>
                              setSelected({
                                ...selected,
                                email: e.target.value,
                              })
                            }
                            placeholder="Email"
                            required
                          />
                        </div>
                        <div className="input-group mb-3">
                          <input
                            type="text"
                            className="form-control fs-6"
                            name="contact"
                            value={selected.contact}
                            onChange={(e) =>
                              setSelected({
                                ...selected,
                                contact: e.target.value,
                              })
                            }
                            placeholder="Contact Number"
                            required
                          />
                        </div>
                        <div className="input-group mb-3">
                          <input
                            type="text"
                            className="form-control fs-6"
                            name="address"
                            value={selected.address}
                            onChange={(e) =>
                              setSelected({
                                ...selected,
                                address: e.target.value,
                              })
                            }
                            placeholder="Address"
                            required
                          />
                        </div>
                        <div className="input-group mb-3">
                          <input
                            type={isPasswordVisible ? "text" : "password"} // Toggle between 'text' and 'password'
                            className="form-control fs-6"
                            name="changePassword"
                            value={selected.newPassword}
                            onChange={(e) =>
                              setSelected({
                                ...selected,
                                newPassword: e.target.value,
                              })
                            }
                            placeholder="Change Password"
                            required
                          />
                          <button
                            type="button"
                            className="input-group-text"
                            onClick={togglePasswordVisibility}
                            style={{ cursor: "pointer" }}
                          >
                            <i
                              className={`bi ${
                                isPasswordVisible ? "bi-eye" : "bi-eye-slash"
                              }`}
                            ></i>
                          </button>
                        </div>
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
                            type="button"
                            onClick={() => handleEdit(selected.id)}
                            className="btn btn-success"
                          >
                            <i className="bi bi-check me-2"></i>
                            Yes, Update
                          </button>
                        </div>
                      </form>
                    ) : (
                      <p>No user found.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Create an Account Modal */}
            <div
              className="modal fade"
              id="createAccountStaticBackdrop"
              data-bs-backdrop="static"
              data-bs-keyboard="false"
              tabIndex="-1"
              aria-labelledby="staticBackdropLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog" style={{ border: "none" }}>
                <div className="modal-content">
                  <div className="modal-header align-items-center justify-content-start">
                    <div className="align-items-center justify-content-center">
                      <h5 className="fw-semibold mt-3">Create account</h5>
                    </div>
                  </div>
                  <div className="modal-body">
                    <h6 id="staticBackdropLabel">Fill in the details</h6>
                    <form onSubmit={handleRegister}>
                      <div className="input-group mb-3">
                        <input
                          type="text"
                          className="form-control fs-6"
                          name="user_id"
                          value={user_id}
                          onChange={(e) => setUserID(e.target.value)}
                          placeholder="User ID"
                          required
                        />
                      </div>
                      <div className="input-group mb-3">
                        <input
                          type="text"
                          className="form-control fs-6"
                          name="firstname"
                          value={firstname}
                          onChange={(e) => setFirstname(e.target.value)}
                          placeholder="First Name"
                          required
                        />
                        <input
                          type="text"
                          className="form-control fs-6"
                          name="middlename"
                          value={middlename}
                          onChange={(e) => setMiddlename(e.target.value)}
                          placeholder="M.N. (Optional)"
                        />
                        <input
                          type="text"
                          className="form-control fs-6"
                          name="lastname"
                          value={lastname}
                          onChange={(e) => setLastname(e.target.value)}
                          placeholder="Last Name"
                          required
                        />
                      </div>

                      <div className="input-group mb-3">
                        <input
                          type="email"
                          className="form-control fs-6"
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email"
                          required
                        />
                      </div>
                      <div className="input-group mb-3">
                        <input
                          type="text"
                          className="form-control fs-6"
                          name="contact"
                          value={contact}
                          onChange={(e) => setContact(e.target.value)}
                          placeholder="Contact Number"
                          required
                        />
                      </div>
                      <div className="input-group mb-3">
                        <input
                          type="text"
                          className="form-control fs-6"
                          name="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Address"
                          required
                        />
                      </div>
                      <div className="input-group mb-3">
                        <input
                          type={isPasswordVisible ? "text" : "password"} // Toggle between 'text' and 'password'
                          className="form-control fs-6"
                          name="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          required
                        />
                        <button
                          type="button"
                          className="input-group-text"
                          onClick={togglePasswordVisibility}
                          style={{ cursor: "pointer" }}
                        >
                          <i
                            className={`bi ${
                              isPasswordVisible ? "bi-eye" : "bi-eye-slash"
                            }`}
                          ></i>
                        </button>
                      </div>
                      <div className="form-group mb-3">
                        <label htmlFor="role">Role</label>
                        <select
                          id="role"
                          className="form-select"
                          value={role}
                          onChange={(e) => handleRoleChange(e.target.value)}
                        >
                          <option value="User">User</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>

                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          data-bs-dismiss="modal"
                        >
                          <i className="bi bi-x me-2"></i>
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-success">
                          <i className="bi bi-check2 me-2"></i>
                          Create
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Delete Confirmation Modal */}
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
                  <div className="modal-header bg-danger border-bottom-0 text-white align-items-center justify-content-center">
                    <div className="d-flex align-items-center justify-content-center">
                      <h4 className="mt-3 fw-medium">Confirmation</h4>
                    </div>
                  </div>
                  {selected ? (
                    <div className="modal-body">
                      <div className="text-center">
                        <p
                          className="bi bi-exclamation-circle text-danger"
                          style={{ fontSize: "3rem" }}
                        ></p>
                        <p className="fw-medium">
                          Are you sure you want to delete this account?
                        </p>
                      </div>

                      <strong className="mt-2">Account Information</strong>
                      <p>
                        <strong>ID:</strong> {selected.user_id}
                      </p>
                      <p>
                        <strong>Name:</strong> {selected.firstname}{" "}
                        {selected.middlename} {selected.lastname}
                      </p>
                      <p>
                        <strong>Email:</strong> {selected.email}
                      </p>
                      <p>
                        <strong>Contact:</strong> {selected.contact}
                      </p>
                      <p>
                        <strong>Address:</strong> {selected.address}
                      </p>
                      <p>
                        <strong>Role:</strong> {selected.role}
                      </p>
                      <p>
                        <strong>Status:</strong> {selected.status}
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
                          onClick={() => handleDelete(selected.id)}
                          className="btn btn-danger"
                          data-bs-dismiss="modal"
                        >
                          <i className="bi bi-check me-2"></i>
                          Yes, Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p>No user selected.</p>
                  )}
                </div>
              </div>
            </div>
            {/* Activate and Deaction Confirmation Modal */}
            <div
              className="modal fade"
              id="statusBackDrop"
              data-bs-backdrop="static"
              data-bs-keyboard="false"
              tabIndex="-1"
              aria-labelledby="staticBackdropLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div
                    className={`modal-header border-bottom-0 text-white align-items-center justify-content-center ${
                      selected ? (
                        selected.status == "Active" ? (
                          "bg-orange"
                        ) : (
                          "bg-success"
                        )
                      ) : (
                        <i>No user</i>
                      )
                    }`}
                  >
                    <div className=" align-items-center justify-content-center">
                      {selected ? (
                        <h4 className="fw-medium mt-2">
                          {selected.status == "Active"
                            ? "Deactivate Confirmation"
                            : "Activate Confirmation"}
                        </h4>
                      ) : (
                        <i>No user</i>
                      )}
                    </div>
                  </div>
                  {selected ? (
                    <div className="modal-body">
                      <div className="text-center">
                        <p
                          className={`bi bi-exclamation-circle ${
                            selected.status == "Active"
                              ? "font-orange"
                              : "text-success"
                          }`}
                          style={{ fontSize: "3rem" }}
                        ></p>
                        <p className="fw-semibold">
                          {selected.status == "Active"
                            ? "Are you sure you want to deactivate this account?"
                            : "Are you sure you want to activate this account?"}
                        </p>
                      </div>
                      <h6 className="mt-2 fw-meduim">Account Information</h6>
                      <p>
                        <span className="fw-medium">Name:</span>{" "}
                        {selected.firstname} {selected.middlename}{" "}
                        {selected.lastname}
                      </p>
                      <p>
                        <span className="fw-medium">Email:</span>{" "}
                        {selected.email}
                      </p>
                      <p>
                        <span className="fw-medium">Contact:</span>{" "}
                        {selected.contact}
                      </p>
                      <p>
                        <span className="fw-medium">Address:</span>{" "}
                        {selected.address}
                      </p>
                      <p>
                        <span className="fw-medium">Role:</span> {selected.role}
                      </p>
                      <p>
                        <span className="fw-medium">Status:</span>{" "}
                        {selected.status}
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
                        {selected.status == "Active" ? (
                          <button
                            onClick={() => handleDeactivate(selected.id)}
                            className={`btn ${
                              selected.status == "Active"
                                ? "btn-orange"
                                : "btn-success"
                            }`}
                            data-bs-dismiss="modal"
                          >
                            <i className="bi bi-check me-2"></i>
                            Yes, Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(selected.id)}
                            className={`btn ${
                              selected.status == "Active"
                                ? "btn-orange"
                                : "btn-success"
                            }`}
                            data-bs-dismiss="modal"
                          >
                            <i className="bi bi-check me-2"></i>
                            Yes, Activate
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p>No user selected.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountManagement;
