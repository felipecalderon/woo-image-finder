import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import AuthProvider from '@/providers/auth'
import Background from '@/components/background'

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: 'Cargador imagenes automatizado',
    description:
        'Vincula productos sin imagenes de tu wordpress con imágenes de Google basado en el nombre del producto',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="es">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <AuthProvider>
                    <Background>{children}</Background>
                    <Toaster position="bottom-left" />
                </AuthProvider>
            </body>
        </html>
    )
}
