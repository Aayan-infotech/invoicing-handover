import React, { Children } from "react";
import Pagination from "./Pagination";

function Table({
  PageTitle,
  pagination,
  setPagination,
  dataLength,
  searchTerm,
  handleSearch,
  clearSearch,
  handleAdd,
  filters,
  children,
}) {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0 fw-bold text-dark">{PageTitle}</h3>
        {handleAdd && (
          <button
            className="btn btn-primary"
            onClick={handleAdd}
            title="Add new record"
          >
            <i className="bi bi-plus-lg"></i> Add New
          </button>
        )}
      </div>

      <div className="row mb-4">
        <div className="d-flex gap-2">
          <div className="input-group" style={{ width: "300px" }}>
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search ..."
              value={searchTerm}
              onChange={handleSearch}
            />
            {searchTerm && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={clearSearch}
                title="Clear search"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
          {filters}
        </div>
      </div>

      <div className="table-responsive">{children}</div>

      <div className="row mb-4">
        <div className="col-md-6 align-items-center">
          <small className="text-muted">
            Showing{" "}
            {Number((pagination?.current_page || 0) - 1) *
              Number(pagination?.per_page || 0) +
              1}{" "}
            to{" "}
            {Number((pagination?.current_page || 0) - 1) *
              Number(pagination?.per_page || 0) +
              Number(dataLength || 0)}{" "}
            of {pagination?.total_records || 0} records
            {searchTerm && <span> (filtered)</span>}
          </small>
        </div>
        <div className="col-md-6">
          <Pagination
            onPageChange={(page) =>
              setPagination((prev) => ({ ...prev, current_page: page }))
            }
            currentPage={pagination.current_page}
            totalPageCount={pagination.total_page}
          />
        </div>
      </div>
    </>
  );
}

export default Table;
