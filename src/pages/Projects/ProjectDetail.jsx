import React, { useState, useCallback } from 'react';
import { S, fmtGBP, fmtDate } from '../../styles/theme';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Donut } from '../../components/common/Donut';
import { TabBar, TabContent } from '../../components/project/Tabs';
import { ProjectTasksTab } from './tabs/ProjectTasksTab';
import { AssignTasksTab } from './tabs/AssignTasksTab';
import { QADocumentsTab } from './tabs/QADocumentsTab';
import { InvoicesTab } from './tabs/InvoicesTab';
import { fetchWithAuth } from '../../utils/authFetch';
import { links } from '../../contstants';
import { toast } from 'react-toastify';

export function ProjectDetail({ project: initialProject, onBack }) {
  const [project, setProject] = useState(initialProject);
  const [tab, setTab] = useState("tasks");
  const [loading, setLoading] = useState(false);

  const tabs = [
    { key: "tasks", label: "📋 Project Tasks" },
    { key: "assign", label: "👤 Assign Tasks" },
    { key: "qa", label: "📄 QA Documents" },
    { key: "invoices", label: "🧾 Invoices" },
  ];

  // Function to refresh project data
  const refreshProject = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${links.BASE_URL}projects/details/${project._id}`, {
        method: "GET"
      });
      if (response?.data?.data) {
        setProject(response.data.data);
      }
    } catch (error) {
      console.error('Failed to refresh project:', error);
      toast.error("Failed to refresh project data");
    }
    setLoading(false);
  }, [project._id]);

  return (
    <div style={S.page}>
      <Breadcrumb crumbs={[
        { label: "Projects", onClick: onBack }, 
        { label: project.projectName }
      ]} />

      {/* Project summary card */}
      <div style={{ padding: "12px 24px 0" }}>
        <div style={S.card}>
          <div style={S.cardHeader}>
            <span style={S.cardStar}>★</span>
            <span style={{ ...S.cardTitle, cursor: "default" }}>{project.projectName}</span>
            <span style={S.badge(project.status)}>{project.status || "active"}</span>
          </div>
          <div style={S.cardStats}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
              <Donut pct={project.completedPercentage ?? 0} />
              <span style={S.statLabel}>Complete</span>
            </div>
            <div style={S.statCell}>
              <span style={S.statValue}>{fmtGBP(project.totalAmount)}</span>
              <span style={S.statLabel}>Contract Value</span>
            </div>
            <div style={S.statCell}>
              <span style={S.statValue}>{project.totalTasks ?? 0}</span>
              <span style={S.statLabel}>Total Qty</span>
            </div>
            <div style={S.statCell}>
              <span style={S.statValue}>{project.completedTasks ?? 0}</span>
              <span style={S.statLabel}>Done Qty</span>
            </div>
            <div style={S.statCell}>
              <span style={S.statValue}>{fmtDate(project.startDate)}</span>
              <span style={S.statLabel}>Start Date</span>
            </div>
            <div style={S.statCell}>
              <span style={S.statValue}>{fmtDate(project.endDate)}</span>
              <span style={S.statLabel}>End Date</span>
            </div>
            <div />
          </div>
        </div>
      </div>

      <TabBar tabs={tabs} active={tab} onChange={setTab} />

      <TabContent>
        {tab === "tasks" && (
          <ProjectTasksTab 
            project={project} 
            onProjectUpdate={refreshProject}
          />
        )}
        {tab === "assign" && <AssignTasksTab project={project} />}
        {tab === "qa" && <QADocumentsTab project={project} />}
        {tab === "invoices" && <InvoicesTab project={project} />}
      </TabContent>
    </div>
  );
}