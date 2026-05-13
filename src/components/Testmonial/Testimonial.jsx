import React from "react";
import { Container } from "react-bootstrap";
import { images } from "../../contstants";

function Testimonial() {
  return (
    <section className="testimonial-section py-5">
      <Container>
        <div className="row">
          <div className="col-md-4">
            <img
              src={images.Man}
              className="img-fluid rounded img-man"
              alt="Man"
            />
          </div>
          {/* Text Content */}
          <div className="col-md-8">
            <h1 className="fw-bold mb-4 mt-3">
              What do they <span className="text-primary">think about </span>
              our App?
            </h1>
            <h4 className="mt-5 mb-2">Cameron Williamson</h4>
            <h6 className="text-secondary mb-5">NYC HeavyLifter Team</h6>
            <div className="testimonial-box bg-white p-3 rounded shadow mb-5">
              <p className="mb-0 p-4">
                IPA is an application for businesses and professionals who
                prioritize user comfort and the quality of services provided by
                our team.
              </p>
            </div>
            <div className="mt-3">
              <button className="btn btn-primary me-2">←</button>
              <button className="btn btn-outline-primary">→</button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default Testimonial;
