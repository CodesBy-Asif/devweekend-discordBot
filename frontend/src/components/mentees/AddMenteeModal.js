'use client'

import { useState } from 'react'

export default function AddMenteeModal({ isOpen, onClose, onSave, clans }) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [assignedClan, setAssignedClan] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    if (!isOpen) return null

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        if (!name.trim() || !email.trim()) {
            setError('Name and email are required')
            return
        }

        setSaving(true)
        try {
            await onSave({ name, email, assignedClan })
            setName('')
            setEmail('')
            setAssignedClan('')
            onClose()
        } catch (err) {
            setError(err.message || 'Failed to add mentee')
        } finally {
            setSaving(false)
        }
    }

    function handleClose() {
        setName('')
        setEmail('')
        setAssignedClan('')
        setError('')
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative glass-card rounded-xl p-6 w-full max-w-md border border-white/10 shadow-xl">
                <h2 className="text-xl font-semibold text-white mb-6">Add Mentee</h2>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="John Doe"
                            className="input-modern w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Email *</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="input-modern w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Assigned Clan</label>
                        <select
                            value={assignedClan}
                            onChange={e => setAssignedClan(e.target.value)}
                            className="input-modern w-full"
                        >
                            <option value="">No clan assigned</option>
                            {clans.map(clan => (
                                <option key={clan._id} value={clan.name}>{clan.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 btn-primary disabled:opacity-50"
                        >
                            {saving ? 'Adding...' : 'Add Mentee'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
