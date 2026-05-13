import React from "react";

const PaginationWeb = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
  showPreviousNext = true,
  showFirstLast = true,
  className = "",
}) => {
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (showPreviousNext) {
      buttons.push(
        <button
          key="prev"
          className={`btn btn-outline-primary ${
            currentPage === 1 ? "disabled" : ""
          }`}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <i className="bi bi-chevron-left"></i>
        </button>
      );
    }

    // First page
    if (showFirstLast && startPage > 1) {
      buttons.push(
        <button
          key={1}
          className={`btn btn-outline-primary ${
            1 === currentPage ? "active" : ""
          }`}
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-2">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <button
          key={page}
          className={`btn ${
            page === currentPage ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </button>
      );
    }

    // Last page
    if (showFirstLast && endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="px-2">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          className={`btn btn-outline-primary ${
            totalPages === currentPage ? "active" : ""
          }`}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    if (showPreviousNext) {
      buttons.push(
        <button
          key="next"
          className={`btn btn-outline-primary ${
            currentPage === totalPages ? "disabled" : ""
          }`}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      );
    }

    return buttons;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`d-flex justify-content-center ${className}`}>
      <div className="d-flex gap-2 flex-wrap justify-content-center">
        {renderPaginationButtons()}
      </div>
    </div>
  );
};

export default PaginationWeb;
