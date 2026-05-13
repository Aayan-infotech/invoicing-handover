import React from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { images } from "../../contstants";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Link, useNavigate } from "react-router-dom";

const Holiday = () => {
  const navigate = useNavigate();
  return (
    <div className="container">
      <div className="py-4">
        <div className="d-flex flex-row gap-3 align-items-center justify-content-between">
          <h2>
            <span className="fs-4 me-2">Hello</span>
            Anshuman
          </h2>
         
        </div>
      </div>
      <div className="pt-4 ">
        <div className="d-flex flex-row gap-5 align-items-center flex-wrap calendar-container">
          <div className="d-flex flex-row gap-3 align-items-center calendar-month">
            <div className="calender-icon">
              <span className="fs-6 month">Jan</span>
              <span className="fs-6 date">25</span>
            </div>
            <div className="d-flex flex-column gap-1">
              <b className="fs-5">Happy New Year</b>
              <span className="fs-6">Wednesday</span>
            </div>
          </div>
          <div className="d-flex flex-row gap-3 align-items-center calendar-month">
            <div className="calender-icon">
              <span className="fs-6 month">Jan</span>
              <span className="fs-6 date">25</span>
            </div>
            <div className="d-flex flex-column gap-1">
              <b className="fs-5">Happy New Year</b>
              <span className="fs-6">Wednesday</span>
            </div>
          </div>
          <div className="d-flex flex-row gap-3 align-items-center calendar-month">
            <div className="calender-icon">
              <span className="fs-6 month">Jan</span>
              <span className="fs-6 date">25</span>
            </div>
            <div className="d-flex flex-column gap-1">
              <b className="fs-5">Happy New Year</b>
              <span className="fs-6">Wednesday</span>
            </div>
          </div>
          <div className="d-flex flex-row gap-3 align-items-center calendar-month">
            <div className="calender-icon">
              <span className="fs-6 month">Jan</span>
              <span className="fs-6 date">25</span>
            </div>
            <div className="d-flex flex-column gap-1">
              <b className="fs-5">Happy New Year</b>
              <span className="fs-6">Wednesday</span>
            </div>
          </div>
          <div className="d-flex flex-row gap-3 align-items-center calendar-month">
            <div className="calender-icon">
              <span className="fs-6 month">Jan</span>
              <span className="fs-6 date">25</span>
            </div>
            <div className="d-flex flex-column gap-1">
              <b className="fs-5">Happy New Year</b>
              <span className="fs-6">Wednesday</span>
            </div>
          </div>
          <div className="d-flex flex-row gap-3 align-items-center calendar-month">
            <div className="calender-icon">
              <span className="fs-6 month">Jan</span>
              <span className="fs-6 date">25</span>
            </div>
            <div className="d-flex flex-column gap-1">
              <b className="fs-5">Happy New Year</b>
              <span className="fs-6">Wednesday</span>
            </div>
          </div>
          <div className="d-flex flex-row gap-3 align-items-center calendar-month">
            <div className="calender-icon">
              <span className="fs-6 month">Jan</span>
              <span className="fs-6 date">25</span>
            </div>
            <div className="d-flex flex-column gap-1">
              <b className="fs-5">Happy New Year</b>
              <span className="fs-6">Wednesday</span>
            </div>
          </div>
          <div className="d-flex flex-row gap-3 align-items-center calendar-month">
            <div className="calender-icon">
              <span className="fs-6 month">Jan</span>
              <span className="fs-6 date">25</span>
            </div>
            <div className="d-flex flex-column gap-1">
              <b className="fs-5">Happy New Year</b>
              <span className="fs-6">Wednesday</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Holiday;
