import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { S, fmtGBP, fmtDate, fmtDateInput } from '../../../styles/theme';
import { SortIcon } from '../../../components/common/SortIcon';
import { SubToolbar } from '../../../components/project/SubToolbar';
import { Modal } from '../../../components/common/Modal';
import { PaginationBar } from '../../../components/common/Pagination';
import Loading from '../../../components/Loading/Loading';
import { fetchWithAuth } from '../../../utils/authFetch';
import { links } from '../../../contstants';
import { useDebounce } from '../../../hooks/useDebounce';

export function InvoicesTab({ project }) {
    const userState = useSelector((s) => s.user);
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, total_page: 1, per_page: 10, total_records: 0 });
    const [search, setSearch] = useState("");
    const debSearch = useDebounce(search, 600);
    const [sort, setSort] = useState({ key: "", direction: "" });
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ invoiceNumber: "", amount: "", dueDate: "", status: "pending", description: "" });
    const [viewData, setViewData] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const r = await fetchWithAuth(`${links.BASE_URL}projects/invoices/${project._id}`, {
                method: "GET",
                params: { page: pagination.current_page, limit: pagination.per_page, search: debSearch, projectId: project._id, sortBy: sort.key, sortDirection: sort.direction }
            });
            setInvoices(r?.data?.data?.invoices || []);
            setPagination((p) => ({ ...p, ...r?.data?.data }));
        } catch { toast.error("Failed to load invoices"); }
        setLoading(false);
    };

    useEffect(() => { load(); }, [pagination.current_page, debSearch, sort]);

    const handleSort = (key) => setSort((p) => ({ key, direction: p.key === key && p.direction === "asc" ? "desc" : "asc" }));
    const fc = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
    const openAdd = () => { setForm({ invoiceNumber: "", amount: "", dueDate: "", status: "pending", description: "" }); setModal("add"); };
    const openEdit = (inv) => { setForm({ id: inv._id, invoiceNumber: inv.invoiceNumber, amount: inv.amount, dueDate: fmtDateInput(inv.dueDate), status: inv.status, description: inv.description }); setModal("edit"); };
    const openView = (inv) => { setViewData(inv); setModal("view"); };

    const handleDelete = async (id) => {
        const res = await Swal.fire({ title: "Delete invoice?", text: "This cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonText: "Delete", confirmButtonColor: "#c5221f" });
        if (res.isConfirmed) {
            try {
                await axios.delete(`${links.BASE_URL}projects/invoices/${id}`, { headers: { Authorization: `Bearer ${userState.userInfo.accessToken}` } });
                toast.success("Invoice deleted");
                load();
            } catch { toast.error("Failed to delete invoice"); }
        }
    };

    const save = async () => {
        if (!form.invoiceNumber || !form.amount) { toast.error("Invoice number and amount are required"); return; }
        setSaving(true);
        try {
            const body = { projectId: project._id, invoiceNumber: form.invoiceNumber, amount: form.amount, dueDate: form.dueDate, status: form.status, description: form.description };
            if (modal === "add") {
                await axios.post(`${links.BASE_URL}projects/invoices`, body, { headers: { Authorization: `Bearer ${userState.userInfo.accessToken}` } });
                toast.success("Invoice created");
            } else {
                await axios.put(`${links.BASE_URL}projects/invoices/${form.id}`, body, { headers: { Authorization: `Bearer ${userState.userInfo.accessToken}` } });
                toast.success("Invoice updated");
            }
            setModal(null);
            load();
        } catch (e) { toast.error(e?.response?.data?.message || "Failed"); }
        setSaving(false);
    };

    if (loading) return <div style={{ padding: "30px", textAlign: "center" }}><Loading /></div>;

    return (
        <>
            <SubToolbar title="Project Invoices" search={search} onSearch={(e) => setSearch(e.target.value)}  />
            <div style={{ overflowX: "auto" }}>
                <table style={{ ...S.table, borderRadius: 0, boxShadow: "none" }}>
                    <thead>
                        <tr>
                            {[["invoiceNumber", "Invoice #"], ["amount", "Amount (£)"], ["dueDate", "Due Date"], ["status", "Status"]].map(([k, l]) => (
                                <th key={k} style={S.th} onClick={() => handleSort(k)}>{l} <SortIcon sortConfig={sort} k={k} /></th>
                            ))}
                            <th style={S.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length > 0 ? invoices.map((inv, i) => (
                            <tr key={inv._id}>
                                <td style={i % 2 === 0 ? S.td : S.tdAlt}>{inv.invoiceNumber || "N/A"}</td>
                                <td style={i % 2 === 0 ? S.td : S.tdAlt}>{inv.amount ? fmtGBP(inv.amount) : "—"}</td>
                                <td style={i % 2 === 0 ? S.td : S.tdAlt}>{fmtDate(inv.dueDate)}</td>
                                <td style={i % 2 === 0 ? S.td : S.tdAlt}><span style={S.badge(inv.status || "pending")}>{inv.status || "Pending"}</span></td>
                                <td style={i % 2 === 0 ? S.td : S.tdAlt}>
                                    <i className="bi bi-eye" style={S.actionIcon("#1a73e8")} onClick={() => openView(inv)} title="View" />
                                    <i className="bi bi-pencil" style={S.actionIcon("#f9ab00")} onClick={() => openEdit(inv)} title="Edit" />
                                    <i className="bi bi-trash" style={S.actionIcon("#c5221f")} onClick={() => handleDelete(inv._id)} title="Delete" />
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} style={{ ...S.td, textAlign: "center", color: "#80868b", padding: "30px" }}>No invoices found for this project</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <PaginationBar pagination={pagination} setPagination={setPagination} count={invoices.length} />

            {(modal === "add" || modal === "edit") && (
                <Modal
                    title={modal === "add" ? "Add Invoice" : "Edit Invoice"}
                    onClose={() => setModal(null)}
                    footer={
                        <>
                            <button style={S.cancelBtn} onClick={() => setModal(null)}>Cancel</button>
                            <button style={S.primaryBtn(saving)} disabled={saving} onClick={save}>
                                {saving ? "Saving..." : modal === "add" ? "Create Invoice" : "Update Invoice"}
                            </button>
                        </>
                    }
                >
                    <div style={S.grid2}>
                        <div style={S.fGroup}>
                            <label style={S.label}>Invoice Number *</label>
                            <input style={S.input} value={form.invoiceNumber} onChange={fc("invoiceNumber")} placeholder="INV-001" />
                        </div>
                        <div style={S.fGroup}>
                            <label style={S.label}>Amount (£) *</label>
                            <input style={S.input} type="number" value={form.amount} onChange={fc("amount")} placeholder="0.00" />
                        </div>
                    </div>
                    <div style={S.grid2}>
                        <div style={S.fGroup}>
                            <label style={S.label}>Due Date</label>
                            <input style={S.input} type="date" value={form.dueDate} onChange={fc("dueDate")} />
                        </div>
                        <div style={S.fGroup}>
                            <label style={S.label}>Status</label>
                            <select style={S.select} value={form.status} onChange={fc("status")}>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="overdue">Overdue</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    <div style={S.fGroup}>
                        <label style={S.label}>Description</label>
                        <textarea style={S.textarea} value={form.description} onChange={fc("description")} placeholder="Optional notes..." />
                    </div>
                </Modal>
            )}

            {modal === "view" && viewData && (
                <Modal title="Invoice Details" onClose={() => setModal(null)} footer={<button style={S.cancelBtn} onClick={() => setModal(null)}>Close</button>}>
                    <div style={S.viewGrid}>
                        <div style={S.viewField}><span style={S.viewLabel}>Invoice #</span><span style={S.viewValue}>{viewData.invoiceNumber || "N/A"}</span></div>
                        <div style={S.viewField}><span style={S.viewLabel}>Amount</span><span style={S.viewValue}>{viewData.amount ? fmtGBP(viewData.amount) : "N/A"}</span></div>
                        <div style={S.viewField}><span style={S.viewLabel}>Due Date</span><span style={S.viewValue}>{fmtDate(viewData.dueDate)}</span></div>
                        <div style={S.viewField}><span style={S.viewLabel}>Status</span><span style={S.badge(viewData.status || "pending")}>{viewData.status || "Pending"}</span></div>
                        <div style={S.viewField}><span style={S.viewLabel}>Project</span><span style={S.viewValue}>{project.projectName}</span></div>
                    </div>
                    {viewData.description && <div style={{ ...S.viewField, marginTop: "8px" }}><span style={S.viewLabel}>Description</span><span style={S.viewValue}>{viewData.description}</span></div>}
                </Modal>
            )}
        </>
    );
}