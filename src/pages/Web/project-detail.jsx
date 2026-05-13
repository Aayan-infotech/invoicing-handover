import React from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { images } from "../../contstants";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { Button } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import ProgressBar from "react-bootstrap/ProgressBar";
import axiosInstance from "../../components/axiosInstance";
import Loading from "../../components/Loading/Loading";

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [fullscreen, setFullscreen] = React.useState(true);
  const { snackbar } = useOutletContext();
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const handleGetData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `projects/project-details/${id}`
      );
      if (response) {
        setData(response.data.data);

        snackbar.success(response?.data?.message);
      }
    } catch (error) {
      snackbar.error(
        error?.response?.data?.message || "Error fetching projects"
      );
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    handleGetData();
  }, [id]);

  const getHoursDifference = (start, end) => {
    const startTime = new Date(start).getDate();
    const endTime = new Date(end).getDate();
    const diffInHours = (endTime - startTime)
    if (diffInHours < 0) {
      return 1;
    }
    return Math.round(diffInHours);
  };
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          {" "}
          <div className="container">
            <div className="py-4">
              <div className="d-flex flex-row gap-3 align-items-center justify-content-between">
                <h2
                  className="text-light d-inline"
                  style={{ minWidth: "240px" }}
                >
                  Project Details
                </h2>
              </div>
              <div className="mt-5">
                <div className="d-flex flex-column flex-lg-row gap-5 justify-content-between">
                  <div className="text-light d-flex flex-row gap-2 align-items-center">
                    <h2 className="mb-0">{data?.projectName}</h2>
                    <h5
                      className="bg-light text-dark px-2 pe-4 py-1 mb-0"
                      style={{ borderRadius: "0 15px 15px 0" }}
                    >
                      {new Date(data?.startDate).toDateString()}
                    </h5>
                  </div>
                  {/* <div className="d-flex flex-row gap-3 align-items-center">
                    <Link
                      to="/map"
                      className="text-primary fw-bold fs-5 text-decoration-none"
                    >
                      show Map
                    </Link>
                    <Link
                      to="/invoice"
                      className="text-primary fw-bold fs-6 px-4 py-2 text-decoration-none btn btn-primary rounded-4 text-light"
                    >
                      <i className="bi bi-download me-2"></i>
                      Invoice
                    </Link>
                  </div> */}
                </div>
                <h5 className="text-light mt-4">
                  <i className="bi bi-clock me-2"></i>{" "}

                  {getHoursDifference(data?.startDate, data?.endDate)} days
                </h5>
                <div className="d-flex flex-column flex-lg-row gap-4 justify-content-between align-items-start">
                  <div className="">
                    <p
                      className={`fs-5 mb-0 ${fullscreen ? "line-clamp" : ""
                        } text-light`}
                    >
                      {data?.description}
                    </p>
                    <p
                      className="text-light fw-bold"
                      onClick={() => setFullscreen(!fullscreen)}
                      style={{ cursor: "pointer" }}
                    >
                      {fullscreen ? "Read Less" : "Read More"}{" "}
                      <i className="bi bi-chevron-down"></i>
                    </p>
                  </div>

                  <Link
                    to={`/quality-assurance/${data?._id}`}
                    state={{
                      name: data?.projectName,
                    }}
                    className="w-100 fs-5 text-primary fw-bold fs-6 px-5 py-3 text-decoration-none btn btn-primary rounded-4 text-light"
                    style={{ maxWidth: "300px" }}
                  >
                    Quality Assurance
                    <i className="bi bi-arrow-right ms-2"></i>
                  </Link>
                </div>

                {data?.projectTasks?.length > 0 && (
                  <div className="mt-5">
                    <h4 className="text-light">Tasks</h4>
                    <Table bordered hover className=" bg-light">
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>Task Name</th>
                          <th>Status</th>
                          <th> Total Quantity</th>
                          <th>Total Completed Quantity</th>

                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.projectTasks?.map((task, index) => (
                          <tr key={task._id}>
                            <td>{index + 1}</td>
                            <td>{task.taskName}</td>
                            <td>{task.status}</td>
                            <td>{task.taskQuantity}</td>
                            <td>{task.taskCompletedQuantity}</td>
                            <td>
                              <button
                                className="btn btn-primary w-100 rounded-4"
                                onClick={() =>
                                  navigate(`/task-detail/${task._id}`)
                                }
                              >
                                <i className="bi bi-arrow-right"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
                {data?.assignedMembersDetails?.length > 0 && (
                  <div className="mt-5">
                    <h4 className="text-light">Team Members</h4>
                    <div className="d-flex flex-row gap-3 flex-wrap align-items-center mt-3">
                      {data?.assignedMembersDetails?.map((member) => (
                        <div
                          className="d-flex flex-row gap-2 align-items-center px-3 py-2 rounded-5"
                          style={{ backgroundColor: "#ffffff3b" }}
                        >
                          <img
                            src={images.placeholder || member?.profile_image}
                            className="img-fluid rounded-circle w-100 h-100"
                            style={{ maxWidth: "40px", maxHeight: "40px" }}
                            alt="Man"
                          />
                          <p className="mb-0 text-light  ">
                            {member?.username}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ProjectDetail;
