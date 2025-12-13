'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useApiAuth } from '@/hooks/useApiAuth'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGuildInfo, selectGuildInfo, selectDiscordLoading } from '@/store/slices/discordSlice'

const navItems = [
    {
        href: '/dashboard', label: 'Overview', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
        )
    },
    {
        href: '/dashboard/mentees', label: 'Mentees', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        )
    },
    {
        href: '/dashboard/clans', label: 'Clans', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        )
    },
    {
        href: '/dashboard/requests', label: 'Requests', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        )
    },
    {
        href: '/dashboard/voice', label: 'Clan Meet', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
        )
    },
]

const settingsItems = [
    {
        href: '/dashboard/settings/bot', label: 'Bot Config', icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        )
    },
    {
        href: '/dashboard/settings/roles', label: 'Role Groups', icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        )
    },
    {
        href: '/dashboard/settings/email', label: 'Email Template', icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        )
    },
]

export default function Sidebar({ isOpen, onClose }) {
    const { session, authFetch } = useApiAuth()
    const pathname = usePathname()
    const dispatch = useDispatch()

    // Redux state
    const guildInfo = useSelector(selectGuildInfo)
    const loading = useSelector(selectDiscordLoading)

    useEffect(() => {
        if (!guildInfo && !loading.guild) {
            dispatch(fetchGuildInfo(authFetch))
        }
    }, [dispatch, authFetch, guildInfo, loading.guild])

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-64 h-screen glass flex flex-col border-r border-white/5 
                fixed left-0 top-0 z-50 
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0
            `}>
                {/* Logo - Fixed at top */}
                <div className="p-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden">
                            {guildInfo?.icon ? (
                                <Image
                                    src={guildInfo.icon}
                                    alt="Guild Icon"
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight text-zinc-100 truncate max-w-[120px]">
                                {guildInfo?.name || 'DW AI'}
                            </h1>
                            <p className="text-xs text-zinc-500 font-medium">Admin Panel</p>
                        </div>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 text-zinc-400 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation - Scrollable */}
                <nav className="flex-1 px-4 py-6 overflow-y-auto">
                    <ul className="space-y-1">
                        {navItems.map(item => {
                            const isActive = pathname === item.href
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={() => onClose && onClose()}
                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                            ? 'bg-indigo-500/10 text-indigo-400'
                                            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                                            }`}
                                    >
                                        <span className={`transition-colors duration-200 ${isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                                            {item.icon}
                                        </span>
                                        <span className="font-medium text-sm">{item.label}</span>
                                        {isActive && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                        )}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>

                    {/* Settings Section */}
                    <div className="mt-6 pt-6 border-t border-white/5">
                        <p className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Settings</p>
                        <ul className="space-y-1">
                            {settingsItems.map(item => {
                                const isActive = pathname === item.href
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={() => onClose && onClose()}
                                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 group ${isActive
                                                ? 'bg-indigo-500/10 text-indigo-400'
                                                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                                                }`}
                                        >
                                            <span className={`transition-colors duration-200 ${isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                                                {item.icon}
                                            </span>
                                            <span className="font-medium text-sm">{item.label}</span>
                                            {isActive && (
                                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                            )}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </nav>

                {/* User Profile - Fixed at bottom */}
                {session?.user && (
                    <div className="p-4 border-t border-white/5 shrink-0">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors group">
                            {session.user.image ? (
                                <Image
                                    src={session.user.image}
                                    alt={session.user.name}
                                    width={36}
                                    height={36}
                                    className="rounded-full ring-2 ring-zinc-800 group-hover:ring-zinc-700 transition-all"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                                    {session.user.name?.[0]}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-zinc-200">{session.user.name}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/login' })}
                                        className="text-xs text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Sign out</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </aside>
        </>
    )
}
