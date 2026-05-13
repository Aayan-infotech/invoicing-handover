import React from "react";
import { Container } from "react-bootstrap";
import { images } from "../../contstants";

function FeaturesSection() {
  return (
    <>
      <section className="feature-section text-dark pt-5 text-center">
        <Container>
          <h1 className="fw-bold">
            Track every <span className="text-primary">project</span> cost down
            to the
            <br />
            last detail to keep everything on{" "}
            <span className="text-primary">point</span>
          </h1>
          <p className="mt-3">
            IPA is designed for businesses and freelancers who need a smart
            solution to monitor project costs and manage Q&A with ease. From
            budgeting each phase to keeping communication clear and organized,
            the app helps streamline your workflow while maintaining complete
            visibility and control.
          </p>
         
         
        
        </Container>
      </section>
      <section className="features-section-2 mt-5 pt-5 pb-5 bg-light">
        <Container>
          <h1 className="fw-bold mb-5">
            Effortless and fully automated{" "}
            <span className="text-primary">invoicing</span>
            <br />
            reimagined for professionals.
          </h1>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="feature-card p-4 bg-light rounded-3 text-start">
                <div className="iconContainer mb-3">
                  <i className="bi bi-briefcase-fill"></i>
                </div>
                <h5 className="mt-2">Simplicity</h5>
                <p className="mt-2">
                  IPA is an invoicing app for businesses who prioritize ease of
                  use and the quality of service provided by our team.
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="feature-card p-4  bg-light rounded-3 text-start">
                 <div className="iconContainer mb-3">
                  <i className="bi bi-search"></i>
                </div>
                <h5 className="mt-2">Teams</h5>
                <p>
                  IPA is built for businesses and professionals working collaboratively on different tasks, with dedicated team members assigned to each task.
                </p>
              </div>
            </div>
             <div className="col-md-6">
              <div className="feature-card p-4  bg-light rounded-3 text-start">
                 <div className="iconContainer mb-3">
                  <i className="bi bi-telegram"></i>
                </div>
                <h5 className="mt-2">Taskflow</h5>
                <p>
                  Tasks are distributed among the right team members to ensure clarity, focus, and smooth collaboration.
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="feature-card p-4 bg-light rounded-3 text-start">
                <div className="iconContainer mb-3">
                  <i className="bi bi-moon-fill"></i>
                </div>
                <h5 className="mt-2">Trust</h5>
                <p className="mt-2">
                  IPA for businesses and teams who prioritize user comfort and the quality of invoicing services provided by our team.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

export default FeaturesSection;
