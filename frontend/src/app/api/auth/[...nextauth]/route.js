import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Admin Key',
            credentials: {
                adminKey: { label: "Admin Key", type: "password" }
            },
            async authorize(credentials) {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-key`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ adminKey: credentials.adminKey })
                    })

                    const data = await res.json()

                    if (res.ok && data.success) {
                        return {
                            id: data.user.id,
                            name: data.user.username,
                            email: 'admin@local', // Dummy email
                            backendToken: data.token
                        }
                    }
                    return null
                } catch (e) {
                    console.error('Auth check error:', e)
                    return null
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.backendToken = user.backendToken
            }
            return token
        },
        async session({ session, token }) {
            session.user.id = token.id
            session.backendToken = token.backendToken
            return session
        }
    },
    pages: {
        signIn: '/login'
    }
})

export { handler as GET, handler as POST }
