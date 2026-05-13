import React from "react";
import { DOTS, usePagination } from "../hooks/usePagination";

const Pagination = ({
  onPageChange,
  currentPage,
  siblingCount = 1,
  totalPageCount,
}) => {
  const paginationRange = usePagination({
    currentPage,
    siblingCount,
    totalPageCount,
  });

  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  const lastPage = paginationRange[paginationRange.length - 1];

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-end my-2">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={onPrevious}
            disabled={currentPage === 1}
          >
            <span aria-hidden="true">&laquo;</span>
          </button>
        </li>

        {paginationRange.map((pageNumber, index) => {
          if (pageNumber === DOTS) {
            return (
              <li key={`dots-${index}`} className="page-item disabled">
                <span className="page-link">&hellip;</span>
              </li>
            );
          }

          return (
            <li
              key={pageNumber}
              className={`page-item ${
                pageNumber === currentPage ? "active" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            </li>
          );
        })}

        <li className={`page-item ${currentPage === lastPage ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={onNext}
            disabled={currentPage === lastPage}
          >
            <span aria-hidden="true">&raquo;</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
