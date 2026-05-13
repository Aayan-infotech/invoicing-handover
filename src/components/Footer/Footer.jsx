import React from "react";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer-section py-5 text-white">
      <Container>
        <div className="row">
          <div className="col-md-3 col-6 mb-4 mb-md-0">
            <h5>
              Installer
              <br />
              <strong>Project Assist</strong>
              <br />
              (IPA)
            </h5>
            <div className="d-flex gap-3 mt-3">
              <Link to="#">
                <i className="bi bi-facebook text-white" width={24}></i>
              </Link>
              <Link to="#">
                <i className="bi bi-twitter-x text-white" width={24}></i>
              </Link>
              <Link to="#">
                <i className="bi bi-linkedin text-white" width={24}></i>
              </Link>
            </div>
          </div>
          <div className="col-md-4 col-6 mb-4 mb-md-0">
             <h5>About us</h5>
            <ul className="list-unstyled mt-3">
              <li>
                <Link to="/" className="footer-link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="footer-link">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="footer-link">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-md-5">
            <h5>Subscribe to new Newsletter</h5>
            <p className="small text-secondary">
              What are you waiting for?! Subscribe and follow our progress!
            </p>
            <form className="d-md-flex">
              <input
                type="email"
                className="form-control me-2"
                placeholder="email@company.com"
              />
              <button className="btn btn-primary mt-md-0 mt-2 " style={{ minWidth: "150px" , fontSize:"14px"}}>
                Subscribe now
              </button>
            </form>
          </div>
        </div>
        <div className="text-center mt-4 small">
          © Copyright 2025 <span className="text-primary">Invoicing App</span>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
