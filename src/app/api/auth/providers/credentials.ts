import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { getUser } from '@/actions/user.action'

export default CredentialsProvider({
    name: 'Credentials',
    credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'tu@email.com' },
        password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
        // 1. Buscar el usuario en la base de datos
        const user = await getUser(credentials?.email)
        if (!user) {
            throw new Error('Usuario no encontrado')
        }

        // 2. Verificar la contraseña
        const isValidPassword = await compare(credentials!.password, user.password)
        if (!isValidPassword) {
            throw new Error('Contraseña incorrecta')
        }

        // 3. Retornar el usuario autenticado
        return { id: user.id, name: user.name, email: user.email }
    },
})
