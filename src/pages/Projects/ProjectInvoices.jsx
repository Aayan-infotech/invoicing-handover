import { useState, useEffect } from "react";
import "./Projects.css";
import axios from "axios";
import { fetchWithAuth } from "../../utils/authFetch";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import Pagination from "../../components/Pagination";
import { links } from "../../contstants";
import Loading from "../../components/Loading/Loading";
import { useSelector } from "react-redux";
import Table from "../../components/Table";
import SortableTh from "../../components/SortableTh";
import { useDebounce } from "../../hooks/useDebounce";

function ProjectInvoices() {
  const userState = useSelector((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);

  const [pagination, setPagination] = useState({
    current_page: 1,
    total_page: 1,
    per_page: 10,
    total_records: 0,
  });

  const [modalType, setModalType] = useState(null);
  const [disabled, setDisabled] = useState(false);

  const [formData, setFormData] = useState({
    invoiceId: "",
    status: "",
  });

  // ------------------- SEARCH + SORT --------------------
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 600);

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

  // ------------------- API CALL --------------------
  const fetchProjectInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${links.BASE_URL}projects/invoice`, {
        method: "GET",
        params: {
          page: pagination.current_page,
          limit: pagination.per_page,
          search: debouncedSearch,
          sortBy: sortConfig.key,
          sortDirection: sortConfig.direction,
        },
      });

      setInvoices(response?.data?.data?.invoices || []);
      setPagination({
        current_page: response?.data?.data?.current_page || 1,
        total_page: response?.data?.data?.total_page || 1,
        per_page: response?.data?.data?.per_page || 10,
        total_records: response?.data?.data?.total_records || 0,
      });

      setLoading(false);
    } catch {
      toast.error("Failed to fetch invoices");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectInvoices();
  }, [pagination.current_page, debouncedSearch, sortConfig]);

  // ------------------- MODAL HANDLERS --------------------
  const handleEdit = (idx) => {
    const invoice = invoices[idx];
    setFormData({
      invoiceId: invoice._id,
      status: invoice.status,
    });
    setModalType("edit");
  };

  const handleCloseModal = () => {
    setModalType(null);
    setFormData({
      invoiceId: "",
      status: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateInvoiceStatus = async () => {
    try {
      setDisabled(true);

      const result = await axios.put(
        `${links.BASE_URL}projects/update-invoice`,
        {
          invoiceId: formData.invoiceId,
          status: formData.status,
        },
        {
          headers: {
            Authorization: `Bearer ${userState.userInfo.accessToken}`,
          },
        }
      );

      toast.success("Invoice updated successfully");

      setInvoices((prev) =>
        prev.map((inv) =>
          inv._id === result.data.data._id ? result.data.data : inv
        )
      );

      handleCloseModal();
      setDisabled(false);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to update invoice details";

      toast.error(message);
      setDisabled(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      {/* ------------------- TABLE WRAPPER ------------------- */}
      <Table
        PageTitle="Invoice Management"
        pagination={pagination}
        setPagination={setPagination}
        dataLength={invoices.length}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
      >
        <table className="table table-bordered align-middle text-center table-striped">
          <thead className="table-dark">
            <tr>
              <SortableTh
                columnKey="projectName"
                label="Project Name"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <SortableTh
                columnKey="invoiceNumber"
                label="Invoice Number"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <SortableTh
                columnKey="UserName"
                label="User Name"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <th>Invoice</th>

              <SortableTh
                columnKey="status"
                label="Status"
                sortConfig={sortConfig}
                onSort={handleSort}
              />

              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {invoices.length > 0 ? (
              invoices.map((invoice, idx) => (
                <tr key={invoice._id}>
                  <td>{invoice.projectName}</td>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice?.userDetails?.username || "N/A"}</td>

                  <td>
                    <a href={invoice.invoiceUrl} target="_blank" rel="noreferrer">
                      View Invoice
                    </a>
                  </td>

                  <td>
                    {invoice.status === "paid" ? (
                      <span className="badge bg-success">Paid</span>
                    ) : invoice.status === "unpaid" ? (
                      <span className="badge bg-danger">Unpaid</span>
                    ) : invoice.status === "draft" ? (
                      <span className="badge bg-warning">Draft</span>
                    ) : (
                      <span className="badge bg-secondary">Pending</span>
                    )}
                  </td>

                  <td>
                    <i
                      className="bi bi-pencil text-warning fs-5"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleEdit(idx)}
                    ></i>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No invoices found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Table>

      {/* ------------------- MODAL ------------------- */}
      {modalType && (
        <div
          className="modal show fade d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Invoice Status</h5>
                <button className="btn-close" onClick={handleCloseModal}></button>
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label>Invoice Status</label>
                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="">Select Status</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseModal}>
                  Close
                </button>

                <Button
                  variant="primary"
                  disabled={disabled}
                  onClick={updateInvoiceStatus}
                >
                  {disabled ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProjectInvoices;
