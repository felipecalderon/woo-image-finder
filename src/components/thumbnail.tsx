import React, { useState, useEffect, useRef, memo } from 'react'
import { motion } from 'framer-motion'
import { Image } from '@/interfaces/image.interface'

export const ImageThumbnail = memo(({ image, onClick }: { image: Image; onClick: () => void }) => {
    const [shouldRender, setShouldRender] = useState(true)
    const imgRef = useRef<HTMLImageElement>(null)

    useEffect(() => {
        const imgElement = imgRef.current
        if (!imgElement) return

        const handleLoad = () => {
            // Verificar si la imagen es válida incluso después de cargar
            if (imgElement.naturalWidth === 0) {
                setShouldRender(false)
            }
        }

        const handleError = () => {
            setShouldRender(false)
        }

        // Agregar listeners de eventos
        imgElement.addEventListener('load', handleLoad)
        imgElement.addEventListener('error', handleError)

        // Verificar si la imagen ya está cargada (cacheada)
        if (imgElement.complete) {
            handleLoad()
        }

        return () => {
            // Limpiar listeners al desmontar o cambiar imagen
            imgElement.removeEventListener('load', handleLoad)
            imgElement.removeEventListener('error', handleError)
        }
    }, [image.imageUrl])

    if (!shouldRender) return null

    return (
        <motion.div
            transition={{ type: 'spring', stiffness: 100, damping: 30 }}
            whileHover={{
                scale: 2.5,
                zIndex: 10,
                border: '2px solid #bae6fd',
                backgroundColor: 'white',
            }}
            className={`relative w-[100px] h-[100px] overflow-hidden rounded-lg hover:cursor-pointer`}
            onClick={onClick}
        >
            <span className="text-xs scale-75 font-bold absolute -top-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-white/70 rounded-s-lg">
                {image.imageWidth}x{image.imageHeight}
            </span>
            <motion.img
                ref={imgRef}
                src={image.imageUrl}
                height="100"
                width="100"
                className={`transition duration-200 bg-white max-w-[100px] max-h-[100px] object-cover`}
                alt="thumbnail"
                loading="lazy" // Mejora adicional para carga diferida
            />
        </motion.div>
    )
})
