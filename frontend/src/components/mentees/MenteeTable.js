import Pagination from '@/components/shared/Pagination';

export default function MenteeTable({
    mentees,
    loading,
    selectedMentees,
    onToggleSelect,
    onToggleSelectAll,
    onEdit,
    onDelete,
    page,
    totalPages,
    onPageChange,
    onUnlink
}) {
    const allSelected = mentees.length > 0 && selectedMentees.length === mentees.length;

    return (
        <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/5 text-left text-sm font-medium text-zinc-400">
                            <th className="p-4 w-10">
                                <input
                                    type="checkbox"
                                    className="rounded border-zinc-700 bg-zinc-800 text-indigo-500 focus:ring-indigo-500/20"
                                    checked={allSelected}
                                    onChange={onToggleSelectAll}
                                />
                            </th>
                            <th className="p-4">Name / Email</th>
                            <th className="p-4">Discord</th>
                            <th className="p-4">Clan</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-zinc-500">Loading mentees...</td>
                            </tr>
                        ) : mentees.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-zinc-500">No mentees found</td>
                            </tr>
                        ) : (
                            mentees.map((mentee) => (
                                <tr key={mentee._id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            className="rounded border-zinc-700 bg-zinc-800 text-indigo-500 focus:ring-indigo-500/20"
                                            checked={selectedMentees.includes(mentee._id)}
                                            onChange={() => onToggleSelect(mentee._id)}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-white">{mentee.name}</div>
                                        <div className="text-xs text-zinc-500">{mentee.email}</div>
                                    </td>
                                    <td className="p-4">
                                        {mentee.discordId ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-indigo-400 text-sm font-mono bg-indigo-400/10 px-2 py-0.5 rounded">
                                                    {mentee.discordUsername || mentee.discordId}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-zinc-600 text-sm italic">Not connected</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-sm border border-white/5">
                                            {mentee.assignedClan || 'No Clan'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`badge ${mentee.discordId ? 'badge-success' : 'badge-warning'}`}>
                                            {mentee.discordId ? 'Verified' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onEdit(mentee)}
                                                className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                                title="Edit Clan"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => onDelete(mentee._id)}
                                                className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors"
                                                title="Delete"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                            {mentee.discordId && (
                                                <button
                                                    onClick={() => onUnlink(mentee)}
                                                    className="p-2 rounded-lg hover:bg-amber-500/10 text-zinc-400 hover:text-amber-400 transition-colors"
                                                    title="Unlink Discord Account"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
    );
}
