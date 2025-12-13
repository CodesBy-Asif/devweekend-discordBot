'use client'

export default function RequestTable({ requests, loading, showStatus }) {
    const statusStyles = {
        verified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        otp_sent: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        expired: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
        failed: 'bg-red-500/10 text-red-400 border-red-500/20',
        pending: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    }

    const statusLabels = {
        verified: 'Verified',
        otp_sent: 'OTP Sent',
        expired: 'Expired',
        failed: 'Failed',
        pending: 'Pending'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    if (!requests || requests.length === 0) {
        return (
            <div className="glass-card rounded-xl p-8 text-center">
                <p className="text-zinc-500">No requests found</p>
            </div>
        )
    }

    return (
        <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full">
                <thead className="bg-zinc-900/50 border-b border-white/5">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Discord</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Clan</th>
                        {showStatus && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {requests.map(req => (
                        <tr key={req._id} className="hover:bg-zinc-800/30 transition-colors">
                            <td className="px-6 py-4 text-sm text-zinc-200">{req.menteeId?.name || '-'}</td>
                            <td className="px-6 py-4 text-sm text-zinc-400">{req.menteeId?.email}</td>
                            <td className="px-6 py-4 text-sm text-zinc-200">{req.discordUsername || '-'}</td>
                            <td className="px-6 py-4 text-sm text-zinc-400">{req.clanId?.name || req.clanName || '-'}</td>
                            {showStatus && (
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[req.status] || statusStyles.pending}`}>
                                        {statusLabels[req.status] || req.status}
                                    </span>
                                </td>
                            )}
                            <td className="px-6 py-4 text-sm text-zinc-500">
                                {new Date(req.updatedAt || req.createdAt).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
