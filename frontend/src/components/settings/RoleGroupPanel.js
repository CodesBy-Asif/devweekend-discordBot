'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useApiAuth } from '@/hooks/useApiAuth'
import { fetchRoles, selectRoles, selectDiscordLoading } from '@/store/slices/discordSlice'

export default function RoleGroupPanel({ config, onSave }) {
    const dispatch = useDispatch()
    const { authFetch } = useApiAuth()

    // Redux state
    const roles = useSelector(selectRoles)
    const loading = useSelector(selectDiscordLoading)

    const [mainRoleId, setMainRoleId] = useState('')
    const [saving, setSaving] = useState(false)
    const [syncing, setSyncing] = useState(false)
    const [syncResult, setSyncResult] = useState(null)

    // Fetch roles if not loaded
    useEffect(() => {
        if (roles.length === 0 && !loading.roles) {
            dispatch(fetchRoles(authFetch))
        }
    }, [dispatch, authFetch, roles.length, loading.roles])

    useEffect(() => {
        if (config?.mainRoleId) {
            setMainRoleId(config.mainRoleId)
        }
    }, [config])

    async function handleSave() {
        setSaving(true)
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/config`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mainRoleId })
            })

            if (res.ok) {
                onSave?.()
            }
        } catch (error) {
            console.error('Failed to save:', error)
        } finally {
            setSaving(false)
        }
    }

    async function handleSync() {
        setSyncing(true)
        setSyncResult(null)
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/config/sync-roles`, {
                method: 'POST'
            })

            if (res.ok) {
                const data = await res.json()
                setSyncResult(data)
            }
        } catch (error) {
            console.error('Sync failed:', error)
        } finally {
            setSyncing(false)
        }
    }

    return (
        <div className="glass-card rounded-xl p-6 space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="text-cyan-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </span>
                    Role Group
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                    Assign a "main" role to users who have any clan role
                </p>
            </div>

            <div className="bg-zinc-900/50 rounded-lg p-4 border border-white/5">
                <p className="text-sm text-zinc-300 mb-2">How it works:</p>
                <ul className="text-sm text-zinc-400 space-y-1 ml-4 list-disc">
                    <li>When a user gets a <span className="text-cyan-400">clan role</span> → automatically get the <span className="text-emerald-400">main role</span></li>
                    <li>When a user has <span className="text-red-400">no clan roles</span> → the main role is removed</li>
                    <li>Use "Sync Now" to update all existing members</li>
                </ul>
            </div>

            <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Main Role</label>
                <select
                    value={mainRoleId}
                    onChange={e => setMainRoleId(e.target.value)}
                    className="input-modern w-full"
                >
                    <option value="">No main role (disabled)</option>
                    {roles.map(role => (
                        <option key={role.id} value={role.id}>
                            {role.name}
                        </option>
                    ))}
                </select>
                <p className="text-xs text-zinc-500 mt-1">This role will be given to users who have any clan role</p>
            </div>

            {syncResult && (
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                    ✓ Sync complete: +{syncResult.added || 0} added, -{syncResult.removed || 0} removed
                </div>
            )}

            <div className="flex gap-3 pt-2">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                    onClick={handleSync}
                    disabled={syncing || !mainRoleId}
                    className="btn-secondary disabled:opacity-50 flex items-center gap-2"
                >
                    {syncing ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
                            Syncing...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Sync Now
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
