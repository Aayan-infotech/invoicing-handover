import React from 'react';
import { S } from '../../styles/theme';

export function Breadcrumb({ crumbs }) {
  return (
    <div style={S.breadcrumb}>
      {crumbs.map((c, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {i > 0 && <span style={S.breadcrumbSep}>›</span>}
          {c.onClick ? (
            <span style={S.breadcrumbLink} onClick={c.onClick}>{c.label}</span>
          ) : (
            <span style={S.breadcrumbCurrent}>{c.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}