import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { S, fmtDate } from '../../../styles/theme';
import { SortIcon } from '../../../components/common/SortIcon';
import { SubToolbar } from '../../../components/project/SubToolbar';
import { Modal } from '../../../components/common/Modal';
import { PaginationBar } from '../../../components/common/Pagination';
import Loading from '../../../components/Loading/Loading';
import { fetchWithAuth } from '../../../utils/authFetch';
import { links } from '../../../contstants';
import { useDebounce } from '../../../hooks/useDebounce';

export function ProjectTasksTab({ project, onProjectUpdate }) {
  const userState = useSelector((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [taskDefs, setTaskDefs] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, total_page: 1, per_page: 10, total_records: 0 });
  const [search, setSearch] = useState("");
  const debSearch = useDebounce(search, 600);
  const [sort, setSort] = useState({ key: "", direction: "" });
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ taskId: "", taskAmount: "", taskQuantity: "", description: "" });
  const [viewData, setViewData] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load tasks with proper error handling and state reset
  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debSearch) params.append('search', debSearch);
      if (sort.key) {
        params.append('sortBy', sort.key);
        params.append('sortDirection', sort.direction);
      }
      params.append('page', pagination.current_page);
      params.append('limit', pagination.per_page);
      
      const url = `${links.BASE_URL}projects/project-tasks/${project._id}?${params.toString()}`;
      const r = await fetchWithAuth(url, { method: "GET" });
      
      console.log('Tasks loaded:', r?.data?.data);
      
      const raw = r?.data?.data;
      if (Array.isArray(raw)) {
        setTasks(raw);
      } else if (raw?.projectTasks) {
        setTasks(raw.projectTasks);
        if (raw.pagination) setPagination(prev => ({ ...prev, ...raw.pagination }));
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error("Failed to load tasks");
      setTasks([]);
    }
    setLoading(false);
  }, [project._id, debSearch, sort.key, sort.direction, pagination.current_page, pagination.per_page]);

  // Load task dropdown options
  const loadTaskDropdown = useCallback(async () => {
    try {
      const r = await fetchWithAuth(`${links.BASE_URL}projects/task-dropdown`);
      setTaskDefs(r?.data?.data || []);
    } catch (error) {
      console.error('Failed to load task dropdown:', error);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    loadTaskDropdown();
  }, [loadTaskDropdown]);

  const handleSort = (key) => {
    setSort((prev) => ({ 
      key, 
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc" 
    }));
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const fc = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const openAdd = () => {
    setForm({ taskId: "", taskAmount: "", taskQuantity: "", description: "" });
    setModal("add");
  };

  const openEdit = (t) => {
    setForm({ 
      id: t._id, 
      taskId: t.taskId, 
      taskAmount: t.amount || "", 
      taskQuantity: t.taskQuantity || "", 
      description: t.description || "" 
    });
    setModal("edit");
  };

  const openView = async (t) => {
    try { 
      const r = await fetchWithAuth(`${links.BASE_URL}projects/task-details/${t._id}`); 
      setViewData({ ...t, taskUpdateHistory: r?.data?.data?.taskUpdateHistory || [] }); 
    } catch (error) {
      console.error('Failed to load task details:', error);
      setViewData({ ...t, taskUpdateHistory: [] }); 
    }
    setModal("view");
  };

  const save = async () => {
    if (!form.taskId) { 
      toast.error("Please select a task"); 
      return; 
    }
    
    setSaving(true);
    try {
      const body = { 
        projectId: project._id, 
        taskId: form.taskId, 
        amount: parseFloat(form.taskAmount) || 0, 
        taskQuantity: parseInt(form.taskQuantity) || 0, 
        description: form.description || "" 
      };
      
      let response;
      if (modal === "add") {
        response = await axios.post(`${links.BASE_URL}projects/project-tasks`, body, { 
          headers: { Authorization: `Bearer ${userState.userInfo.accessToken}` } 
        });
        toast.success("Task added successfully");
      } else {
        response = await axios.put(`${links.BASE_URL}projects/project-tasks/${form.id}`, body, { 
          headers: { Authorization: `Bearer ${userState.userInfo.accessToken}` } 
        });
        toast.success("Task updated successfully");
      }
      
      console.log('Save response:', response?.data);
      
      // Close modal and reset form
      setModal(null);
      setForm({ taskId: "", taskAmount: "", taskQuantity: "", description: "" });
      
      // Reload tasks to get updated data
      await loadTasks();
      
      // Update project data (this will refresh totalAmount and totalTasks)
      if (onProjectUpdate) {
        await onProjectUpdate();
      }
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error?.response?.data?.message || "Failed to save task");
    }
    setSaving(false);
  };

  const handleDelete = async (taskId) => {
    const result = await Swal.fire({
      title: "Delete Task?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#c5221f",
      confirmButtonText: "Yes, delete it!"
    });
    
    if (result.isConfirmed) {
      try {
        await axios.delete(`${links.BASE_URL}projects/project-tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${userState.userInfo.accessToken}` }
        });
        toast.success("Task deleted successfully");
        
        // Reload tasks after deletion
        await loadTasks();
        
        // Update project data
        if (onProjectUpdate) {
          await onProjectUpdate();
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(error?.response?.data?.message || "Failed to delete task");
      }
    }
  };

  if (loading) return <div style={{ padding: "30px", textAlign: "center" }}><Loading /></div>;

  return (
    <>
      <SubToolbar 
        title="Tasks for this project" 
        search={search} 
        onSearch={(e) => {
          setSearch(e.target.value);
          setPagination((prev) => ({ ...prev, current_page: 1 }));
        }} 
        onAdd={openAdd} 
        addLabel="+ Add Task" 
      />
      
      <div style={{ overflowX: "auto" }}>
        <table style={{ ...S.table, borderRadius: 0, boxShadow: "none" }}>
          <thead>
            <tr>
              {[["taskName", "Task Name"], ["taskQuantity", "Qty"],["rate","Rate (£)"], ["amount", "Amount (£)"], ['claimAmount','Claim Amount (£)'],['remainingAmount','To Be Claimed (£)']].map(([k, l]) => (
                <th key={k} style={S.th} onClick={() => handleSort(k)}>
                  {l} <SortIcon sortConfig={sort} k={k} />
                </th>
              ))}
              <th style={S.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length > 0 ? tasks.map((t, i) => (
              <tr key={t._id}>
                <td style={i % 2 === 0 ? S.td : S.tdAlt}>{t.taskName || "N/A"}</td>
                <td style={i % 2 === 0 ? S.td : S.tdAlt}>{t.taskQuantity ?? "—"}</td>
                <td style={i % 2 === 0 ? S.td : S.tdAlt}>
                  {t.amount ? `£${Number(t.amount).toFixed(2)}` : "—"}
                </td>
                {/* total amountv = quantiy* amount */}
                <td style={i % 2 === 0 ? S.td : S.tdAlt}>{t.taskQuantity * t.amount ? `£${Number(t.taskQuantity * t.amount).toFixed(2)}` : "—"}</td>
                {/* claim amount = completed quantity * rate */}
                <td style={i % 2 === 0 ? S.td : S.tdAlt}>{t.amount * t.taskCompletedQuantity ? `£${Number(t.amount * t.taskCompletedQuantity).toFixed(2)}` : "—"}</td>
               {/* remaining amount = total amount - claim amount */}
                <td style={i % 2 === 0 ? S.td : S.tdAlt}>{t.taskQuantity * t.amount - t.amount * t.taskCompletedQuantity ? `£${Number(t.taskQuantity * t.amount - t.amount * t.taskCompletedQuantity).toFixed(2)}` : "—"}</td>
                <td style={i % 2 === 0 ? S.td : S.tdAlt}>
                  <i 
                    className="bi bi-eye" 
                    style={S.actionIcon("#1a73e8")} 
                    onClick={() => openView(t)} 
                    title="View" 
                    // style={{ cursor: 'pointer', marginRight: '10px', color: '#1a73e8' }}
                  />
                  <i 
                    className="bi bi-pencil" 
                    style={{ cursor: 'pointer', marginRight: '10px', color: '#f9ab00' }}
                    onClick={() => openEdit(t)} 
                    title="Edit" 
                  />
                  <i 
                    className="bi bi-trash" 
                    style={{ cursor: 'pointer', color: '#c5221f' }}
                    onClick={() => handleDelete(t._id)} 
                    title="Delete" 
                  />
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ ...S.td, textAlign: "center", color: "#80868b", padding: "30px" }}>
                  No tasks found for this project
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <PaginationBar pagination={pagination} setPagination={setPagination} count={tasks.length} />

      {/* Add/Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <Modal 
          title={modal === "add" ? "Add Task" : "Edit Task"} 
          onClose={() => {
            setModal(null);
            setForm({ taskId: "", taskAmount: "", taskQuantity: "", description: "" });
          }}
          footer={
            <>
              <button style={S.cancelBtn} onClick={() => setModal(null)}>Cancel</button>
              <button style={S.primaryBtn(saving)} disabled={saving} onClick={save}>
                {saving ? "Saving..." : modal === "add" ? "Add Task" : "Update"}
              </button>
            </>
          }
        >
          <div style={S.fGroup}>
            <label style={S.label}>Task *</label>
            <select style={S.select} value={form.taskId} onChange={fc("taskId")}>
              <option value="">— Select Task —</option>
              {taskDefs.map((t) => (
                <option key={t._id} value={t._id}>{t.taskName}</option>
              ))}
            </select>
          </div>
          <div style={S.grid2}>
            <div style={S.fGroup}>
              <label style={S.label}>Amount (£)</label>
              <input 
                style={S.input} 
                type="number" 
                step="0.01"
                value={form.taskAmount} 
                onChange={fc("taskAmount")} 
                placeholder="0.00" 
              />
            </div>
            <div style={S.fGroup}>
              <label style={S.label}>Quantity</label>
              <input 
                style={S.input} 
                type="number" 
                value={form.taskQuantity} 
                onChange={fc("taskQuantity")} 
                placeholder="0" 
              />
            </div>
          </div>
          <div style={S.fGroup}>
            <label style={S.label}>Description</label>
            <textarea 
              style={S.textarea} 
              value={form.description} 
              onChange={fc("description")} 
              placeholder="Optional description..."
            />
          </div>
        </Modal>
      )}

      {/* View Modal */}
      {modal === "view" && viewData && (
        <Modal 
          title="Task Details" 
          onClose={() => setModal(null)} 
          footer={<button style={S.cancelBtn} onClick={() => setModal(null)}>Close</button>}
        >
          <div style={S.viewGrid}>
            <div style={S.viewField}>
              <span style={S.viewLabel}>Task Name</span>
              <span style={S.viewValue}>{viewData.taskName || "N/A"}</span>
            </div>
            <div style={S.viewField}>
              <span style={S.viewLabel}>Amount</span>
              <span style={S.viewValue}>
                {viewData.amount ? `£${Number(viewData.amount).toFixed(2)}` : "N/A"}
              </span>
            </div>
            <div style={S.viewField}>
              <span style={S.viewLabel}>Quantity</span>
              <span style={S.viewValue}>{viewData.taskQuantity || "N/A"}</span>
            </div>
            <div style={S.viewField}>
              <span style={S.viewLabel}>Completed</span>
              <span style={S.viewValue}>{viewData.taskCompletedQuantity ?? "N/A"}</span>
            </div>
            <div style={S.viewField}>
              <span style={S.viewLabel}>Status</span>
              <span style={S.badge(viewData.status || "pending")}>
                {viewData.status || "Pending"}
              </span>
            </div>
          </div>
          
          {viewData.assignedUsers?.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <div style={S.sectionHead}>Assigned Users</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                {viewData.assignedUsers.map((u) => (
                  <div key={u.userId} style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "6px", 
                    padding: "6px 12px", 
                    borderRadius: "20px", 
                    background: "#e8f0fe", 
                    border: "1px solid #dadce0" 
                  }}>
                    {u.profile_image ? (
                      <img 
                        src={u.profile_image} 
                        alt="" 
                        style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }} 
                      />
                    ) : (
                      <span style={{ 
                        width: "20px", 
                        height: "20px", 
                        borderRadius: "50%", 
                        background: "#1a73e8", 
                        color: "#fff", 
                        fontSize: "10px", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        fontWeight: "700" 
                      }}>
                        {u.username?.[0]?.toUpperCase()}
                      </span>
                    )}
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: "600", color: "#3c4043" }}>{u.username}</div>
                      {u.name && <div style={{ fontSize: "10px", color: "#80868b" }}>{u.name}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {viewData.description && (
            <div style={{ ...S.viewField, marginBottom: "16px" }}>
              <span style={S.viewLabel}>Description</span>
              <span style={S.viewValue}>{viewData.description}</span>
            </div>
          )}
          
          <div style={S.sectionHead}>Update History</div>
          <table style={{ ...S.table, marginTop: "0" }}>
            <thead>
              <tr>
                {["#", "Description", "Media", "Status", "Date"].map((h) => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {viewData.taskUpdateHistory?.length > 0 ? (
                viewData.taskUpdateHistory.map((u, i) => (
                  <tr key={i}>
                    <td style={S.td}>{i + 1}</td>
                    <td style={S.td}>{u.updateDescription}</td>
                    <td style={S.td}>
                      {u.updatePhotos?.map((ph, j) => (
                        <a key={j} href={ph} target="_blank" rel="noreferrer" style={{ color: "#1a73e8", display: "block" }}>
                          View {j + 1}
                        </a>
                      ))}
                    </td>
                    <td style={S.td}>
                      <span style={S.badge(u.status)}>{u.status}</span>
                    </td>
                    <td style={S.td}>{fmtDate(u.updatedAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ ...S.td, textAlign: "center", color: "#80868b" }}>No updates yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </Modal>
      )}
    </>
  );
}