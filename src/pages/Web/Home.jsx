import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { images } from "../../contstants";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "../../components/axiosInstance";

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const [clockData, setClockData] = useState({
    clockInTime: null,
    clockOutTime: null,
    totalHours: null,
    isClockedIn: false,
    userId: null,
    _id: null,
  });

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Calculate total hours worked
  const calculateTotalHours = (clockInTime, clockOutTime = new Date()) => {
    if (!clockInTime) return "0H";

    const start = new Date(clockInTime);
    const end = clockOutTime ? new Date(clockOutTime) : new Date();
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHours}H/${diffMinutes}M`;
  };

  const getClockedInData = async () => {
    try {
      const response = await axiosInstance.get("projects/get-clocking-details");
      if (response.data.success) {
        const data = response.data.data;
        setClockData({
          clockInTime: data.clockInTime,
          clockOutTime: data.clockOutTime,
          totalHours: calculateTotalHours(data.clockInTime, data.clockOutTime),
          isClockedIn: data.isClockedIn,
          userId: data.userId,
          _id: data._id,
        });
      }
    } catch (error) {
      console.error("Error fetching clock data:", error);
      // Don't show error for initial load, it might be normal if no clock-in exists
    }
  };

  React.useEffect(() => {
    getClockedInData();
  }, []);

  return (
    <div className="container">
      <div className="py-4">
        <div className="d-flex flex-column gap-2 align-items-start justify-content-start">
          <h5 className="text-light">Good Morning,</h5>
          <h2 className="text-light d-flex flex-row gap-2 order-1 mb-0 name-custom">
            <span className="" style={{ lineHeight: "36px" }}>
              Hello
            </span>
            <div className="mb-0">
              {decoded?.username
                ? decoded.username.charAt(0).toUpperCase() +
                  decoded.username.slice(1)
                : "User"}
            </div>
          </h2>
        </div>
        {/* <div className="mt-5">
          <div className="card bg-shift rounded-4">
            <div className="card-body p-3">
              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center gap-4">
                <div className="d-flex flex-row gap-2 align-items-center">
                  {" "}
                  <span className="fs-6">
                    {clockData.isClockedIn ? "Started Work At" : "Not Clocked in Today"}
                  </span>
                  <h3 className="fs-2 mb-0">
                    {clockData.clockInTime
                      ? formatTime(clockData.clockInTime)
                      : null}
                  </h3>
                </div>
                <div className="d-flex flex-row gap-2 justify-content-center align-items-center flex-wrap">
                  {" "}
                  <span className="fs-6">Shift</span>
                  <h3 className="fs-2 mb-0">
                    {clockData.totalHours || "0H/0H"}
                  </h3>
                  <button
                    className="btn btn-clockin py-3"
                    style={{ minWidth: "300px" }}
                    onClick={() => navigate("/clockin")}
                  >
                    Clock-in <i className="bi bi-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div> */}
        <div className="mt-5">
          <div className="d-flex flex-row justify-content-between align-items-center gap-lg-5 gap-2">
            <div className="border border-1 border-light rounded-3 w-100 p-3">
              <Link
                to="/projects"
                className="text-decoration-none d-flex justify-content-between align-items-center"
              >
                <div className="d-flex flex-row gap-2 align-items-center">
                  {" "}
                  <img
                    src={images.project}
                    className="img-fluid icon-size"
                    alt="Home 2"
                   
                  />
                  <h3 className="fs-4 mb-0 text-light ms-1">Projects</h3>
                </div>
                <i className="bi bi-arrow-right fs-3 text-light d-none d-lg-flex"></i>
              </Link>
            </div>
            <div className="border border-1 border-light rounded-3 w-100 p-3">
              <Link
                to="/invoices"
                className="text-decoration-none d-flex justify-content-between align-items-center"
              >
                <div className="d-flex flex-row gap-2 align-items-center">
                  {" "}
                  <img
                    src={images.invoice}
                    className="img-fluid icon-size"
                    alt="Home 2"
                    
                  />
                  <h3 className="fs-4 mb-0 text-light ms-1">Invoices</h3>
                </div>
                <i className="bi bi-arrow-right fs-3 text-light  d-none d-lg-flex"></i>
              </Link>
            </div>
          </div>
        </div>
        {/* <div className="mt-4">
          <div className="d-flex flex-row gap-4 align-items-center justify-content-between">
            <h4 className="text-light mb-4">Upcoming Holidays</h4>
            <Link to="/holidays" className="text-light text-decoration-none">
              View All
            </Link>
          </div>

          <Swiper
            spaceBetween={20}
            slidesPerView={4}
            onSlideChange={() => console.log("slide change")}
          >
            <SwiperSlide>
              <img
                src={images.holiday}
                className="img-fluid rounded-4"
                alt="Home 2"
              />
            </SwiperSlide>
            <SwiperSlide>
              <img
                src={images.holiday}
                className="img-fluid rounded-4"
                alt="Home 2"
              />
            </SwiperSlide>
            <SwiperSlide>
              <img
                src={images.holiday}
                className="img-fluid rounded-4"
                alt="Home 2"
              />
            </SwiperSlide>
            <SwiperSlide>
              <img
                src={images.holiday}
                className="img-fluid rounded-4"
                alt="Home 2"
              />
            </SwiperSlide>
            <SwiperSlide>
              <img
                src={images.holiday}
                className="img-fluid rounded-4"
                alt="Home 2"
              />
            </SwiperSlide>
          </Swiper>
        </div> */}
      </div>
    </div>
  );
};

export default Home;
