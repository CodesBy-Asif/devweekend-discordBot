'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function VerificationTrendsChart({ daily, weekly }) {
    const data = [
        { name: 'Last 24h', value: daily },
        { name: 'Last 7 Days', value: weekly }
    ];

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Verification Trends</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                            cursor={{ fill: '#374151' }}
                            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem', color: '#fff' }}
                        />
                        <Bar dataKey="value" fill="#82ca9d" name="Verifications" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
