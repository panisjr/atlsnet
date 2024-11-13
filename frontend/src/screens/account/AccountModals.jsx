import React from "react";

const AccountModals = ({
  selected,
  setSelected,
  isPasswordVisible,
  togglePasswordVisibility,
  handleEdit,
}) => {
  //      {/* Update Account Modal */}
  //      <UpdateAccountModal
  //      selected={selected}
  //      setSelected={setSelected}
  //      isPasswordVisible={isPasswordVisible}
  //      togglePasswordVisibility={togglePasswordVisibility}
  //      handleEdit={handleEdit}
  //    />
  return (
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
                    name="user_id"
                    value={selected.user_id}
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        user_id: e.target.value,
                      })
                    }
                    placeholder="User ID"
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
                    type={isPasswordVisible ? "text" : "password"}
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
  );
};

export default AccountModals;
