import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ProjectCard } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { PaginationBar } from '../../components/common/Pagination';
import Loading from '../../components/Loading/Loading';
import { useProjects } from '../../hooks/useProjects';
import { links } from '../../contstants';
import { S,fmtDateInput } from '../../styles/theme';

export function ProjectList({ onOpen }) {
  const userState = useSelector((s) => s.user);
  const { projects, loading, pagination, setPagination, search, setSearch, reload } = useProjects();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ projectName: "", startDate: "", endDate: "", description: "", status: "active" });
  const [saving, setSaving] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const fc = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const openAdd = () => { 
    setForm({ projectName: "", startDate: "", endDate: "", description: "", status: "active" }); 
    setModal("add"); 
  };
  
  const openEdit = (p) => { 
    setForm({ 
      id: p._id, 
      projectName: p.projectName, 
      startDate: fmtDateInput(p.startDate), 
      endDate: fmtDateInput(p.endDate), 
      description: p.description, 
      status: p.status 
    }); 
    setModal("edit"); 
  };

  const save = async () => {
    if (!form.projectName.trim()) { 
      toast.error("Project name is required"); 
      return; 
    }
    setSaving(true);
    try {
      if (modal === "add") {
        const r = await axios.post(`${links.BASE_URL}projects`, form, { 
          headers: { Authorization: `Bearer ${userState.userInfo.accessToken}` } 
        });
        toast.success("Project created");
      } else {
        const { id, ...payload } = form;
        await axios.put(`${links.BASE_URL}projects/update/${id}`, payload, { 
          headers: { Authorization: `Bearer ${userState.userInfo.accessToken}` } 
        });
        toast.success("Project updated");
      }
      setModal(null);
      reload();
    } catch (e) { 
      toast.error(e?.response?.data?.message || "Failed"); 
    }
    setSaving(false);
  };

  if (loading) return <Loading />;

  return (
    <div style={S.page}>
      <div style={S.toolbar}>
        <span style={S.toolbarTitle}>📁 Projects</span>
        <input 
          style={S.searchBox} 
          placeholder="Search projects..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
        <button style={S.addBtn} onClick={openAdd}>+ Add Project</button>
      </div>

      <div style={S.listWrap}>
        {projects.length > 0 ? projects.map((p) => (
          <ProjectCard 
            key={p._id}
            project={p}
            onOpen={onOpen}
            onEdit={openEdit}
            activeMenuId={activeMenuId}
            setActiveMenuId={setActiveMenuId}
          />
        )) : (
          <div style={S.empty}>
            No projects yet. Click <strong>+ Add Project</strong> to create one.
          </div>
        )}
      </div>

      <PaginationBar pagination={pagination} setPagination={setPagination} count={projects.length} />

      {modal && (
        <Modal 
          title={modal === "add" ? "Add Project" : "Edit Project"} 
          onClose={() => setModal(null)}
          footer={
            <>
              <button style={S.cancelBtn} onClick={() => setModal(null)}>Cancel</button>
              <button style={S.primaryBtn(saving)} disabled={saving} onClick={save}>
                {saving ? "Saving..." : modal === "add" ? "Create Project" : "Update Project"}
              </button>
            </>
          }
        >
          <div style={S.fGroup}>
            <label style={S.label}>Project Name *</label>
            <input style={S.input} value={form.projectName} onChange={fc("projectName")} placeholder="Enter project name" />
          </div>
          <div style={S.grid2}>
            <div style={S.fGroup}>
              <label style={S.label}>Start Date</label>
              <input style={S.input} type="date" value={form.startDate} onChange={fc("startDate")} />
            </div>
            <div style={S.fGroup}>
              <label style={S.label}>End Date</label>
              <input style={S.input} type="date" value={form.endDate} onChange={fc("endDate")} />
            </div>
          </div>
          {modal === "edit" && (
            <div style={S.fGroup}>
              <label style={S.label}>Status</label>
              <select style={S.select} value={form.status} onChange={fc("status")}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
          <div style={S.fGroup}>
            <label style={S.label}>Description</label>
            <textarea style={S.textarea} value={form.description} onChange={fc("description")} placeholder="Optional..." />
          </div>
        </Modal>
      )}
    </div>
  );
}