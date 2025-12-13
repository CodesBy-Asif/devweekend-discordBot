export default function Pagination({ currentPage, totalPages, onPageChange }) {
    return (
        <div className="p-4 border-t border-white/5 flex justify-between items-center">
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-secondary text-sm disabled:opacity-50"
            >
                Previous
            </button>
            <span className="text-sm text-zinc-500">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn-secondary text-sm disabled:opacity-50"
            >
                Next
            </button>
        </div>
    );
}
