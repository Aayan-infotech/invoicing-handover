import { useState, useEffect } from "react";
import "./Projects.css";
import axios from "axios";
import { fetchWithAuth } from "../../utils/authFetch";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { links } from "../../contstants";
import Loading from "../../components/Loading/Loading";
import { useSelector } from "react-redux";
import Table from "../../components/Table";
import SortableTh from "../../components/SortableTh";
import { useDebounce } from "../../hooks/useDebounce";

function QualityAssurance() {
  const userState = useSelector((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [document, setDocument] = useState([]);

  const [pagination, setPagination] = useState({
    current_page: 1,
    total_page: 1,
    per_page: 10,
    total_records: 0,
  });

  const [modalType, setModalType] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [documentTypes, setDocumentTypes] = useState([]);
  // const [selectedDocIndex, setSelectedDocIndex] = useState(null);

  const [formData, setFormData] = useState({
    projectId: "",
    documentTypeId: "",
    documentFile: null,
  });

  // -------------------- SEARCH + SORT --------------------
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 600);

  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "",
  });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));

    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const clearSearch = () => {
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  // -------------------- API CALLS --------------------

  const fetchProjects = async () => {
    try {
      const response = await fetchWithAuth(`${links.BASE_URL}projects/project-dropdown`);
      setProjects(response?.data?.data || []);
    } catch {
      toast.error("Failed to fetch projects");
    }
  };

  const fetchDocumentTypes = async () => {
    try {
      const response = await fetchWithAuth(
        `${links.BASE_URL}projects/get-document-type-dropdown`
      );
      setDocumentTypes(response?.data?.data || []);
    } catch {
      toast.error("Failed to fetch document types");
    }
  };

  const fetchDocument = async () => {
    try {
      setLoading(true);

      const response = await fetchWithAuth(
        `${links.BASE_URL}projects/quality-assurance`,
        {
          method: "GET",
          params: {
            page: pagination.current_page,
            limit: pagination.per_page,
            search: debouncedSearchTerm,
            sortBy: sortConfig.key,
            sortDirection: sortConfig.direction,
          },
        }
      );

      setDocument(response?.data?.data?.qualityAssurances || []);

      setPagination({
        current_page: response?.data?.data?.current_page || 1,
        total_page: response?.data?.data?.total_page || 1,
        per_page: response?.data?.data?.per_page || 10,
        total_records: response?.data?.data?.total_records || 0,
      });

      setLoading(false);
    } catch {
      toast.error("Failed to fetch QA documents");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchDocumentTypes();
    fetchDocument();
  }, [pagination.current_page, debouncedSearchTerm, sortConfig]);

  // -------------------- MODAL HANDLERS --------------------

  const handleAddDoc = () => {
    setModalType("add");
    setFormData({
      projectId: "",
      documentTypeId: "",
      documentFile: null,
    });
  };

  const handleCloseModal = () => {
    setModalType(null);
    // setSelectedDocIndex(null);
    setDisabled(false);
    setFormData({
      projectId: "",
      documentTypeId: "",
      documentFile: null,
    });
  };

  const handleView = (index) => {
    const doc = document[index];
    // setSelectedDocIndex(index);

    setFormData({
      projectName: doc.projectName,
      documentName: doc.documentName,
      documentFile: doc.documentFile,
      status: doc.status,
    });

    setModalType("view");
  };

  const handleEdit = (index) => {
    const doc = document[index];
    // setSelectedDocIndex(index);

    setFormData({
      _id: doc._id,
      projectId: doc.projectId,
      documentTypeId: doc.documentTypeId,
      documentFile: null,
    });

    setModalType("edit");
  };

  const handleDelete = async (docId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You cannot undo this!",
      icon: "warning",
      confirmButtonText: "Delete",
      showCancelButton: true,
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${links.BASE_URL}projects/quality-assurance/${docId}`, {
          headers: {
            Authorization: `Bearer ${userState.userInfo.accessToken}`,
          },
        });

        toast.success("Deleted");
        fetchDocument();
      } catch {
        toast.error("Failed to delete");
      }
    }
  };

  // -------------------- FORM HANDLERS --------------------

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, documentFile: file }));
    }
  };

  const saveDocument = async () => {
    if (!formData.projectId || !formData.documentTypeId) {
      toast.error("Please select project and document type");
      return;
    }

    setDisabled(true);

    const fd = new FormData();
    fd.append("projectId", formData.projectId);
    fd.append("documentTypeId", formData.documentTypeId);
    fd.append("documentFile", formData.documentFile);

    try {
      await axios.post(`${links.BASE_URL}projects/quality-assurance`, fd, {
        headers: {
          Authorization: `Bearer ${userState.userInfo.accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Document saved");
      fetchDocument();
      handleCloseModal();
    } catch {
      toast.error("Failed to save");
    }

    setDisabled(false);
  };

  const updateDocument = async () => {
    if (!formData.projectId || !formData.documentTypeId) {
      toast.error("Missing fields");
      return;
    }

    setDisabled(true);

    const fd = new FormData();
    fd.append("projectId", formData.projectId);
    fd.append("documentTypeId", formData.documentTypeId);

    if (formData.documentFile) {
      fd.append("documentFile", formData.documentFile);
    }

    try {
      await axios.put(
        `${links.BASE_URL}projects/quality-assurance/${formData._id}`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${userState.userInfo.accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Updated");
      fetchDocument();
      handleCloseModal();
    } catch {
      toast.error("Failed to update");
    }

    setDisabled(false);
  };

  if (loading) return <Loading />;

  return (
    <>
      {/* -------------------- TABLE WRAPPER -------------------- */}
      <Table
        PageTitle="Quality Assurance"
        pagination={pagination}
        setPagination={setPagination}
        dataLength={document.length}
        handleAdd={handleAddDoc}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
      >
        <table className="table table-bordered text-center table-striped">
          <thead className="table-dark">
            <tr>
              <SortableTh
                columnKey="projectName"
                label="Project Name"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <SortableTh
                columnKey="documentName"
                label="Document Name"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <SortableTh
                columnKey="status"
                label="Status"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <th>Document File</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {document.length > 0 ? (
              document.map((doc, idx) => (
                <tr key={doc._id}>
                  <td>{doc.projectName}</td>
                  <td>{doc.documentName}</td>
                  <td>
                    {doc.status ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-warning">Pending</span>
                    )}
                  </td>
                  <td>
                    {doc.documentFile ? (
                      <a href={doc.documentFile} target="_blank">
                        View
                      </a>
                    ) : (
                      "No File"
                    )}
                  </td>

                  <td>
                    <i
                      className="bi bi-eye text-primary fs-5 me-3"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleView(idx)}
                    ></i>
                    <i
                      className="bi bi-pencil text-warning fs-5"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleEdit(idx)}
                    ></i>
                    <i
                      className="bi bi-trash text-danger fs-5 ms-3"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDelete(doc._id)}
                    ></i>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No documents found</td>
              </tr>
            )}
          </tbody>
        </table>
      </Table>

      {/* -------------------- MODAL -------------------- */}
      {modalType && (
        <div className="modal show fade d-block" style={{ background: "#00000080" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalType === "add"
                    ? "Add Document"
                    : modalType === "view"
                    ? "View Document"
                    : "Edit Document"}
                </h5>
                <button className="btn-close" onClick={handleCloseModal}></button>
              </div>

              <div className="modal-body">
                {modalType === "view" ? (
                  <>
                    <p><strong>Project:</strong> {formData.projectName}</p>
                    <p><strong>Document:</strong> {formData.documentName}</p>
                    <p><strong>Status:</strong> {formData.status ? "Active" : "Pending"}</p>

                    {formData.documentFile ? (
                      <a href={formData.documentFile} target="_blank">View File</a>
                    ) : (
                      "No File"
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Select Project *</label>
                      <select
                        name="projectId"
                        className="form-select"
                        value={formData.projectId}
                        onChange={handleChange}
                      >
                        <option value="">Select Project</option>
                        {projects.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.projectName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Select Document Type *</label>
                      <select
                        name="documentTypeId"
                        className="form-select"
                        value={formData.documentTypeId}
                        onChange={handleChange}
                      >
                        <option value="">Select Type</option>
                        {documentTypes.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Upload Document *</label>
                      <input type="file" className="form-control" onChange={handleFileChange} />
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseModal}>
                  Close
                </button>

                {modalType === "add" && (
                  <Button disabled={disabled} onClick={saveDocument}>
                    Save
                  </Button>
                )}

                {modalType === "edit" && (
                  <Button disabled={disabled} onClick={updateDocument}>
                    Update
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default QualityAssurance;
