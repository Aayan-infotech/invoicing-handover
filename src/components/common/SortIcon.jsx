import React from 'react';

export function SortIcon({ sortConfig, k }) {
    return (
        <span style={{ opacity: 0.7 }}>
            {sortConfig.key === k ? (sortConfig.direction === "asc" ? " ▲" : " ▼") : " ⇅"}
        </span>
    );
}