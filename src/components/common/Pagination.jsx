import React from 'react';
import { S } from '../../styles/theme';

export function PaginationBar({ pagination, setPagination, count }) {
  if (pagination.total_page <= 1) return null;
  
  return (
    <div style={S.pagination}>
      <span>Showing {count} of {pagination.total_records} records</span>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button 
          style={S.pageBtn(pagination.current_page === 1)} 
          disabled={pagination.current_page === 1}
          onClick={() => setPagination((p) => ({ ...p, current_page: p.current_page - 1 }))}
        >
          ← Prev
        </button>
        <span>Page {pagination.current_page} of {pagination.total_page}</span>
        <button 
          style={S.pageBtn(pagination.current_page >= pagination.total_page)} 
          disabled={pagination.current_page >= pagination.total_page}
          onClick={() => setPagination((p) => ({ ...p, current_page: p.current_page + 1 }))}
        >
          Next →
        </button>
      </div>
    </div>
  );
}