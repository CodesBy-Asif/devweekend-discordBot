'use client'

import { useState, useEffect } from 'react'
import { useApiAuth } from '@/hooks/useApiAuth'
import BotConfigForm from '@/components/settings/BotConfigForm'
import DeploymentPanel from '@/components/settings/DeploymentPanel'

export default function SettingsPage() {
    const { authFetch } = useApiAuth()
    const [config, setConfig] = useState(null)
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState({ text: '', type: '' })
    const [activeTab, setActiveTab] = useState('bot')

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

    async function handleSaveConfig(formData) {
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/config`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setConfig(await res.json())
                showMessage('Configuration saved successfully!', 'success')
            } else {
                showMessage('Failed to save configuration', 'error')
            }
        } catch (error) {
            console.error('Save failed:', error)
            showMessage('Failed to save configuration', 'error')
        }
    }

    async function handleDeploy(channelId) {
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/config/bot/deploy-message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channelId })
            })

            if (res.ok) {
                showMessage('Verification message sent!', 'success')
                fetchConfig()
            } else {
                const data = await res.json()
                showMessage(data.error || 'Failed to send message', 'error')
            }
        } catch (error) {
            console.error('Deploy failed:', error)
            showMessage('Failed to send message', 'error')
        }
    }

    function showMessage(text, type) {
        setMessage({ text, type })
        setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    }

    if (loading) return <div className="text-center py-12 text-zinc-500">Loading...</div>

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-white">Settings</h1>

                {/* Tabs */}
                <div className="flex bg-zinc-900/50 p-1 rounded-lg border border-white/5 w-fit">
                    <button
                        onClick={() => setActiveTab('bot')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'bot'
                            ? 'bg-zinc-800 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                            }`}
                    >
                        Bot Config
                    </button>

                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg border ${message.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            {activeTab === 'bot' ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <BotConfigForm config={config} onSave={handleSaveConfig} />
                    <DeploymentPanel config={config} onDeploy={handleDeploy} />
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <SystemConfig config={config} onSave={handleSaveConfig} />
                </div>
            )}
        </div>
    )
}

