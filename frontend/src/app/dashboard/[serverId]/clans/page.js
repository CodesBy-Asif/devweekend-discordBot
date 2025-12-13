'use client'

import { useState, useEffect } from 'react'
import { useApiAuth } from '@/hooks/useApiAuth'
import ClanList from '@/components/clans/ClanList'
import ClanModal from '@/components/clans/ClanModal'
import ConfirmModal from '@/components/shared/ConfirmModal'

export default function ClansPage() {
    const { authFetch } = useApiAuth()
    const [clans, setClans] = useState([])
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(true)

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingClan, setEditingClan] = useState(null)

    // Delete Confirmation
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [clanToDelete, setClanToDelete] = useState(null)

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Clans</h1>
                <button
                    onClick={() => openModal()}
                    className="btn-primary flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Clan
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-zinc-500">Loading clans...</div>
            ) : (
                <ClanList
                    clans={clans}
                    onEdit={openModal}
                    onDelete={confirmDelete}
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
        </div>
    )
}
