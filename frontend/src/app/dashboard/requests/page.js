'use client'

import { useState, useEffect } from 'react'
import { useApiAuth } from '@/hooks/useApiAuth'
import RequestTable from '@/components/requests/RequestTable'

export default function RequestsPage() {
    const { authFetch } = useApiAuth()
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('')

    useEffect(() => {
        fetchRequests()
    }, [statusFilter])

    async function fetchRequests() {
        try {
            setLoading(true)
            const query = statusFilter ? `?status=${statusFilter}` : ''
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests${query}`)
            if (res.ok) {
                setRequests(await res.json())
            }
        } catch (error) {
            console.error('Failed to fetch requests:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Verification Requests</h1>
                <select
                    name="statusFilter"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="input-modern w-48"
                >
                    <option value="">All Requests</option>
                    <option value="verified">Verified</option>
                    <option value="otp_sent">OTP Sent</option>
                    <option value="expired">Expired</option>
                    <option value="failed">Failed</option>
                </select>
            </div>

            <RequestTable
                requests={requests}
                loading={loading}
                showStatus={true}
            />
        </div>
    )
}
