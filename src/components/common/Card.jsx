import React, { useState, useEffect } from 'react';
import { S, fmtGBP, fmtDate } from '../../styles/theme';
import { Donut } from './Donut';

function CardMenu({ items, isOpen, onToggle }) {
  useEffect(() => {
    const close = () => onToggle(null);
    if (isOpen) document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [isOpen, onToggle]);

  return (
    <div style={{ position: "relative", zIndex: 10 }} onClick={(e) => e.stopPropagation()}>
      <button style={S.menuBtn} onClick={onToggle}>⋯</button>
      {isOpen && (
        <div style={S.dropdown}>
          {items.map((item) => (
            <button 
              key={item.label} 
              style={S.dropItem}
              onMouseEnter={(e) => (e.target.style.background = "#f8f9fa")}
              onMouseLeave={(e) => (e.target.style.background = "none")}
              onClick={() => { item.onClick(); onToggle(); }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectCard({ project, onOpen, onEdit, activeMenuId, setActiveMenuId }) {
  return (
    <div style={S.card}>
      <div style={S.cardHeader}>
        <span style={S.cardStar}>★</span>
        <span style={S.cardTitle} onClick={() => onOpen(project)}>{project.projectName}</span>
        <span style={S.badge(project.status)}>{project.status || "active"}</span>
        <CardMenu
          items={[
            { label: "Open project", onClick: () => onOpen(project) }, 
            { label: "Edit project", onClick: () => onEdit(project) }
          ]}
          isOpen={activeMenuId === project._id}
          onToggle={() => setActiveMenuId((prev) => (prev === project._id ? null : project._id))}
        />
      </div>
      <div style={S.cardStats} onClick={() => onOpen(project)}>
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
        <button style={S.arrowBtn} onClick={() => onOpen(project)}>›</button>
      </div>
    </div>
  );
}