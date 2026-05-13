import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../components/axiosInstance";
import { useOutletContext } from "react-router-dom";
import Loading from "../../components/Loading/Loading";
import Pagination from "../../components/PaginationWeb"; // Adjust path as needed

const ProjectWeb = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const { snackbar } = useOutletContext();

  const limit = 10;

  // Simple function to calculate hours difference
  const getHoursDifference = (start, end) => {
    console.log(start, end);
    const startTime = new Date(start).getDate();
    const endTime = new Date(end).getDate();
    const diffInHours = (endTime - startTime)
    if (diffInHours < 0) {
      return 1;
    }
    return Math.round(diffInHours);
  };

  const getProjects = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `projects/my-projects?limit=${limit}&page=${page}`
      );
      if (response) {
        setData(response.data.data);
        setTotalPages(response?.data?.data?.total_page);
        setCurrentPage(page);
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

  useEffect(() => {
    getProjects(1);
  }, []);

  const handlePageChange = (newPage) => {
    getProjects(newPage);
  };

  return (
    <div className="container">
      <div className="py-4">
        <div className="d-flex flex-row gap-3 align-items-center justify-content-between">
          <h2 className="text-light">Projects</h2>
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="h-full">
              <Loading />
            </div>
          ) : (
            <>
              <div className="d-flex flex-column gap-5">
                {data?.projects?.map((project) => (
                  <div
                    className="card bg-shift border-0 rounded-4"
                    key={project._id}
                  >
                    <div className="card-body p-2 px-3">
                      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center gap-4">
                        <div className="d-flex flex-row gap-2 align-items-center">
                          <h3 className="mb-0">{project?.projectName}</h3>
                        </div>
                        <div className="d-flex flex-row gap-3 align-items-center">
                          <div className="d-flex flex-row gap-2 align-items-center bg-white rounded-4 p-2 px-3 text-primary">
                            <i className="bi bi-clock fs-5"></i>
                            <h6 className="mb-0 fs-5">
                              {getHoursDifference(
                                project?.startDate,
                                project?.endDate
                              )}{" "}
                              days
                            </h6>
                          </div>

                          <button
                            className="btn btn-open rounded-5 py-3 px-5"
                            onClick={() => navigate(`/project-detail/${project._id}`)}
                          >
                            Open <i className="bi bi-arrow-right"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reusable Pagination Component */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                maxVisiblePages={5}
                className="mt-5"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectWeb;