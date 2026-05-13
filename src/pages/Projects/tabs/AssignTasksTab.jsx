import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { S } from '../../../styles/theme';
import { SortIcon } from '../../../components/common/SortIcon';  // Change this line
import { SubToolbar } from '../../../components/project/SubToolbar';
import { Modal } from '../../../components/common/Modal';
import { PaginationBar } from '../../../components/common/Pagination';
import Loading from '../../../components/Loading/Loading';
import { fetchWithAuth } from '../../../utils/authFetch';
import { links } from '../../../contstants';
import { useDebounce } from '../../../hooks/useDebounce';

export function AssignTasksTab({ project }) {
  const userState = useSelector((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [assigned, setAssigned] = useState([]);
  const [taskOptions, setTaskOptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, total_page: 1, per_page: 10, total_records: 0 });
  const [search, setSearch] = useState("");
  const debSearch = useDebounce(search, 600);
  const [sort, setSort] = useState({ key: "", direction: "" });
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ taskId: "", userId: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetchWithAuth(`${links.BASE_URL}projects/assign-tasks/${project._id}`, { 
        method: "GET", 
        params: { page: pagination.current_page, limit: pagination.per_page, search: debSearch, projectId: project._id, sortBy: sort.key, sortDirection: sort.direction } 
      });
      setAssigned(r?.data?.data?.tasks || []);
      setPagination((p) => ({ ...p, ...r?.data?.data }));
    } catch { toast.error("Failed to load assigned tasks"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [pagination.current_page, debSearch, sort]);
  useEffect(() => {
    Promise.all([
      fetchWithAuth(`${links.BASE_URL}projects/project-tasks/${project._id}`), 
      fetchWithAuth(`${links.BASE_URL}users/all-verified-users`)
    ]).then(([tR, uR]) => {
      const raw = tR?.data?.data;
      setTaskOptions(Array.isArray(raw) ? raw : raw?.projectTasks || []);
      setUsers(uR?.data?.data || []);
    }).catch(() => {});
  }, []);

  const handleSort = (key) => setSort((p) => ({ key, direction: p.key === key && p.direction === "asc" ? "desc" : "asc" }));
  const fc = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const openAdd = () => { setForm({ taskId: "", userId: "" }); setModal("add"); };
  const openEdit = (item) => { setForm({ id: item._id, taskId: item.taskId, userId: item.userId }); setModal("edit"); };
  const openView = (item) => { setForm({ taskName: item.taskName, username: item.username }); setModal("view"); };

  const save = async () => {
    if (!form.taskId || !form.userId) { toast.error("Please select task and user"); return; }
    setSaving(true);
    try {
      const body = { projectId: project._id, taskId: form.taskId, userId: form.userId };
      if (modal === "add") { 
        await axios.post(`${links.BASE_URL}projects/assign-tasks`, body, { headers: { Authorization: `Bearer ${userState.userInfo.accessToken}` } }); 
        toast.success("Task assigned"); 
      } else { 
        await axios.put(`${links.BASE_URL}projects/assign-tasks/${form.id}`, body, { headers: { Authorization: `Bearer ${userState.userInfo.accessToken}` } }); 
        toast.success("Updated"); 
      }
      setModal(null); 
      load();
    } catch (e) { toast.error(e?.response?.data?.message || "Failed"); }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: "30px", textAlign: "center" }}><Loading /></div>;

  return (
    <>
      <SubToolbar title="Task Assignments" search={search} onSearch={(e) => setSearch(e.target.value)} onAdd={openAdd} addLabel="+ Assign Task" />
      <div style={{ overflowX: "auto" }}>
        <table style={{ ...S.table, borderRadius: 0, boxShadow: "none" }}>
          <thead>
            <tr>
              {[["taskName","Task Name"],["username","Assigned To"]].map(([k,l]) => (
                <th key={k} style={S.th} onClick={() => handleSort(k)}>{l} <SortIcon sortConfig={sort} k={k} /></th>
              ))}
              <th style={S.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assigned.length > 0 ? assigned.map((item, i) => (
              <tr key={item._id}>
                <td style={i % 2 === 0 ? S.td : S.tdAlt}>{item.taskName || "N/A"}</td>
                <td style={i % 2 === 0 ? S.td : S.tdAlt}>{item.username || "N/A"}</td>
                <td style={i % 2 === 0 ? S.td : S.tdAlt}>
                  <i className="bi bi-eye" style={S.actionIcon("#1a73e8")} onClick={() => openView(item)} title="View" />
                  <i className="bi bi-pencil" style={S.actionIcon("#f9ab00")} onClick={() => openEdit(item)} title="Edit" />
                </td>
              </tr>
            )) : (
              <tr><td colSpan={3} style={{ ...S.td, textAlign: "center", color: "#80868b", padding: "30px" }}>No tasks assigned yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <PaginationBar pagination={pagination} setPagination={setPagination} count={assigned.length} />

      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Assign Task" : "Edit Assignment"} onClose={() => setModal(null)}
          footer={<><button style={S.cancelBtn} onClick={() => setModal(null)}>Cancel</button><button style={S.primaryBtn(saving)} disabled={saving} onClick={save}>{saving ? "Saving..." : modal === "add" ? "Assign" : "Update"}</button></>}>
          <div style={S.fGroup}><label style={S.label}>Select Task *</label>
            <select style={S.select} value={form.taskId} onChange={fc("taskId")}>
              <option value="">— Select Task —</option>
              {taskOptions.map((t) => <option key={t._id} value={t._id}>{t.taskName}</option>)}
            </select>
          </div>
          <div style={S.fGroup}><label style={S.label}>Assign To *</label>
            <select style={S.select} value={form.userId} onChange={fc("userId")}>
              <option value="">— Select User —</option>
              {users.map((u) => <option key={u.userId} value={u.userId}>{u.username}{u.name ? ` (${u.name})` : ""}</option>)}
            </select>
          </div>
        </Modal>
      )}

      {modal === "view" && (
        <Modal title="Assignment Details" onClose={() => setModal(null)} footer={<button style={S.cancelBtn} onClick={() => setModal(null)}>Close</button>}>
          <div style={S.viewGrid}>
            <div style={S.viewField}><span style={S.viewLabel}>Project</span><span style={S.viewValue}>{project.projectName}</span></div>
            <div style={S.viewField}><span style={S.viewLabel}>Task</span><span style={S.viewValue}>{form.taskName || "N/A"}</span></div>
            <div style={S.viewField}><span style={S.viewLabel}>Assigned To</span><span style={S.viewValue}>{form.username || "N/A"}</span></div>
          </div>
        </Modal>
      )}
    </>
  );
}