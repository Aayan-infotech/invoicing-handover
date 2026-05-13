import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Topbar.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import axios from "axios";
import { images, links } from "../../contstants";
import { useDispatch , useSelector } from "react-redux";
import { userActions } from "../../store/reducers/userReducers";
export default function Topbar() {
  const dispatch = useDispatch();
  const userState = useSelector((state) => state.user);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const handleClose = () => setShowChangePasswordModal(false);
  const handleShow = () => setShowChangePasswordModal(true);
  const [showProfile, setShowProfile] = useState(false);

  const [user, setUser] = useState({
    name: "Admin",
    avatar: images.placeholder,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const name = userState.userInfo.user.name || "Admin";
    const avatar = userState.userInfo.user.profile_image || images.placeholder;
    const email = userState.userInfo.user.email || "Not provided";
    const mobile = userState.userInfo.user.mobile || "Not provided";
    const username = userState.userInfo.user.username || "Not provided";
    setUser({ name, avatar, email, mobile, username });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    dispatch(userActions.setUserInfo(null));
    toast.success("Logout successful!");

    setTimeout(() => {
      navigate("/admin/login");
    }, 1600);
  };

  const currentPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentPassword = currentPasswordRef.current.value;
    const newPassword = newPasswordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      if (!currentPassword) {
        toast.error("Current password is required!");
      } else if (!newPassword) {
        toast.error("New password is required!");
      } else if (!confirmPassword) {
        toast.error("Confirm password is required!");
      }
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match!");
      return;
    }

    try {
      const response = await axios.post(
        `${links.BASE_URL}auth/change-password`,
        {
          currentPassword,
          newPassword,
          confirmPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userState.userInfo.accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Password changed successfully!");
        handleClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
      return;
    }
  };

  return (
    <>
      <div className="custom-topbar">
        <input className="topbar-search" type="text" placeholder="Search..."  />

        <div className="topbar-right">
          <i className="bi bi-bell fs-5 me-3 topbar-icon"></i>

          <div
            className="topbar-avatar-container"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <img src={user.avatar} alt="avatar" className="topbar-avatar" />
            <span className="topbar-user-name">
              {user.name}
              <i
                className={`bi bi-chevron-down ${
                  dropdownOpen ? "rotate-icon" : ""
                }`}
              ></i>
            </span>
            {dropdownOpen && (
              <ul className="topbar-dropdown">
                <li
                  className="topbar-dropdown-item"
                  onClick={() => setShowProfile(true)}
                >
                  My Profile
                </li>
                <li className="topbar-dropdown-item" onClick={handleShow}>
                  Change Password
                </li>
                <li className="topbar-dropdown-item" onClick={handleLogout}>
                  Logout
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>

      <Modal show={showChangePasswordModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="mb-3">
              <label htmlFor="currentPassword" className="form-label">
                Current Password
              </label>
              <input
                type="password"
                className="form-control"
                id="currentPassword"
                placeholder="Enter current password"
                ref={currentPasswordRef}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">
                New Password
              </label>
              <input
                type="password"
                className="form-control"
                id="newPassword"
                ref={newPasswordRef}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                ref={confirmPasswordRef}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showProfile} onHide={() => setShowProfile(false)}>
        <Modal.Header closeButton>
          <Modal.Title>My Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <img
              src={user.avatar}
              alt="avatar"
              className="rounded-circle"
              style={{ width: "100px", height: "100px" }}
            />
          </div>
          <div className="row">
            <div className="col-md-6 col-12 mb-3">
              <label className="form-label" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                value={user.name}
                readOnly
              />
            </div>
            <div className="col-md-6 col-12 mb-3">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={user.email}
                readOnly
              />
            </div>
            <div className="col-md-6 col-12 mb-3">
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                value={user.username}
                readOnly
              />
            </div>
            <div className="col-md-6 col-12 mb-3">
              <label htmlFor="mobile" className="form-label">
                Mobile
              </label>
              <input
                type="text"
                className="form-control"
                id="mobile"
                value={user.mobile}
                readOnly
              />
            </div>
            <div className="col-12 mb-3">
              <label htmlFor="address">Address</label>
              <textarea
                className="form-control"
                id="address"
                rows="3"
                value={user.address || "Not provided"}
                readOnly
              ></textarea>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProfile(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
