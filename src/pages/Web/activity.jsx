import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import FolderIcon from "@mui/icons-material/Folder";
import { Container, Card, Row, Col } from "react-bootstrap";
import axiosInstance from "../../components/axiosInstance";
import Loading from "../../components/Loading/Loading";
import { useOutletContext } from "react-router-dom";
import { images } from "../../contstants";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css";
import { addDays, format, subMonths } from "date-fns";
import { DateRangePicker } from "react-date-range";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Modal from "@mui/material/Modal";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

const Activity = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, snackbar } = useOutletContext();
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [state, setState] = useState([
    {
      startDate: subMonths(new Date(), 1),
      endDate: addDays(new Date(), 1),
      key: "selection",
    },
  ]);

  const getResponse = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page: page,
        per_page: 10,
      };

      // Add date range params if dates are selected
      if (state[0].startDate && state[0].endDate) {
        params.invoiceDate = format(state[0].startDate, "yyyy-MM-dd");
        params.invoiceEndDate = format(state[0].endDate, "yyyy-MM-dd");
      }

      // Add search query if exists
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await axiosInstance.get("projects/get-activity", {
        params,
      });
      if (response) {
        setData(response.data.data.activities);
        setTotalPages(response.data.data.total_page);
        setCurrentPage(response.data.data.current_page);
        setTotalRecords(response.data.data.total_records);
        snackbar.success(response?.data?.message);
      }
    } catch (error) {
      snackbar.error(
        error?.response?.data?.message || "Error fetching activity"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    getResponse(1);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    getResponse(value);
  };

  const handleApplyDateRange = () => {
    handleClose();
    getResponse(1);
  };

  const handleDownloadInvoice = (url, invoiceNumber) => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.download = `${invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    getResponse();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 5,
    }).format(amount);
  };

  return (
    <>
      {/* Header Section */}
      <Box className="d-flex flex-column gap-3 mb-4 activity-header">
        <Box className="d-flex flex-row gap-3 justify-content-between align-items-center">
          <h4 className="mb-0">Activity Log</h4>
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted">Total Records: {totalRecords}</span>
            <Button
              variant="outlined"
              onClick={handleOpen}
              startIcon={<MenuIcon />}
            >
              Filter by Date
            </Button>
          </div>
        </Box>

        {/* Search Bar */}
        {/* <Box component="form" onSubmit={handleSearch} className="d-flex gap-2">
          <TextField
            fullWidth
            placeholder="Search by invoice number..."
            value={searchQuery}
            className="border-0"
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="submit">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box> */}

        {/* Date Range Info */}
        <Box className="d-flex align-items-center gap-2">
          <span className="text-muted">Date Range:</span>
          <Chip
            label={`${format(state[0].startDate, "MMM dd, yyyy")} - ${format(
              state[0].endDate,
              "MMM dd, yyyy"
            )}`}
            size="small"
            variant="outlined"
          />
          <span className="text-muted text-small">
            (Showing {data.length} of {totalRecords} records)
          </span>
        </Box>
      </Box>

      {/* Date Range Dialog */}
      <Dialog maxWidth="lg" fullWidth open={open} onClose={handleClose}>
        <DialogTitle>Select Date Range</DialogTitle>
        <DialogContent>
          <Box className="d-flex justify-content-center">
            <DateRangePicker
              onChange={(item) => setState([item.selection])}
              showSelectionPreview={true}
              moveRangeOnFirstSelection={false}
              months={2}
              ranges={state}
              direction="horizontal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleApplyDateRange} variant="contained">
            Apply Filter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invoice List */}
      <div className="invoice-list mt-3">
        {loading ? (
          <div className="h-full">
            <Loading />
          </div>
        ) : (
          <>
            {data?.length > 0 ? (
              <>
                {data?.map((activity) => (
                  <Card
                    key={activity._id}
                    className="invoice-item border-0 p-1 mb-3"
                  >
                    <Card.Body className="px-3 py-3 w-100">
                      <Row className="align-items-center">
                        <Col xs="auto">
                          <Box className="folder-icon-wrapper bg-primary rounded-circle p-2">
                            <PictureAsPdfIcon
                              sx={{ color: "white", fontSize: 28 }}
                            />
                          </Box>
                        </Col>
                        <Col>
                          <h6 className="invoice-title mb-1 fw-bold">
                            {activity.taskName}
                          </h6>
                          <p className="invoice-from mb-1 text-muted">
                            <small>{activity.projectName}</small>
                          </p>
                          <p className="invoice-task-no mb-0">
                            <small>
                              Created: {formatDate(activity.createdAt)}
                            </small>
                          </p>
                        </Col>
                        <Col xs="auto" className="text-end">
                          <Box className="d-flex flex-column align-items-end gap-2">
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<DownloadIcon />}
                              onClick={() =>
                                handleDownloadInvoice(
                                  activity.invoiceUrl,
                                  activity.invoiceNumber
                                )
                              }
                            >
                              Download PDF
                            </Button>
                            <Chip
                              label="Completed"
                              className="invoice-chip"
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          </Box>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box className="d-flex justify-content-center mt-4">
                    <Stack spacing={2}>
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        showFirstButton
                        showLastButton
                      />
                    </Stack>
                  </Box>
                )}
              </>
            ) : (
              <Box className="text-center py-5">
                <img
                  src={images.noData}
                  className="w-100 h-100 object-fit-contain"
                  style={{ maxHeight: "250px" }}
                  alt="No data found"
                />
                <p className="text-muted mt-3">
                  No activities found for the selected criteria
                </p>
              </Box>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Activity;
