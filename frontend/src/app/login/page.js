'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [key, setKey] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await signIn('credentials', {
            adminKey: key,
            redirect: false,
        });

        if (res?.error) {
            setError('Invalid Admin Key');
            setLoading(false);
        } else {
            router.push('/dashboard');
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#09090b] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#09090b] to-[#09090b]">
            <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center border border-white/10 shadow-2xl shadow-indigo-500/10">
                {/* Logo/Icon */}
                <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold mb-3 text-zinc-100 tracking-tight">
                    Admin Access
                </h1>
                <p className="text-zinc-400 mb-8 max-w-sm mx-auto">
                    Enter your secure Admin Key to access the dashboard
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="Admin Key"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-900/50 border border-zinc-700 focus:border-indigo-500 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20"
                    >
                        {loading ? 'Verifying...' : 'Login'}
                    </button>
                </form>

                <p className="mt-8 text-xs text-zinc-500">
                    Only authorized administrators can access this area
                </p>
            </div>
        </div>
    )
}
