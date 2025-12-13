'use client'

import { useState, useEffect } from 'react'
import { useApiAuth } from '@/hooks/useApiAuth'
import EmailTemplatePanel from '@/components/settings/EmailTemplatePanel'

export default function EmailSettingsPage() {
    const { authFetch } = useApiAuth()
    const [config, setConfig] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchConfig()
    }, [])

    async function fetchConfig() {
        try {
            setLoading(true)
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/config`)
            if (res.ok) setConfig(await res.json())
        } catch (error) {
            console.error('Failed to fetch config:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="text-center py-12 text-zinc-500">Loading...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Email Template</h1>
            <EmailTemplatePanel config={config} onSave={fetchConfig} />
        </div>
    )
}
