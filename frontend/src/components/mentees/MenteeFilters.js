export default function MenteeFilters({ search, status, onSearchChange, onStatusChange, onClear }) {
    return (
        <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
                <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    name="search"
                    placeholder="Search by name, email, or Discord ID..."
                    className="input-modern !pl-10 w-full"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <select
                name="filter"
                className="input-modern w-full md:w-48"
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
            >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
            </select>
            {(search || status) && (
                <button
                    onClick={onClear}
                    className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                >
                    Clear Filters
                </button>
            )}
        </div>
    );
}
