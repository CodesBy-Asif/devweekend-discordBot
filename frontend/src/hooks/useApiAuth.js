'use client'

import { useSession } from 'next-auth/react'
import { useCallback } from 'react'

export function useApiAuth() {
    const { data: session, status } = useSession()

    const authFetch = useCallback(async (url, options = {}) => {
        const token = session?.backendToken

        const headers = {
            ...options.headers,
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        // Don't override Content-Type for FormData
        if (!(options.body instanceof FormData) && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json'
        }

        return fetch(url, {
            ...options,
            headers,
        })
    }, [session?.backendToken])

    return { authFetch, session, status }
}
