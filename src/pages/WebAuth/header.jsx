import React from "react";
import { Button } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import NavDropdown from "react-bootstrap/NavDropdown";
import Offcanvas from "react-bootstrap/Offcanvas";
import { Link } from "react-router-dom";
function Header({ color }) {
  const token = localStorage.getItem("token");
  return (
    <>
      <Navbar background="transparent" expand="lg" className="header pt-4">
        <Container>
          <Link
            to={`${token ? "/home" : "/"} `}
            className="text-decoration-none"
          >
            <Navbar.Brand className={`poppins-semibold fs-4 text-${color}`}>
              Installer Project Assist
            </Navbar.Brand>
          </Link>
          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            className={`bg-${color} navbar-toggler-custom`}
          />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Link
                to="/terms-and-conditions"
                className={`text-${color} nav-link`}
              >
                Term & Conditions
              </Link>

              <Link to="/privacy-policy" className={`text-${color} nav-link`}>
                Privacy Policy
              </Link>
            </Nav>
            {token ? (
              <div className="d-flex justify-content-between align-items-center gap-4">
                <Link to="/notification" className={`text-${color} nav-link`}>
                  <i className="bi bi-bell fs-4"></i>
                </Link>
                <Link to="/profile" className={`text-${color} nav-link`}>
                  <i className="bi bi-person-circle fs-4"></i>
                </Link>
              </div>
            ) : (
              <div className="d-flex justify-content-between align-items-center gap-3">
                <Link
                  className="btn-secondary customeBtn2 bg-dark text-white border-0 text-decoration-none btn"
                  to="/login"
                >
                  Login
                </Link>
                <Link
                  className="btn-primary customeBtn text-decoration-none text-white btn"
                  to="/signup"
                >
                  Signup
                </Link>
              </div>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default Header;
