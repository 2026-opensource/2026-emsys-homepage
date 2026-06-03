function Pagination({ currentPage, totalPages, onPageChange }) {
    const PAGE_GROUP_SIZE = 5;
    
    const startPage = Math.floor((currentPage - 1) / PAGE_GROUP_SIZE) * PAGE_GROUP_SIZE + 1;
    const endPage = Math.min(startPage + PAGE_GROUP_SIZE - 1, totalPages);

    if (totalPages <= 1) return null;

    return (
        <div className="pagination">
            {startPage > 1 && (
                <button className="page-btn" onClick={() => onPageChange(startPage - 1)}>&lt;</button>
            )}
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                const pageNumber = startPage + i;
                return (
                    <button
                        key={pageNumber}
                        className={currentPage === pageNumber ? "page-btn active" : "page-btn"}
                        onClick={() => onPageChange(pageNumber)}
                    >
                        {pageNumber}
                    </button>
                );
            })}
            {endPage < totalPages && (
                <button className="page-btn" onClick={() => onPageChange(endPage + 1)}>&gt;</button>
            )}
        </div>
    );
}

export default Pagination;