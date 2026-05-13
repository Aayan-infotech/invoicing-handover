import Header from "./header";
import "../../assets/css/web.css";
import { Link, useNavigate } from "react-router-dom";
import OtpInput from "react-otp-input";
import { useState } from "react";

export default function SuccessWeb() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  return (
    <div className="bg-auth">
      <Header />
      <div className="container">
        <div className="row">
          <div className="col-md-6 offset-md-3">
            <div className="card mt-3 border-0">
              <div className="card-body">
                <div className="text-center">
                  <i className="bi bi-check-circle-fill text-primary " style={{fontSize:"60px"}}></i>
                </div>
                <h1 className="card-title text-center fs-1 fw-bold ">
                  Congratulations!
                </h1>
                <h5 className="text-center">your account has been created</h5>
                <p className="fs-5 text-center mt-4">
                  Your User ID and Password would be shared on Email ID
                </p>
                <a href="mailto:support@gmail.com" className="fs-6 text-dark justify-content-center mb-4 d-flex">
                  support@gmail.com
                </a>
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 rounded-4"
                  onClick={() => navigate("/login")}
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
