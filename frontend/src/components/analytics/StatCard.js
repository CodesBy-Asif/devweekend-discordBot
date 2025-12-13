export default function StatCard({ title, value, color }) {
    return (
        <div className="glass-card p-6">
            <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
            <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
        </div>
    );
}
