'use client'

import { useState } from 'react'
import { redirect } from 'next/navigation'
import { useApiAuth } from '@/hooks/useApiAuth'
import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({ children }) {
    const { session, status } = useApiAuth()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    if (status === 'unauthenticated') {
        redirect('/login')
    }

    return (
        <div className="flex min-h-screen bg-[#09090b]">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-auto w-full">
                {/* Mobile Header */}
                <div className="md:hidden mb-6 flex items-center justify-between">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="font-bold text-lg text-zinc-100">Devweekend</h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                <div className="max-w-7xl mx-auto space-y-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
