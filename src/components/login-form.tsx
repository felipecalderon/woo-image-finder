'use client'

import { signIn, useSession } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react'
import Google from '@/components/ui/google-icon'

export default function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()
    const { data: session } = useSession()
    console.log(session)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        const res = await signIn('credentials', {
            redirect: false,
            email,
            password,
        })

        if (res?.error) {
            setError('Credenciales incorrectas')
        } else {
            router.push('/') // Redirigir tras login exitoso
        }
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Iniciar sesión</h2>
            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Correo electrónico"
                        required
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Contraseña"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="flex items-center justify-center w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                >
                    <LogIn className="mr-2" size={20} />
                    Iniciar sesión
                </button>
            </form>

            <div className="flex items-center my-6">
                <hr className="flex-grow border-t border-gray-300" />
                <span className="px-4 text-gray-500 text-sm">O</span>
                <hr className="flex-grow border-t border-gray-300" />
            </div>

            <div className="flex flex-col space-y-3">
                {/* <button
                        type="button"
                        onClick={() => router.push('/register')}
                        className="flex items-center justify-center w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition"
                    >
                        <UserPlus className="mr-2" size={20} />
                        Crear cuenta
                    </button> */}
                <button
                    type="button"
                    onClick={() => signIn('google', { callbackUrl: '/' })}
                    className="flex items-center justify-center w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                >
                    <Google className="mr-2 bg-white rounded-full scale-110 p-1" size={20} />
                    Iniciar sesión con Google
                </button>
            </div>
        </div>
    )
}
