'use client'

import { createContext, useContext } from 'react'
import { useSession } from 'next-auth/react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const { data: session, status } = useSession()

    // Helper function for authenticated API calls
    const authFetch = async (url, options = {}) => {
        const token = session?.backendToken

        const headers = {
            ...options.headers,
        }

        // Add auth header if we have a token
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        // Don't set Content-Type for FormData
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = headers['Content-Type'] || 'application/json'
        }

        return fetch(url, {
            ...options,
            headers,
            credentials: 'include', // Still include for backward compat
        })
    }

    return (
        <AuthContext.Provider value={{ session, status, authFetch }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
