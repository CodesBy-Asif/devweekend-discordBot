'use client'

import { useState, useEffect } from 'react'
import { useApiAuth } from '@/hooks/useApiAuth'
import StatsCard from '@/components/StatsCard'

export default function DashboardPage() {
    const { authFetch, session } = useApiAuth()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (session?.backendToken) {
            fetchStats()
        }
    }, [session?.backendToken])

    async function fetchStats() {
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats`)
            if (res.ok) {
                setStats(await res.json())
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Dashboard</h1>
                <p className="text-zinc-400 mt-1">Overview of your clan verification system</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    }
                    label="Total Requests"
                    value={stats?.totals?.requests || 0}
                />
                <StatsCard
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    label="Pending Approval"
                    value={stats?.totals?.pending || 0}
                />
                <StatsCard
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    label="Approved"
                    value={stats?.totals?.approved || 0}
                    trend={stats?.approvalRate ? `${stats.approvalRate}% rate` : null}
                    trendUp={true}
                />
                <StatsCard
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    }
                    label="Today's Requests"
                    value={stats?.today?.requests || 0}
                />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Requests */}
                <div className="glass-card rounded-xl p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-zinc-100">
                        <span className="text-indigo-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                        Recent Requests
                    </h2>
                    <div className="space-y-3">
                        {stats?.recentRequests?.length > 0 ? (
                            stats.recentRequests.map(req => (
                                <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors">
                                    <div>
                                        <p className="font-medium text-zinc-200">{req.discordUsername}</p>
                                        <p className="text-sm text-zinc-500">{req.clan}</p>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        req.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        }`}>
                                        {req.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-zinc-500 text-sm">No recent requests</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Clans */}
                <div className="glass-card rounded-xl p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-zinc-100">
                        <span className="text-violet-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </span>
                        Top Clans
                    </h2>
                    <div className="space-y-3">
                        {stats?.topClans?.length > 0 ? (
                            stats.topClans.map((clan, i) => (
                                <div key={clan.name} className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors">
                                    <span className={`text-lg font-bold w-6 text-center ${i === 0 ? 'text-amber-400' :
                                        i === 1 ? 'text-zinc-400' :
                                            i === 2 ? 'text-amber-700' :
                                                'text-zinc-600'
                                        }`}>#{i + 1}</span>
                                    <div className="flex-1">
                                        <p className="font-medium text-zinc-200">{clan.name}</p>
                                        <p className="text-sm text-zinc-500">{clan.count} members</p>
                                    </div>
                                    <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                                            style={{ width: `${Math.min(100, (clan.count / (stats.topClans[0]?.count || 1)) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-zinc-500 text-sm">No clan data yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
