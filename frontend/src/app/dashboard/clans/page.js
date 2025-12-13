'use client'

import { useState, useEffect } from 'react'
import { useApiAuth } from '@/hooks/useApiAuth'
import ClanList from '@/components/clans/ClanList'
import ClanModal from '@/components/clans/ClanModal'
import MergeClanModal from '@/components/clans/MergeClanModal'
import ConfirmModal from '@/components/shared/ConfirmModal'

export default function ClansPage() {
    const { authFetch } = useApiAuth()
    const [clans, setClans] = useState([])
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingClan, setEditingClan] = useState(null)

    // Delete Confirmation
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [clanToDelete, setClanToDelete] = useState(null)

    // Merge State
    const [mergeModalOpen, setMergeModalOpen] = useState(false)
    const [clanToMerge, setClanToMerge] = useState(null)

    useEffect(() => {
        fetchClans()
        fetchRoles()
    }, [])

    async function fetchClans() {
        try {
            setLoading(true)
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clans`)
            if (res.ok) setClans(await res.json())
        } catch (error) {
            console.error('Failed to fetch clans:', error)
        } finally {
            setLoading(false)
        }
    }

    async function fetchRoles() {
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discord/roles`)
            if (res.ok) setRoles(await res.json())
        } catch (error) {
            console.error('Failed to fetch roles:', error)
        }
    }

    async function createRole() {
        const name = prompt("Enter name for new Discord Role:")
        if (!name) return

        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discord/roles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            })

            if (res.ok) {
                const newRole = await res.json()
                setRoles([...roles, newRole])
                alert(`Role "${newRole.name}" created!`)
            }
        } catch (error) {
            console.error('Failed to create role:', error)
            alert('Failed to create role')
        }
    }

    function openModal(clan = null) {
        setEditingClan(clan)
        setIsModalOpen(true)
    }

    async function handleSave(formData) {
        try {
            const url = editingClan
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/clans/${editingClan._id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/clans`

            const method = editingClan ? 'PUT' : 'POST'

            const res = await authFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setIsModalOpen(false)
                fetchClans()
            }
        } catch (error) {
            console.error('Save failed:', error)
        }
    }

    function confirmDelete(id, name) {
        setClanToDelete({ id, name })
        setDeleteModalOpen(true)
    }

    async function executeDelete() {
        if (!clanToDelete) return

        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clans/${clanToDelete.id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                fetchClans()
            }
        } catch (error) {
            console.error('Delete failed:', error)
        } finally {
            setDeleteModalOpen(false)
            setClanToDelete(null)
        }
    }
    function openMergeModal(clan) {
        setClanToMerge(clan)
        setMergeModalOpen(true)
    }

    function handleMergeSuccess() {
        fetchClans()
        setMergeModalOpen(false)
        setClanToMerge(null)
    }

    const filteredClans = clans.filter(clan =>
        clan.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Clans</h1>
                    <p className="text-zinc-400 text-sm">Manage your clans and their associated roles</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Search clans..."
                            className="input-modern w-full !pl-10"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <svg className="w-4 h-4 text-zinc-500 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="btn-primary flex items-center gap-2 whitespace-nowrap"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Clan
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <ClanList
                    clans={filteredClans}
                    onEdit={openModal}
                    onDelete={confirmDelete}
                    onMerge={openMergeModal}
                />
            )}

            <ClanModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                clan={editingClan}
                roles={roles}
                onCreateRole={createRole}
            />

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={executeDelete}
                title="Delete Clan"
                message={`Are you sure you want to delete "${clanToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                isDanger={true}
            />

            {mergeModalOpen && (
                <MergeClanModal
                    sourceClan={clanToMerge}
                    allClans={clans}
                    onClose={() => setMergeModalOpen(false)}
                    onSuccess={handleMergeSuccess}
                />
            )}
        </div>
    )
}
