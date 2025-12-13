'use client'

import { useState, useEffect } from 'react'
import { useApiAuth } from '@/hooks/useApiAuth'
import { useRouter } from 'next/navigation'

export default function ServerSelector({ onSelect }) {
    const { session } = useApiAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [guilds, setGuilds] = useState([])
    const [inviteUrlBase, setInviteUrlBase] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (session?.accessToken) {
            fetchAndMatchGuilds()
        }
    }, [session])

    async function fetchAndMatchGuilds() {
        try {
            // Match with bot's guilds (using guilds from backend token)
            const matchRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discord/match-guilds`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.backendToken}`
                },
                body: JSON.stringify({}) // Backend will use token data
            })

            if (!matchRes.ok) {
                throw new Error('Failed to check server compatibility')
            }

            const data = await matchRes.json()
            setGuilds(data.guilds)
            setInviteUrlBase(data.inviteUrlBase)

        } catch (err) {
            console.error('Server detection error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    function selectServer(server) {
        if (!server.hasBot) return;

        sessionStorage.setItem('selectedGuildId', server.id)
        sessionStorage.setItem('selectedGuildName', server.name)
        if (onSelect) {
            onSelect(server)
        } else {
            router.push('/dashboard/settings')
        }
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                <p className="text-zinc-400 font-medium">Loading your servers...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="glass-card rounded-xl p-8 max-w-md text-center border border-red-500/20 bg-red-500/5">
                    <h2 className="text-xl font-bold mb-2 text-zinc-100">Something went wrong</h2>
                    <p className="text-zinc-400 mb-6">{error}</p>
                    <button onClick={() => window.location.reload()} className="btn-primary w-full">Try Again</button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center py-12">
            <div className="glass-card rounded-2xl p-8 max-w-2xl w-full border border-white/10 shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Select a Server</h2>
                    <p className="text-zinc-400 mt-2">Manage an existing server or invite the bot to a new one</p>
                </div>

                <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {guilds.length === 0 ? (
                        <div className="text-center p-8 text-zinc-500">
                            No servers found where you are an administrator.
                        </div>
                    ) : (
                        guilds.map(server => (
                            <div
                                key={server.id}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all border group ${server.hasBot
                                    ? 'bg-zinc-900/50 hover:bg-zinc-800 border-white/5 hover:border-indigo-500/30 cursor-pointer'
                                    : 'bg-zinc-900/20 border-white/5 opacity-75 hover:opacity-100'
                                    }`}
                                onClick={() => server.hasBot && selectServer(server)}
                            >
                                {server.icon ? (
                                    <img
                                        src={server.icon}
                                        alt={server.name}
                                        className={`w-12 h-12 rounded-xl ring-2 transition-all ${server.hasBot ? 'ring-zinc-800 group-hover:ring-indigo-500/30' : 'ring-zinc-800 grayscale'
                                            }`}
                                    />
                                ) : (
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ring-2 transition-all ${server.hasBot
                                        ? 'bg-indigo-500/10 text-indigo-400 ring-zinc-800 group-hover:ring-indigo-500/30'
                                        : 'bg-zinc-800 text-zinc-500 ring-zinc-800'
                                        }`}>
                                        {server.name.charAt(0)}
                                    </div>
                                )}

                                <div className="flex-1 text-left">
                                    <p className={`font-semibold transition-colors ${server.hasBot ? 'text-zinc-100 group-hover:text-indigo-400' : 'text-zinc-400'
                                        }`}>
                                        {server.name}
                                    </p>
                                    <p className="text-sm text-zinc-500">
                                        {server.hasBot ? `${server.memberCount} members` : 'Bot not added'}
                                    </p>
                                </div>

                                {server.hasBot ? (
                                    <button className="px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 text-sm font-medium hover:bg-indigo-500/20 transition-colors">
                                        Dashboard
                                    </button>
                                ) : (
                                    <a
                                        href={`${inviteUrlBase}&guild_id=${server.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 text-sm font-medium hover:bg-zinc-700 hover:text-white transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Invite
                                    </a>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}