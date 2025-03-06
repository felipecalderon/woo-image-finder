import { Image } from '@/interfaces/image.interface'
import { Product } from '@/interfaces/product.interface'
import { useCallback, useState } from 'react'

interface TemporalList extends Product {
    image?: Image
    loading?: boolean
}

export const useImageSelection = (initialProducts: Product[]) => {
    const [temporalList, setTemporalList] = useState<TemporalList[]>(
        initialProducts.map((product) => ({ ...product, image: undefined, loading: false }))
    )

    const handleImageClick = async (index: number, selectedImage: Image) => {
        try {
            if (temporalList[index].loading) return // Si está cargando no hacer nada

            // Obtener el item actual y determinar si ya estaba seleccionado
            const currentItem = temporalList[index]
            const isAlreadySelected = currentItem.image?.imageUrl === selectedImage.imageUrl

            // Marcar la fila como cargando
            setTemporalList((prev) => prev.map((item, i) => (i === index ? { ...item, loading: true } : item)))

            // Si no estaba seleccionada, procesamos la imagen de forma asíncrona
            if (!isAlreadySelected) {
                const sku = currentItem.sku
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: JSON.stringify({ url: selectedImage.imageUrl, name: sku }),
                })
                const cloudinaryURL: { url: string } = await res.json()

                // Actualizamos el estado para hacer toggle (seleccionar/deseleccionar)
                setTemporalList((prev) =>
                    prev.map((item, i) =>
                        i === index
                            ? {
                                  ...item,
                                  image: isAlreadySelected
                                      ? undefined
                                      : { ...selectedImage, imageUrl: cloudinaryURL.url },
                                  loading: false,
                              }
                            : item
                    )
                )
            }
        } catch (error) {
            console.error('Error al procesar la imagen:', error)
        }
    }

    return { temporalList, handleImageClick }
}
