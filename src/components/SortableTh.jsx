import React from "react";

const SortableTh = ({ columnKey, label, sortConfig, onSort }) => {
  const handleSort = () => {
    if (!onSort) return;
    onSort(columnKey);
  };

  const getSortIcon = () => {
    if (sortConfig.key !== columnKey) {
      return (
        <div className="d-flex flex-column align-items-center" style={{ fontSize: "10px" }}>
          <i
            className="bi bi-caret-up-fill text-secondary"
            style={{ marginBottom: "-8px" }}
          ></i>
          <i className="bi bi-caret-down-fill text-secondary"></i>
        </div>
      );
    }

    return (
      <div className="d-flex flex-column align-items-center" style={{ fontSize: "10px" }}>
        <i
          className={`bi bi-caret-up-fill ${
            sortConfig.direction === "asc" ? "text-white" : "text-secondary"
          }`}
          style={{ marginBottom: "-8px" }}
        ></i>
        <i
          className={`bi bi-caret-down-fill ${
            sortConfig.direction === "desc" ? "text-white" : "text-secondary"
          }`}
        ></i>
      </div>
    );
  };

  return (
    <th style={{ cursor: "pointer" }} onClick={handleSort}>
      <div className="d-flex align-items-center justify-content-between">
        {label}
        {getSortIcon()}
      </div>
    </th>
  );
};

export default SortableTh;
