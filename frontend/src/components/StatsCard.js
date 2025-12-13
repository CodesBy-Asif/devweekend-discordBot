export default function StatsCard({ icon, label, value, trend, trendUp }) {
    return (
        <div className="glass-card rounded-xl p-6 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-indigo-500/10 group">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-zinc-400 text-sm font-medium">{label}</p>
                    <p className="text-3xl font-bold mt-2 text-zinc-100 tracking-tight">{value}</p>
                    {trend && (
                        <p className={`text-sm mt-2 flex items-center gap-1 font-medium ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                            <span>{trendUp ? '↑' : '↓'}</span>
                            {trend}
                        </p>
                    )}
                </div>
                <div className="p-3 rounded-lg bg-zinc-800/50 text-zinc-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                    {icon}
                </div>
            </div>
        </div>
    )
}
