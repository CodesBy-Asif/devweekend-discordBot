export default function RecentActivity({ logs }) {
    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
                {logs.map(log => (
                    <div key={log._id} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0">
                        <div>
                            <p className="text-sm text-white font-medium">
                                {log.adminName} <span className="text-zinc-500">performed</span> {log.action.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-zinc-500">{new Date(log.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-xs text-zinc-400 font-mono">
                            {JSON.stringify(log.details).substring(0, 50)}...
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
