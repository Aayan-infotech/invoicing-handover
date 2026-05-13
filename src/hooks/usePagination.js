import { useMemo } from "react";

export const DOTS = "...";

export const usePagination = ({
    siblingCount = 1,
    currentPage,
    totalPageCount,
}) => {
    const paginationRange = useMemo(() => {
        // Core logic for pagination
        const totalPageNumbers = siblingCount + 5;

        // State 1: If the number of pages is less than the page numbers we want to show
        if (totalPageNumbers >= totalPageCount) {
            return range(1, totalPageCount);
        }

        // Calculate left and right sibling index
        const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
        const rightSiblingIndex = Math.min(
            currentPage + siblingCount,
            totalPageCount
        );

        // We do not show dots just when there is just one page number to be inserted between the extremes of sibling and the page limits i.e 1 and totalPageCount. Hence we are using leftSiblingIndex > 2 and rightSiblingIndex < totalPageCount - 2
        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

        const firstPageIndex = 1;
        const lastPageIndex = totalPageCount;

        // State 2: No left dots to show, but rights dots to be shown
        if (!shouldShowLeftDots && shouldShowRightDots) {
            let leftItemCount = 3 + 2 * siblingCount;
            let leftRange = range(1, leftItemCount);

            return [...leftRange, DOTS, totalPageCount];
        }

        // State 3: No right dots to show, but left dots to be shown
        if (shouldShowLeftDots && !shouldShowRightDots) {
            let rightItemCount = 3 + 2 * siblingCount;
            let rightRange = range(
                totalPageCount - rightItemCount + 1,
                totalPageCount
            );
            return [firstPageIndex, DOTS, ...rightRange];
        }

        // State 4: Both left and right dots to be shown
        if (shouldShowLeftDots && shouldShowRightDots) {
            let middleRange = range(leftSiblingIndex, rightSiblingIndex);
            return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
        }

        // Fallback - should not reach here, but just in case
        return range(1, totalPageCount);
    }, [siblingCount, currentPage, totalPageCount]);

    return paginationRange;
};

function range(start, end) {
    const length = end - start + 1;
    return Array.from({ length }, (_, index) => index + start);
}