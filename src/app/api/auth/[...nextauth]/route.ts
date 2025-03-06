import NextAuth from 'next-auth'
import { Google } from '@/app/api/auth/providers/social'
import credentials from '../providers/credentials'

const handler = NextAuth({
    providers: [credentials],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
    },
})

export { handler as GET, handler as POST }
