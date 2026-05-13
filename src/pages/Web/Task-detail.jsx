import React from "react";
import Form from "react-bootstrap/Form";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import "swiper/css";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import Table from "react-bootstrap/Table";
import ProgressBar from "react-bootstrap/ProgressBar";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import axiosInstance from "../../components/axiosInstance";
import Loading from "../../components/Loading/Loading";
import { Typography, Card, CardContent } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { images } from "../../contstants";

const TaskDetail = () => {
  const navigate = useNavigate();
  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });
  const { snackbar } = useOutletContext();
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const { id } = useParams();
  const [value, setValue] = React.useState("1");

  const handleValueChange = (event, newValue) => {
    setValue(newValue);
  };
  // State for form fields with limits
  const [formData, setFormData] = React.useState({
    quantity: "",
    description: "",
  });
  const [alignment, setAlignment] = React.useState("in progress");
  const [imagesUploaded, setImageUploaded] = React.useState([]);
  const handleChange = (event, newAlignment) => {
    setAlignment(newAlignment);
  };

  // Constants for limits
  const MAX_WORDS = 50;
  const MAX_WORD_LENGTH = 30;

  const handleInputChange = (fieldName, value) => {
    // Split into words and apply limits
    const words = value.split(/\s+/).filter((word) => word.length > 0);

    // Check if adding this would exceed word limit
    if (words.length > MAX_WORDS) {
      return; // Don't update if word limit exceeded
    }

    // Check each word length
    const hasOversizedWord = words.some(
      (word) => word.length > MAX_WORD_LENGTH
    );
    if (hasOversizedWord) {
      return; // Don't update if any word exceeds character limit
    }

    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const StyledTabList = styled(TabList)(({ theme }) => ({
    width: "100%",
    "& .MuiTabs-scroller": {
      overflow: "auto !important",
    },
    "& .MuiTabs-flexContainer": {
      display: "flex",
      width: "100%",
    },
    "& .MuiTab-root": {
      flex: "1 1 auto",
      minWidth: "auto",
      whiteSpace: "nowrap",
      color: "#fff",
    },
  }));

  const getData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`projects/task-details/${id}`);
      if (response) {
        setData(response.data.data);
        snackbar.success(response?.data?.message);
      }
    } catch (error) {
      snackbar.error(error?.response?.data?.message || "Error fetching tasks");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getData();
  }, [id]);

  const completeData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(
        `projects/task-completion-update`,
        {
          taskId: id,
          taskUpdateDescription: formData.description,
          taskUpdateFile: data.taskUpdateFile,
          taskCompletedQuantity: formData.quantity,
          // status: alignment,
        }
      );

      if (response) {
        snackbar.success(response?.data?.message);
        setFormData({ quantity: "", description: "" });
        getData();
      }
    } catch (error) {
      snackbar.error(error?.response?.data?.message || "Error fetching tasks");
    } finally {
      setLoading(false);
    }
  };

  // Filter task updates based on status
  const getFilteredTaskUpdates = (status) => {
    if (!data.taskUpdateHistory) return [];
    return data.taskUpdateHistory.filter((update) => update.status === status);
  };

  const inProgressTasks = getFilteredTaskUpdates("in progress");
  const completedTasks = getFilteredTaskUpdates("completed");

  // Function to check if file is PDF
  const isPDF = (file) => {
    return (
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf")
    );
  };

  // Function to check if file is image
  const isImage = (file) => {
    return (
      file.type.startsWith("image/") ||
      /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.name)
    );
  };

  const TaskUpdateCard = ({ update }) => (
    <Card
      className="mb-3"
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      }}
    >
      <CardContent className="text-light">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Typography variant="h6" component="div">
            Update by: {update.updatedBy}
          </Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
            {new Date(update.createdAt).toLocaleDateString()}
          </Typography>
        </div>

        <Typography variant="body2" className="mb-2">
          <strong>Description:</strong> {update.updateDescription}
        </Typography>

        <Typography variant="body2" className="mb-2">
          <strong>Completed Quantity:</strong> {update.taskCompletedQuantity}
        </Typography>

        {update.updatePhotos && update.updatePhotos.length > 0 && (
          <div className="mt-2">
            <Typography variant="body2" className="mb-1">
              <strong>Photos:</strong>
            </Typography>
            <div className="row">
              {update.updatePhotos && update.updatePhotos.length > 0 && (
                <div className="mt-2">
                  <Typography variant="body2" className="mb-1">
                    <strong>Attachments:</strong>
                  </Typography>
                  <div className="row">
                    {update.updatePhotos.map((file, index) => {
                      const isPDF = file.toLowerCase().endsWith(".pdf");
                      const fileName =
                        file.split("/").pop() || `file-${index + 1}`;

                      return (
                        <div
                          className="col-lg-3 col-md-4 col-sm-6 mb-2"
                          key={index}
                        >
                          {isPDF ? (
                            // PDF File - Show as button
                            <Button
                              variant="outlined"
                              color="white"
                              size="small"
                              fullWidth
                              onClick={() => window.open(file, "_blank")}
                              startIcon={
                                <i className="bi bi-file-earmark-pdf"></i>
                              }
                              className="text-start"
                              style={{
                                justifyContent: "flex-start",
                                textTransform: "none",
                                height: "50px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              View PDF
                            </Button>
                          ) : (
                            // Image File - Show as image
                            <img
                              src={file}
                              alt={`Update ${index + 1}`}
                              className="img-fluid rounded"
                              style={{
                                width: "100%",
                                height: "80px",
                                objectFit: "cover",
                                cursor: "pointer",
                              }}
                              onClick={() => window.open(file, "_blank")}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {update.updateDocuments && update.updateDocuments.length > 0 && (
          <div className="mt-2">
            <Typography variant="body2" className="mb-1">
              <strong>Documents:</strong>
            </Typography>
            {update.updateDocuments.map((doc, index) => (
              <div key={index}>
                <a
                  href={doc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-info"
                >
                  Document {index + 1}
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container">
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="py-4">
            <div className="d-flex flex-row gap-3 align-items-center justify-content-between">
              <h2 className="text-light d-inline" style={{ minWidth: "240px" }}>
                Task Details
              </h2>
              <button
                className="btn btn-primary rounded-4"
                onClick={() => window.open(data?.invoiceUrl, "_blank")}
              >
                Download Invoice
              </button>
            </div>
            <div className="mt-5">
              <div className="row">
                <div className="col-lg-6">
                  <h3 className="text-light">{data?.taskName}</h3>
                  <div className="d-flex lflex-row gap-2 justify-content-between">
                    <h5 className="text-light mt-4">
                      Qty: {data?.taskQuantity}
                    </h5>
                    <h5 className="text-light mt-4">
                      Remaining Qty:{" "}
                      {data?.taskQuantity - data?.taskCompletedQuantity}
                    </h5>
                  </div>

                  <p className="text-light fs-5 mt-4">{data?.description}</p>
                  <b className="text-light fs-5 py-4">
                    Day Rate / £ {data?.amount}
                  </b>

                  <div className="d-flex flex-row gap-2 mt-4">
                    <strong className="text-light">Status:</strong>
                    <span
                      className={`badge ms-2 ${
                        data.status === "completed"
                          ? "bg-success"
                          : "bg-warning"
                      }`}
                    >
                      {data.status}
                    </span>
                  </div>

                  <Box sx={{ width: "100%", typography: "body1", mt: 2 }}>
                    <h5 className="text-light mt-4">Task History</h5>

                    <div className="p-3">
                      {inProgressTasks.length > 0 ? (
                        data?.taskUpdateHistory.map((update, index) => (
                          <TaskUpdateCard key={update._id} update={update} />
                        ))
                      ) : (
                        <Typography
                          variant="body1"
                          className="text-light text-center py-4"
                        >
                          No in progress task updates found.
                        </Typography>
                      )}
                    </div>
                  </Box>
                </div>
                <div className="col-lg-6">
                  <div className="d-flex flex-row gap-2">
                    <div
                      className="border-primary d-none d-lg-flex"
                      style={{ border: "1px solid" }}
                    ></div>
                    <div className="d-flex flex-column align-items-center gap-3 w-100 ps-lg-4">
                      <h5 className="text-light text-center w-100">
                        Update task
                      </h5>
                      <Form className="w-100 text-light">
                        <Form.Group
                          className="mb-3"
                          controlId="exampleForm.ControlInput1"
                        >
                          <div className="d-flex flex-row justify-content-between mb-2">
                            <Form.Label>Enter Completed Quantity</Form.Label>
                          </div>
                          <Form.Control
                            type="text"
                            inputMode="number"
                            placeholder="Enter Completed Quantity"
                            className="bg-light rounded-5 px-4 py-3"
                            value={formData.quantity}
                            onChange={(e) =>
                              handleInputChange("quantity", e.target.value)
                            }
                          />
                        </Form.Group>
                        <Form.Group
                          className="mb-3"
                          controlId="exampleForm.ControlTextarea1"
                        >
                          <div className="d-flex flex-row justify-content-between mb-2">
                            <Form.Label>Description</Form.Label>
                          </div>
                          <Form.Control
                            type="text"
                            placeholder="Enter Update Description"
                            className="bg-light rounded-5 px-4 py-3"
                            value={formData.description}
                            onChange={(e) =>
                              handleInputChange("description", e.target.value)
                            }
                          />
                        </Form.Group>
                        {/* <Box
                          className="mt-2"
                          sx={{ width: "100%", typography: "body1" }}
                        >
                          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontSize: 18 }}
                            >
                              Task Status
                            </Typography>
                            <ToggleButtonGroup
                              color="primary"
                              value={alignment}
                              exclusive
                              onChange={handleChange}
                              aria-label="Platform"
                              className="mt-2 w-100 open-selection"
                            >
                              <ToggleButton
                                value="in progress"
                                className="w-100"
                              >
                                <i class="bi bi-hourglass-top me-2"></i> In
                                Progress
                              </ToggleButton>
                              <ToggleButton value="completed" className="w-100">
                                <i class="bi bi-check-circle-fill me-2"></i>{" "}
                                Completed
                              </ToggleButton>
                            </ToggleButtonGroup>
                          </Box>
                        </Box> */}
                        <p className="pt-4 text-light ">Upload File</p>
                        <Button
                          component="label"
                          role={undefined}
                          variant="outlined"
                          color="light"
                          fullWidth
                          tabIndex={-1}
                          style={{ border: "2px dashed" }}
                          className="text-light py-3"
                        >
                          Attach File
                          <VisuallyHiddenInput
                            type="file"
                            onChange={(event) => {
                              const files = Array.from(event.target.files);
                              if (files.length > 0) {
                                setImageUploaded([...imagesUploaded, ...files]);
                              }
                            }}
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
                          />
                        </Button>
                        <div className="row mt-3">
                          {imagesUploaded.map((file, index) => (
                            <div className="col-lg-4 col-md-6 mb-3" key={index}>
                              <div className="file-preview-container">
                                {isPDF(file) ? (
                                  // PDF Preview with iframe
                                  <div className="pdf-preview">
                                    <iframe
                                      src={URL.createObjectURL(file)}
                                      title={`PDF Preview ${index + 1}`}
                                      width="100%"
                                      height="150"
                                      style={{
                                        border:
                                          "1px solid rgba(255,255,255,0.3)",
                                        borderRadius: "4px",
                                      }}
                                    />
                                    <div className="text-center mt-1">
                                      <small className="text-light">
                                        {file.name}
                                      </small>
                                    </div>
                                  </div>
                                ) : isImage(file) ? (
                                  // Image Preview
                                  <div className="image-preview">
                                    <img
                                      src={URL.createObjectURL(file)}
                                      alt={`Uploaded ${index + 1}`}
                                      className="img-fluid rounded"
                                      style={{
                                        width: "100%",
                                        height: "150px",
                                        objectFit: "cover",
                                        border:
                                          "1px solid rgba(255,255,255,0.3)",
                                      }}
                                    />
                                    <div className="text-center mt-1">
                                      <small className="text-light">
                                        {file.name}
                                      </small>
                                    </div>
                                  </div>
                                ) : (
                                  // Other file types
                                  <div className="other-file-preview text-center p-2">
                                    <i className="bi bi-file-earmark text-light fs-1"></i>
                                    <div className="text-center">
                                      <small className="text-light d-block">
                                        {file.name}
                                      </small>
                                      <small className="text-muted">
                                        {file.type || "Unknown type"}
                                      </small>
                                    </div>
                                  </div>
                                )}
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  className="mt-1 w-100"
                                  onClick={() => {
                                    const newFiles = [...imagesUploaded];
                                    newFiles.splice(index, 1);
                                    setImageUploaded(newFiles);
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="contained"
                          className=" w-100 mt-3 py-3 rounded-4"
                          onClick={completeData}
                        >
                          Submit
                        </Button>
                      </Form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskDetail;
