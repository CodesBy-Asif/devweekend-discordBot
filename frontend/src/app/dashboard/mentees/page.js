'use client'

import { useState, useEffect, useRef } from 'react'
import { useApiAuth } from '@/hooks/useApiAuth'
import MenteeStats from '@/components/mentees/MenteeStats'
import MenteeFilters from '@/components/mentees/MenteeFilters'
import MenteeTable from '@/components/mentees/MenteeTable'
import EditMenteeModal from '@/components/mentees/EditMenteeModal'
import AddMenteeModal from '@/components/mentees/AddMenteeModal'
import ConfirmModal from '@/components/shared/ConfirmModal'

export default function MenteesPage() {
    const { authFetch } = useApiAuth()
    const [mentees, setMentees] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [uploadStatus, setUploadStatus] = useState('')
    const fileInputRef = useRef(null)

    // Selection & Actions
    const [selectedMentees, setSelectedMentees] = useState([])
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [editingMentee, setEditingMentee] = useState(null)
    const [clans, setClans] = useState([])

    // Delete Confirmation
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [menteeToDelete, setMenteeToDelete] = useState(null)
    const [isBulkDelete, setIsBulkDelete] = useState(false)

    // Unlink Confirmation
    const [unlinkModalOpen, setUnlinkModalOpen] = useState(false)
    const [menteeToUnlink, setMenteeToUnlink] = useState(null)

    // Add Mentee Modal
    const [addModalOpen, setAddModalOpen] = useState(false)

    useEffect(() => {
        fetchMentees()
        fetchStats()
        fetchClans()
    }, [page, search, status])

    async function fetchMentees() {
        try {
            setLoading(true)
            const query = new URLSearchParams({
                page,
                limit: 10,
                search,
                status
            })
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mentees?${query}`)
            if (res.ok) {
                const data = await res.json()
                setMentees(data.mentees)
                setTotalPages(data.pagination.pages)
            }
        } catch (error) {
            console.error('Failed to fetch mentees:', error)
        } finally {
            setLoading(false)
        }
    }

    async function fetchStats() {
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mentees/stats`)
            if (res.ok) setStats(await res.json())
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        }
    }

    async function fetchClans() {
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clans`)
            if (res.ok) setClans(await res.json())
        } catch (error) {
            console.error('Failed to fetch clans:', error)
        }
    }

    async function handleFileUpload(e) {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        setUploadStatus('Uploading...')
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mentees/upload`, {
                method: 'POST',
                body: formData
            })

            const data = await res.json()

            if (res.ok) {
                setUploadStatus(`Success! Imported ${data.count} mentees.${data.skipped > 0 ? ` Skipped ${data.skipped} invalid rows.` : ''}`)
                fetchMentees()
                fetchStats()
                if (fileInputRef.current) fileInputRef.current.value = ''
            } else {
                setUploadStatus(`Error: ${data.message}`)
            }
        } catch (error) {
            setUploadStatus('Upload failed')
            console.error(error)
        }
    }

    function confirmDelete(id) {
        setMenteeToDelete(id)
        setIsBulkDelete(false)
        setDeleteModalOpen(true)
    }

    function confirmBulkDelete() {
        setIsBulkDelete(true)
        setDeleteModalOpen(true)
    }

    async function executeDelete() {
        try {
            if (isBulkDelete) {
                const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mentees/bulk-delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: selectedMentees })
                })
                if (res.ok) {
                    setSelectedMentees([])
                    fetchMentees()
                    fetchStats()
                }
            } else {
                const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mentees/${menteeToDelete}`, {
                    method: 'DELETE'
                })
                if (res.ok) {
                    fetchMentees()
                    fetchStats()
                }
            }
        } catch (error) {
            console.error('Delete failed:', error)
        } finally {
            setDeleteModalOpen(false)
            setMenteeToDelete(null)
        }
    }

    async function clearAllMentees() {
        if (!confirm('Are you sure you want to delete ALL mentees? This cannot be undone.')) return

        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mentees`, {
                method: 'DELETE'
            })
            if (res.ok) {
                fetchMentees()
                fetchStats()
            }
        } catch (error) {
            console.error('Clear failed:', error)
        }
    }

    function confirmUnlink(mentee) {
        setMenteeToUnlink(mentee)
        setUnlinkModalOpen(true)
    }

    async function executeUnlink() {
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mentees/${menteeToUnlink._id}/unlink`, {
                method: 'POST'
            })
            if (res.ok) {
                fetchMentees()
                fetchStats()
            }
        } catch (error) {
            console.error('Unlink failed:', error)
        } finally {
            setUnlinkModalOpen(false)
            setMenteeToUnlink(null)
        }
    }

    function toggleSelectAll() {
        if (selectedMentees.length === mentees.length) {
            setSelectedMentees([])
        } else {
            setSelectedMentees(mentees.map(m => m._id))
        }
    }

    function toggleSelect(id) {
        if (selectedMentees.includes(id)) {
            setSelectedMentees(selectedMentees.filter(mId => mId !== id))
        } else {
            setSelectedMentees([...selectedMentees, id])
        }
    }

    function openEditModal(mentee) {
        setEditingMentee(mentee)
        setEditModalOpen(true)
    }

    async function saveMenteeChanges(data) {
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mentees/${editingMentee._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (res.ok) {
                setEditModalOpen(false)
                setEditingMentee(null)
                fetchMentees()
            }
        } catch (error) {
            console.error('Update failed:', error)
        }
    }

    async function addMentee(data) {
        const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mentees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })

        const result = await res.json()
        if (!res.ok) {
            throw new Error(result.error || 'Failed to add mentee')
        }

        fetchMentees()
        fetchStats()
        return result
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Mentees</h1>
                <div className="flex gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".csv"
                        className="hidden"
                    />
                    <button
                        onClick={() => setAddModalOpen(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Mentee
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Import CSV
                    </button>
                    {selectedMentees.length > 0 && (
                        <button
                            onClick={confirmBulkDelete}
                            className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Selected ({selectedMentees.length})
                        </button>
                    )}
                </div>
            </div>

            {uploadStatus && (
                <div className={`p-4 rounded-lg border ${uploadStatus.includes('Error') || uploadStatus.includes('failed')
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                    {uploadStatus}
                </div>
            )}

            <MenteeStats stats={stats} />

            <MenteeFilters
                search={search}
                status={status}
                onSearchChange={setSearch}
                onStatusChange={setStatus}
                onClear={() => { setSearch(''); setStatus('') }}
            />

            <MenteeTable
                mentees={mentees}
                loading={loading}
                selectedMentees={selectedMentees}
                onToggleSelect={toggleSelect}
                onToggleSelectAll={toggleSelectAll}
                onEdit={openEditModal}
                onDelete={confirmDelete}
                onUnlink={confirmUnlink}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />

            <EditMenteeModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                onSave={saveMenteeChanges}
                clans={clans}
                mentee={editingMentee}
            />

            <AddMenteeModal
                isOpen={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSave={addMentee}
                clans={clans}
            />

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={executeDelete}
                title={isBulkDelete ? "Delete Mentees" : "Delete Mentee"}
                message={isBulkDelete
                    ? `Are you sure you want to delete ${selectedMentees.length} mentees? This action cannot be undone.`
                    : "Are you sure you want to delete this mentee? This action cannot be undone."
                }
                confirmText="Delete"
                isDanger={true}
            />

            <ConfirmModal
                isOpen={unlinkModalOpen}
                onClose={() => setUnlinkModalOpen(false)}
                onConfirm={executeUnlink}
                title="Unlink Discord Account"
                message={`Are you sure you want to unlink the Discord account from mentee "${menteeToUnlink?.name}"? They will need to verify again.`}
                confirmText="Unlink"
                isDanger={true}
            />
        </div>
    )
}
