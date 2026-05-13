import React from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { images } from "../../contstants";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Stack from "@mui/material/Stack";
import axiosInstance from "../../components/axiosInstance";
import Loading from "../../components/Loading/Loading";
import Pagination from "../../components/PaginationWeb"; // Adjust path as needed

const Invoices = () => {
  const navigate = useNavigate();
  const [value, setValue] = React.useState("all");
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [pagination, setPagination] = React.useState({
    current_page: 1,
    total_page: 1,
    total_records: 0,
    per_page: 10,
  });
  const { snackbar } = useOutletContext();

  const handleChange = (event, newValue) => {
    setValue(newValue);
    // Reset to page 1 when tab changes
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const getAllData = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `projects/get-invoice?status=${value.toLowerCase()}&page=${page}`
      );
      if (response) {
        setData(response?.data?.data?.invoices || []);
        setPagination({
          current_page: response?.data?.data?.current_page || 1,
          total_page: response?.data?.data?.total_page || 1,
          total_records: response?.data?.data?.total_records || 0,
          per_page: response?.data?.data?.per_page || 10,
        });
        snackbar.success(response?.data?.message);
      }
    } catch (error) {
      snackbar.error(
        error?.response?.data?.message || "Error fetching invoices"
      );
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getAllData(pagination.current_page);
  }, [value, pagination.current_page]);

  const handlePageChange = (newPage) => {
    console.log("Page changed to:", newPage);
    setPagination((prev) => ({ ...prev, current_page: newPage }));
    getAllData(newPage);
  };

  const handleGenerateInvoice = async (invoiceUrl) => {
    console.log("Generating invoice for URL:", invoiceUrl);
    window.open(invoiceUrl, "_blank");
  };

  return (
    <div className="container">
      <div className="py-4">
        <div className="d-flex flex-row gap-3 align-items-center justify-content-between">
          <h2 className="text-light d-inline">Invoices</h2>
        </div>
        <div className="mt-5">
          <Box className="mt-2" sx={{ width: "100%", typography: "body1" }}>
            <TabContext value={value}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <TabList
                  onChange={handleChange}
                  className="custom-tab-selection"
                  aria-label="lab API tabs example"
                  sx={{
                    "& .MuiTabs-scroller": {
                      overflow: "visible !important",
                    },
                    "& .MuiTabs-flexContainer": {
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      width: "100%",
                    },
                  }}
                >
                  <Tab
                    label="All"
                    value="all"
                    sx={{
                      width: "100%",
                      minWidth: "auto",
                      textTransform: "none",
                    }}
                  />
                  <Tab
                    label="Paid"
                    value="paid"
                    sx={{
                      width: "100%",
                      minWidth: "auto",
                      textTransform: "none",
                    }}
                  />
                  <Tab
                    label="Draft"
                    value="draft"
                    sx={{
                      width: "100%",
                      minWidth: "auto",
                      textTransform: "none",
                    }}
                  />
                  <Tab
                    label="Unpaid"
                    value="unpaid"
                    sx={{
                      width: "100%",
                      minWidth: "auto",
                      textTransform: "none",
                    }}
                  />
                </TabList>
              </Box>
              <TabPanel value={value} className="px-0">
                {loading ? (
                  <div className="h-full">
                    <Loading />
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-5">
                    {!data || data.length === 0 ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <img
                          src={images.noData}
                          alt="No Data"
                          className="w-100 h-100"
                          style={{ maxWidth: "300px" }}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="d-flex flex-column gap-4">
                          {data.map((item, index) => (
                            <div
                              key={index}
                              className="card bg-shift border-0 rounded-4"
                            >
                              <div className="card-body p-2 px-4">
                                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center gap-4">
                                  <div className="d-flex flex-row gap-2 align-items-center">
                                    <h3 className="mb-0">
                                      {item?.projectName}
                                    </h3>
                                    <span
                                      className={`badge ${
                                        item?.status === "paid"
                                          ? "bg-success"
                                          : item?.status === "unpaid"
                                          ? "bg-danger"
                                          : "bg-warning"
                                      }`}
                                    >
                                      {item?.status}
                                    </span>
                                  </div>

                                  <div
                                    className="d-flex flex-row gap-2 align-items-center bg-white rounded-5 p-2 px-5 text-primary"
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                      handleGenerateInvoice(item?.invoiceUrl)
                                    }
                                  >
                                    <i className="bi bi-download fs-5"></i>
                                    <h6 className="mb-0 fs-5">Invoice</h6>
                                  </div>
                                </div>
                                <div className="row mt-3">
                                  <div className="col-md-4">
                                    <small className="text-light">
                                      Invoice #
                                    </small>
                                    <p className="mb-0">
                                      {item?.invoiceNumber}
                                    </p>
                                  </div>
                                  <div className="col-md-4">
                                    <small className="text-light">Amount</small>
                                    <p className="mb-0">${item?.amount}</p>
                                  </div>
                                  <div className="col-md-4">
                                    <small className="text-light">Date</small>
                                    <p className="mb-0">
                                      {new Date(
                                        item?.InvoiceDate
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination */}
                        {pagination.total_page > 1 && (
                          <div className="d-flex justify-content-center mt-4 text-light">
                            <Stack spacing={2}>
                              <Pagination
                                currentPage={pagination.current_page}
                                totalPages={pagination.total_page}
                                onPageChange={handlePageChange}
                                maxVisiblePages={5}
                                className="mt-5"
                              />
                            </Stack>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </TabPanel>
            </TabContext>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
