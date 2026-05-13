import React from "react";
import { S } from "../../styles/theme";

export function SubToolbar({
  title,
  search,
  onSearch,
  onAdd,
  addLabel = "+ Add",
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 16px",
        borderBottom: `1px solid #dadce0`,
      }}
    >
      <span
        style={{
          fontWeight: "600",
          color: "#3c4043",
          flex: 1,
          fontSize: "14px",
        }}
      >
        {title}
      </span>
      <input
        style={S.searchBox}
        placeholder="Search..."
        value={search}
        onChange={onSearch}
      />
      {onAdd && (
        <button style={S.addBtn} onClick={onAdd}>
          {addLabel}
        </button>
      )}
    </div>
  );
}
