import React from "react";
import { images } from "../../contstants";
import { Button, Container } from "react-bootstrap";
import Header from "../Header/Header";
import {Link} from "react-router-dom"

function HeroSection() {
  return (
    <div className="hero-container bg-dark-blue">
      <Header color="white" />

      <section className="hero-section text-white px-3">
        <Container className="">
          <div className="row custom-height gy-4">
            <div className="col-lg-5">
              <h1 className="display-5 fw-bold">
                Easily create and
                <br />
                manage <span className="text-info">Projects</span> with us.
              </h1>
              <p className="lead">
                {/* The primary function of this app is to track project costs and
            streamline <br />
            QA &amp; efficiency. Helps organize and control throughout. Lorem
            ipsum <br />
            dolor sit amet consectetur adipisicing elit. Iste, doloremque. */}
                The primary function of the app is to track project costs and
                manage Q&A efficiently, helping you stay organized and in
                control throughout your workflow
              </p>
              <Link to="/login" className="btn btn-outline-light p-3">
                Get Started <i className="bi bi-arrow-right ms-2" />
              </Link>
            </div>
            <div className="col-lg-7 img-1-section-1">
              <img src={images.laptop} className="img-fluid" alt="Home 2" />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default HeroSection;
