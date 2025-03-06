import { Image } from '@/interfaces/image.interface'
import { Product } from '@/interfaces/product.interface'
import { splitArray } from '@/lib/segment-items'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface TemporalList extends Product {
    image?: Image
    loading?: boolean
}

export const useImageSelection = (initialProducts: Product[]) => {
    const [temporalList, setTemporalList] = useState<TemporalList[]>(
        initialProducts.map((product) => ({ ...product, image: undefined, loading: false }))
    )
    const [loading, setLoading] = useState(false)
    const productsAdded = temporalList.filter((p) => p.image)
    const router = useRouter()

    const handleImageClick = async (index: number, selectedImage: Image) => {
        try {
            if (temporalList[index].loading) return // Si está cargando no hacer nada

            // Obtener el item actual
            const currentItem = temporalList[index]

            // Marcar la fila como cargando
            setTemporalList((prev) => prev.map((item, i) => (i === index ? { ...item, loading: true } : item)))

            const sku = currentItem.sku

            // Cargar imagen a cloudinary
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: JSON.stringify({ url: selectedImage.imageUrl, name: sku }),
            })
            let cloudinaryURL: { url: string } = await res.json()

            // Si falla cloudinary, retornar la imagen undefined
            if (!res.ok) {
                toast.error(`Error al subir la imagen de ${currentItem.name}...`, { duration: 5000 })
                return setTemporalList((prev) =>
                    prev.map((item, i) =>
                        i === index
                            ? {
                                  ...item,
                                  image: undefined,
                                  loading: false,
                              }
                            : item
                    )
                )
            }

            // Actualizamos el estado para hacer toggle (seleccionar/deseleccionar)
            setTemporalList((prev) =>
                prev.map((item, i) =>
                    i === index
                        ? {
                              ...item,
                              image: { ...selectedImage, imageUrl: cloudinaryURL.url },
                              loading: false,
                          }
                        : item
                )
            )
        } catch (error) {
            console.error('Error al procesar la imagen:', error)
        }
    }

    const handleSubmit = async () => {
        try {
            setLoading(true)
            const splittedList = splitArray(productsAdded)
            // se itera por grupos de 10 productos para no sobrecargar el servidor
            let i = 1
            for (const list of splittedList) {
                toast(`Actualizando tanda ${i} de ${splittedList.length}`, { duration: 5000 })
                await fetch('/api/wordpress', {
                    method: 'POST',
                    body: JSON.stringify(list),
                })
                i++
            }
            toast.success('Actualización completa, espere que refresque el sitio...', { duration: 5000 })
            i = 1
            router.refresh()
        } catch (error) {
            console.log('falló al actualizar...')
        } finally {
            setLoading(false)
        }
    }

    return { temporalList, handleImageClick, loading, setLoading, handleSubmit, productsAdded }
}
