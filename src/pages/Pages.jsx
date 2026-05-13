import { useState, useEffect, use } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import axios from "axios";
import { fetchWithAuth } from "../utils/authFetch";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Editor from "../components/TextEditor/TextEditor";
import { links } from "../contstants";
import Loading from "../components/Loading/Loading";
import { useSelector } from "react-redux";

function Pages() {
  const userState = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [document, setDocument] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_page: 1,
    per_page: 10,
    total_records: 0,
  });
  const [modalType, setModalType] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [formData, setFormData] = useState({
    pageName: "",
    pageURL: "",
    pageDescription: "",
    _id: "",
  });

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${links.BASE_URL}pages`, {
        method: "GET",
      });
      setDocument(response?.data?.data?.pages ? response.data.data.pages : []);
      setLoading(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch documents");
      setLoading(false);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, []);

  const handleAddPage = () => {
    setModalType("add");
    setFormData({
      pageName: "",
      pageURL: "",
      pageDescription: "",
      _id: "",
    });
  };

  const handleView = (index) => {
    const selectedDoc = document[index];
    setFormData({
      pageName: selectedDoc.pageName || "",
      pageURL: selectedDoc.pageURL || selectedDoc.pageUrl || "",
      pageDescription:
        selectedDoc.pageDescription || selectedDoc.description || "",
      _id: selectedDoc._id || "",
    });
    setModalType("view");
  };

  const handleEdit = (index) => {
    const selectedDoc = document[index];
    setFormData({
      pageName: selectedDoc.pageName || "",
      pageURL: selectedDoc.pageURL || selectedDoc.pageUrl || "",
      pageDescription: selectedDoc.description || "",
      _id: selectedDoc._id || "",
    });
    setModalType("edit");
  };

  const handleDelete = async (documentId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const response = await axios.delete(
          `${links.BASE_URL}pages/${documentId}`,
          {
            headers: {
              Authorization: `Bearer ${userState.userInfo.accessToken}`,
            },
          }
        );

        if (response.status === 200) {
          toast.success("Page deleted successfully");
          fetchDocument(); // Refresh the list
          Swal.fire("Deleted!", "Your page has been deleted.", "success");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete page");
      Swal.fire("Error!", "Failed to delete the page.", "error");
    }
  };

  const handleCloseModal = () => {
    setModalType(null);
    setDisabled(false);
    setFormData({
      pageName: "",
      pageURL: "",
      pageDescription: "",
      _id: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "documentType") {
      setDocumentType(value);
    }

    // Handle project selection
    if (name === "projectId") {
      const selectedProject = projects.find((project) => project._id === value);
      setFormData((prev) => ({
        ...prev,
        projectId: value,
        projectName: selectedProject ? selectedProject.projectName : "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.total_page) {
      setPagination((prev) => ({ ...prev, current_page: newPage }));
    }
  };

  const savePages = async () => {
    if (!formData.pageName || !formData.pageURL) {
      if (!formData.pageName) {
        toast.error("Please enter a page name.");
      } else if (!formData.pageURL) {
        toast.error("Please enter a page URL.");
      }
      return;
    }

    setDisabled(true);
    const data = {
      pageName: formData.pageName,
      pageURL: formData.pageURL,
      pageDescription: formData.pageDescription,
    };

    try {
      const response = await axios.post(`${links.BASE_URL}pages`, data, {
        headers: {
          Authorization: `Bearer ${userState.userInfo.accessToken}`,
        },
      });
      toast.success("Page saved successfully");
      fetchDocument();
      handleCloseModal();
      setDisabled(false);
    } catch (err) {
      setDisabled(false);
      toast.error(err.response?.data?.message || "Failed to save page");
    }
  };

  const updatePage = async () => {
    if (!formData.pageName || !formData.pageURL) {
      if (!formData.pageName) {
        toast.error("Please enter a page name.");
      } else if (!formData.pageURL) {
        toast.error("Please enter a page URL.");
      }
      return;
    }

    setDisabled(true);
    const data = {
      pageName: formData.pageName,
      pageURL: formData.pageURL,
      pageDescription: formData.pageDescription,
    };

    try {
      const response = await axios.put(
        `${links.BASE_URL}pages/${formData._id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${userState.userInfo.accessToken}`,
          },
        }
      );
      toast.success("Page updated successfully");
      fetchDocument();
      handleCloseModal();
      setDisabled(false);
    } catch (err) {
      setDisabled(false);
      toast.error(err.response?.data?.message || "Failed to update page");
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-dark">Pages</h3>
        <Button title="Add Page" onClick={handleAddPage} variant="primary">
          Add Page
        </Button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered align-middle text-center table-striped">
          <thead className="table-dark">
            <tr>
              <th>Page Name</th>
              <th>Page URL</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {document.length > 0 ? (
              document.map((page, idx) => (
                <tr key={page._id}>
                  <td>{page.pageName || "N/A"}</td>
                  <td>
                    <a
                      href={page.pageURL || page.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      {page.pageURL || page.pageUrl || "N/A"}
                    </a>
                  </td>

                  <td>
                    <i
                      className="bi bi-eye text-primary fs-5 me-3"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleView(idx)}
                      title="View Page"
                    ></i>
                    <i
                      className="bi bi-pencil text-warning fs-5"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleEdit(idx)}
                      title="Edit Page"
                    ></i>
                    <i
                      className="bi bi-trash text-danger fs-5 ms-3"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDelete(page._id)}
                      title="Delete Page"
                    ></i>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No pages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {/* Modal */}
      {modalType && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalType === "add"
                    ? "Add Page"
                    : modalType === "view"
                    ? "View Page"
                    : "Edit Page"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                {modalType === "add" ? (
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label htmlFor="pageName" className="form-label">
                          Page Name *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="pageName"
                          name="pageName"
                          value={formData.pageName}
                          onChange={handleChange}
                          placeholder="Enter page name"
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="pageURL" className="form-label">
                          Page URL *
                        </label>
                        <input
                          type="url"
                          className="form-control"
                          id="pageURL"
                          name="pageURL"
                          value={formData.pageURL}
                          onChange={handleChange}
                          placeholder="Enter page URL (e.g., https://example.com)"
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="pageDescription" className="form-label">
                          Page Description
                        </label>
                        <div className="text-editor-container mb-5">
                          <Editor
                            name="pageDescription"
                            value={formData.pageDescription}
                            onChange={handleChange}
                            placeholder="Enter page description..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : modalType === "view" ? (
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3 d-flex">
                        <div className="fw-semibold w-25">📌 Page Name:</div>
                        <div className="text-muted">
                          {formData?.pageName || "N/A"}
                        </div>
                      </div>
                      <div className="mb-3 d-flex">
                        <div className="fw-semibold w-25">🔗 Page URL:</div>
                        <div className="text-muted">
                          {formData?.pageURL ? (
                            <a
                              href={formData.pageURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-decoration-none"
                            >
                              {formData.pageURL}
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="fw-semibold mb-2">
                          📄 Page Description:
                        </div>
                        <div
                          className="border p-3 rounded bg-light"
                          style={{ minHeight: "100px", wordWrap: "break-word" }}
                          dangerouslySetInnerHTML={{
                            __html:
                              formData?.pageDescription ||
                              "No description available",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // Edit Mode
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label htmlFor="pageName" className="form-label">
                          Page Name *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="pageName"
                          name="pageName"
                          value={formData.pageName}
                          onChange={handleChange}
                          placeholder="Enter page name"
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="pageURL" className="form-label">
                          Page URL *
                        </label>
                        <input
                          type="url"
                          className="form-control"
                          id="pageURL"
                          name="pageURL"
                          value={formData.pageURL}
                          onChange={handleChange}
                          placeholder="Enter page URL (e.g., https://example.com)"
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="pageDescription" className="form-label">
                          Page Description
                        </label>
                        <div className="text-editor-container mb-3">
                          <Editor
                            name="pageDescription"
                            value={formData.pageDescription}
                            onChange={handleChange}
                            placeholder="Enter page description..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
                {modalType === "add" ? (
                  <Button
                    variant="primary"
                    onClick={savePages}
                    disabled={disabled}
                  >
                    {disabled ? "Saving..." : "Save"}
                  </Button>
                ) : modalType === "edit" ? (
                  <Button
                    variant="primary"
                    onClick={updatePage}
                    disabled={disabled}
                  >
                    {disabled ? "Updating..." : "Update"}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Pages;
