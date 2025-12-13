export default function ClanList({ clans, onEdit, onDelete, onMerge }) {
    if (clans.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="bg-zinc-900/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-1">No Clans Found</h3>
                <p className="text-zinc-500">Create your first clan to get started.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clans.map(clan => (
                <div key={clan._id} className="glass-card p-0 group hover:border-indigo-500/30 transition-all overflow-hidden flex flex-col">
                    <div className="p-6 flex-1">
                        <div className="flex justify-between items-start ">
                            <div className="flex-1">
                                <div className="flex justify-between items-center gap-2">

                                    <h3 className="text-xl font-bold text-white truncate pr-2">{clan.name}</h3>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${clan.enabled ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}>
                                        {clan.enabled ? 'Active' : 'Disabled'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 border border-white/5  " title={clan.roleId}>
                                        {clan.roleId || 'No Role ID'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-zinc-900/30 border-t border-white/5 flex justify-between items-center">
                        <span className="text-xs text-zinc-500 font-mono">
                            {new Date(clan.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => onEdit(clan)}
                                className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                title="Edit Clan"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => onMerge && onMerge(clan)}
                                className="p-2 rounded-lg hover:bg-indigo-500/10 text-zinc-400 hover:text-indigo-400 transition-colors"
                                title="Merge Clan"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </button>
                            <button
                                onClick={() => onDelete(clan._id, clan.name)}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors"
                                title="Delete Clan"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
