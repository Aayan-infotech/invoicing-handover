import React from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { images } from "../../contstants";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Link, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";

const TaskCompleted = () => {
  const navigate = useNavigate();
  return (
    <div className="container">
      <div className="py-4">
        <div className="d-flex flex-row gap-3 align-items-center justify-content-between">
          <h2 className="text-light d-inline" style={{ minWidth: "245px" }}>
            Task Completed
          </h2>
        
        </div>
        <div className="mt-5">
          <div className="d-flex flex-column gap-5">
            <div className="card bg-shift border-0 rounded-4">
              <div className="card-body p-3 px-4">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center gap-4">
                  <div className="d-flex flex-row gap-2 align-items-center">
                    {" "}
                    <h3 className=" mb-0">Payment : £ 123</h3>
                  </div>
               
                    <div className="d-flex flex-row gap-2 align-items-center bg-white rounded-5 p-2 px-5 text-primary" style={{cursor:"pointer"}} onClick={() => navigate("/invoices")}>
                      {" "}
                      <i className="bi bi-download fs-5"></i>
                      <h6 className=" mb-0 fs-5">Invoice</h6>
                    </div>
                </div>
              </div>
            </div>
          <div className="d-flex h-100 w-100">
            <Button
              variant="contained"
              style={{ backgroundColor: "#0D6EFD" }}
              className="mx-auto px-5 py-2 rounded-4"
              onClick={() => navigate("/project-detail")}
            >
             Go Back
            </Button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCompleted;
