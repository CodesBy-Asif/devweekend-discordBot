import StatsCard from '@/components/analytics/StatCard';

export default function MenteeStats({ stats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsCard title="Total Mentees" value={stats?.total || 0} color="text-blue-400" />
            <StatsCard title="Active" value={stats?.active || 0} color="text-green-400" />
            <StatsCard title="Verified" value={stats?.verified || 0} color="text-purple-400" />
            <StatsCard title="Pending" value={stats?.pending || 0} color="text-yellow-400" />
        </div>
    );
}
