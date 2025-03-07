import LoginForm from '@/components/login-form'

export default async function Home() {
    return (
        <div className="flex flex-col items-center justify-center py-2 gap-2 z-10">
            <h1 className="text-center text-3xl font-bold pb-1 pt-3">Plataforma para cargar imágenes</h1>
            <p className="text-center italic pb-3 max-w-2xl text-balance pb-10">
                ¿Tus productos no tienen foto? No te preocupes, con esta herramienta podrás seleccionar y cargar fotos a
                tu sitio web con un par de clics.
            </p>
            <LoginForm />
        </div>
    )
}
