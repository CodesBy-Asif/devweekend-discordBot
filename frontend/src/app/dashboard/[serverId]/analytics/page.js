'use client';

import { useState, useEffect } from 'react';
import { useApiAuth } from '@/hooks/useApiAuth';
import StatCard from '@/components/analytics/StatCard';
import ClanDistributionChart from '@/components/analytics/ClanDistributionChart';
import VerificationTrendsChart from '@/components/analytics/VerificationTrendsChart';
import RecentActivity from '@/components/analytics/RecentActivity';

export default function AnalyticsPage() {
    const { authFetch } = useApiAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logs/analytics`);
                if (res.ok) {
                    const jsonData = await res.json();
                    setData(jsonData);
                } else {
                    console.error('Failed to fetch analytics:', res.statusText);
                }
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="text-center p-8 text-zinc-500">Loading analytics...</div>;
    if (!data) return <div className="text-center p-8 text-zinc-500">Failed to load data</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Mentees" value={data.mentees.total} color="text-blue-400" />
                <StatCard title="Active Mentees" value={data.mentees.active} color="text-green-400" />
                <StatCard title="Verified" value={data.mentees.verified} color="text-purple-400" />
                <StatCard title="Success Rate" value={`${data.mentees.successRate}%`} color="text-yellow-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ClanDistributionChart data={data.clanDistribution} />
                <VerificationTrendsChart daily={data.trends.daily} weekly={data.trends.weekly} />
            </div>

            <RecentActivity logs={data.recentActivity} />
        </div>
    );
}
