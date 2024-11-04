import React, { useState } from 'react';

const AccountModals = () => {
  const [selected, setSelected] = useState(null);
  const [user_id, setUserID] = useState('');
  const [firstname, setFirstname] = useState('');
  const [middlename, setMiddlename] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const handleEdit = (id) => {
    // Implement edit logic here
  };

  const handleRegister = (e) => {
    e.preventDefault();
    // Implement register logic here
  };

  const handleDelete = (id) => {
    // Implement delete logic here
  };

  const handleDeactivate = (id) => {
    // Implement deactivate logic here
  };

  const handleActivate = (id) => {
    // Implement activate logic here
  };

  const handleRoleChange = (value) => {
    setRole(value);
  };

  return (
    <>
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
              <h6 id="staticBackdropLabel">Update an Account</h6>
              {selected ? (
                <form>
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control fs-6"
                      name="user_id"
                      value={selected.user_id}
                      readOnly
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
                      type={isPasswordVisible ? 'text' : 'password'}
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
                      style={{ cursor: 'pointer' }}
                    >
                      <i
                        className={`bi ${isPasswordVisible ? 'bi-eye-slash' : 'bi-eye'}`}
                      ></i>
                    </button>
                  </div>
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
                      onClick={() => handleEdit(selected.id)}
                      className="btn btn-success"
                      data-bs-dismiss="modal"
                    >
                      Update
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
              <h6 id="staticBackdropLabel">Create an Account</h6>
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
                    type={isPasswordVisible ? 'text' : 'password'}
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
                    style={{ cursor: 'pointer' }}
                  >
                    <i
                      className={`bi ${isPasswordVisible ? 'bi-eye-slash' : 'bi-eye'}`}
                    ></i>
                  </button>
                </div>
                <div className="input-group mb-3">
                  <label htmlFor="role" className="form-label">
                    Role
                  </label>
                  <select
                    id="role"
                    className="form-select"
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                    <option value="Moderator">Moderator</option>
                  </select>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    data-bs-dismiss="modal"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <div
        className="modal fade"
        id="deleteAccountStaticBackdrop"
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
              <h6 id="staticBackdropLabel">Delete Account</h6>
              <p>Are you sure you want to delete this account?</p>
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
                  onClick={() => handleDelete(selected.id)}
                  className="btn btn-danger"
                  data-bs-dismiss="modal"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activate/Deactivate Account Modal */}
      <div
        className="modal fade"
        id="toggleAccountStaticBackdrop"
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
              <h6 id="staticBackdropLabel">
                {selected && selected.active
                  ? 'Deactivate Account'
                  : 'Activate Account'}
              </h6>
              <p>
                Are you sure you want to{' '}
                {selected && selected.active ? 'deactivate' : 'activate'} this account?
              </p>
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
                  onClick={() =>
                    selected && selected.active
                      ? handleDeactivate(selected.id)
                      : handleActivate(selected.id)
                  }
                  className="btn btn-warning"
                  data-bs-dismiss="modal"
                >
                  {selected && selected.active ? 'Deactivate' : 'Activate'} Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountModals;
