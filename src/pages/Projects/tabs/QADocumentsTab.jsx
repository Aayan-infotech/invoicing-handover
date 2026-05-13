import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { S, fmtDate } from '../../../styles/theme';
import { SortIcon } from '../../../components/common/SortIcon';  // Change this line
import { SubToolbar } from '../../../components/project/SubToolbar';
import { Modal } from '../../../components/common/Modal';
import { PaginationBar } from '../../../components/common/Pagination';
import Loading from '../../../components/Loading/Loading';
import { fetchWithAuth } from '../../../utils/authFetch';
import { links } from '../../../contstants';
import { useDebounce } from '../../../hooks/useDebounce';

export function QADocumentsTab({ project }) {
  const userState = useSelector((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState([]);
  const [docTypes, setDocTypes] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, total_page: 1, per_page: 10, total_records: 0 });
  const [search, setSearch] = useState("");
  const debSearch = useDebounce(search, 600);
  const [sort, setSort] = useState({ key: "", direction: "" });
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ documentTypeId: "", documentFile: null });
  const [viewData, setViewData] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetchWithAuth(`${links.BASE_URL}projects/quality-assurance/${project._id}`, { 
        method: "GET", 
        params: { page: pagination.current_page, limit: pagination.per_page, search: debSearch, projectId: project._id, sortBy: sort.key, sortDirection: sort.direction } 
      });
      setDocs(r?.data?.data?.qualityAssurances || []);
      setPagination((p) => ({ ...p, ...r?.data?.data }));
    } catch { toast.error("Failed to load QA documents"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [pagination.current_page, debSearch, sort]);
  useEffect(() => { 
    fetchWithAuth(`${links.BASE_URL}projects/get-document-type-dropdown`)
      .then((r) => setDocTypes(r?.data?.data || []))
      .catch(() => {}); 
  }, []);

  const handleSort = (key) => setSort((p) => ({ key, direction: p.key === key && p.direction === "asc" ? "desc" : "asc" }));
  const openAdd = () => { setForm({ documentTypeId: "", documentFile: null }); setModal("add"); };
  const openEdit = (d) => { setForm({ id: d._id, documentTypeId: d.documentTypeId, documentFile: null }); setModal("edit"); };
  const openView = (d) => { setViewData(d); setModal("view"); };

  const handleDelete = async (id) => {
    const res = await Swal.fire({ title: "Delete document?", text: "This cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonText: "Delete", confirmButtonColor: "#c5221f" });
    if (res.isConfirmed) {
      try { 
        await axios.delete(`${links.BASE_URL}projects/quality-assurance/${id}`, { headers: { Authorization: `Bearer ${userState.userInfo.accessToken}` } }); 
        toast.success("Deleted"); 
        load(); 
      } catch { toast.error("Failed to delete"); }
    }
  };

  const save = async () => {
    if (!form.documentTypeId) { toast.error("Please select a document type"); return; }
    setSaving(true);
    const fd = new FormData();
    fd.append("projectId", project._id);
    fd.append("documentTypeId", form.documentTypeId);
    if (form.documentFile) fd.append("documentFile", form.documentFile);
    try {
      if (modal === "add") { 
        await axios.post(`${links.BASE_URL}projects/quality-assurance`, fd, { headers: { Authorization: `Bearer ${userState.userInfo.accessToken}`, "Content-Type": "multipart/form-data" } }); 
        toast.success("Document saved"); 
      } else { 
        await axios.put(`${links.BASE_URL}projects/quality-assurance/${form.id}`, fd, { headers: { Authorization: `Bearer ${userState.userInfo.accessToken}`, "Content-Type": "multipart/form-data" } }); 
        toast.success("Document updated"); 
      }
      setModal(null); 
      load();
    } catch (e) { toast.error(e?.response?.data?.message || "Failed"); }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: "30px", textAlign: "center" }}><Loading /></div>;

  return (
    <>
      <SubToolbar title="Quality Assurance Documents" search={search} onSearch={(e) => setSearch(e.target.value)} onAdd={openAdd} addLabel="+ Add Document" />
      <div style={{ overflowX: "auto" }}>
        <table style={{ ...S.table, borderRadius: 0, boxShadow: "none" }}>
          <thead>
            <tr>
              {[["documentName","Document Name"],["status","Status"]].map(([k,l]) => (
                <th key={k} style={S.th} onClick={() => handleSort(k)}>{l} <SortIcon sortConfig={sort} k={k} /></th>
              ))}
              <th style={S.th}>File</th>
              <th style={S.th}>Uploaded On</th>
              <th style={S.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.length > 0 ? docs.map((d, i) => (
              <tr key={d._id}>
                <td style={i % 2 === 0 ? S.td : S.tdAlt}>{d.documentName || "N/A"}</td>
                <td style={i % 2 === 0 ? S.td : S.tdAlt}><span style={S.badge(d.status ? "active" : "pending")}>{d.status ? "Active" : "Pending"}</span></td>
                <td style={i % 2 === 0 ? S.td : S.tdAlt}>
                  {d.documentFile ? <a href={d.documentFile} target="_blank" rel="noreferrer" style={{ color: "#1a73e8", fontWeight: "500", textDecoration: "none" }}>View ↗</a> : <span style={{ color: "#80868b" }}>—</span>}
                </td>
                <td style={i % 2 === 0 ? S.td : S.tdAlt}>{fmtDate(d.createdAt)}</td>
                <td style={i % 2 === 0 ? S.td : S.tdAlt}>
                  <i className="bi bi-eye" style={S.actionIcon("#1a73e8")} onClick={() => openView(d)} title="View" />
                  <i className="bi bi-pencil" style={S.actionIcon("#f9ab00")} onClick={() => openEdit(d)} title="Edit" />
                  <i className="bi bi-trash" style={S.actionIcon("#c5221f")} onClick={() => handleDelete(d._id)} title="Delete" />
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} style={{ ...S.td, textAlign: "center", color: "#80868b", padding: "30px" }}>No QA documents uploaded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <PaginationBar pagination={pagination} setPagination={setPagination} count={docs.length} />

      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Add QA Document" : "Edit QA Document"} onClose={() => setModal(null)}
          footer={<><button style={S.cancelBtn} onClick={() => setModal(null)}>Cancel</button><button style={S.primaryBtn(saving)} disabled={saving} onClick={save}>{saving ? "Saving..." : modal === "add" ? "Save Document" : "Update Document"}</button></>}>
          <div style={S.fGroup}><label style={S.label}>Document Type *</label>
            <select style={S.select} value={form.documentTypeId} onChange={(e) => setForm((f) => ({ ...f, documentTypeId: e.target.value }))}>
              <option value="">— Select Type —</option>
              {docTypes.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div style={S.fGroup}><label style={S.label}>Upload File {modal === "edit" ? "(leave blank to keep existing)" : "*"}</label>
            <input style={S.input} type="file" onChange={(e) => setForm((f) => ({ ...f, documentFile: e.target.files?.[0] || null }))} />
          </div>
        </Modal>
      )}

      {modal === "view" && viewData && (
        <Modal title="Document Details" onClose={() => setModal(null)} footer={<button style={S.cancelBtn} onClick={() => setModal(null)}>Close</button>}>
          <div style={S.viewGrid}>
            <div style={S.viewField}><span style={S.viewLabel}>Document Name</span><span style={S.viewValue}>{viewData.documentName || "N/A"}</span></div>
            <div style={S.viewField}><span style={S.viewLabel}>Status</span><span style={S.badge(viewData.status ? "active" : "pending")}>{viewData.status ? "Active" : "Pending"}</span></div>
            <div style={S.viewField}><span style={S.viewLabel}>Uploaded</span><span style={S.viewValue}>{fmtDate(viewData.createdAt)}</span></div>
            <div style={S.viewField}><span style={S.viewLabel}>Project</span><span style={S.viewValue}>{project.projectName}</span></div>
          </div>
          {viewData.documentFile && (
            <a href={viewData.documentFile} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: "8px", padding: "8px 16px", background: "#1a73e8", color: "#fff", borderRadius: "8px", textDecoration: "none", fontSize: "13px", fontWeight: "600" }}>Open File ↗</a>
          )}
        </Modal>
      )}
    </>
  );
}