import LoginForm from '@/components/login-form'
import Link from 'next/link'

export default async function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 gap-2 z-10">
            <h1 className="text-center text-3xl font-bold pb-1 pt-3">Productos sin imagen</h1>
            <h3 className="text-center text-xl italic pb-3">De la ferretería Geoconstructor</h3>
            <LoginForm />
        </div>
    )
}
