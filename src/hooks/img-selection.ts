import { Image } from '@/interfaces/image.interface'
import { Product } from '@/interfaces/product.interface'
import { splitArray } from '@/lib/segment-items'
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

interface TemporalList extends Product {
    selectedImage?: Image
    loading?: boolean
}

type ImageSelectionResult = {
    temporalList: TemporalList[]
    handleImageClick: (index: number, selectedImage: Image) => Promise<void>
    loading: boolean
    setLoading: Dispatch<SetStateAction<boolean>>
    handleSubmit: () => Promise<void>
    productsAdded: TemporalList[]
}

export const useImageSelection = (initialProducts: Product[]): ImageSelectionResult => {
    const [temporalList, setTemporalList] = useState<TemporalList[]>(
        initialProducts.map((product) => ({ ...product, selectedImage: undefined, loading: false }))
    )
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // Memoizamos el filtro para evitar cálculos innecesarios
    const productsAdded = useMemo(() => temporalList.filter((p) => p.selectedImage), [temporalList])

    // Helper para actualizar un elemento específico en temporalList
    const updateTemporalListItem = useCallback((index: number, update: Partial<TemporalList>) => {
        setTemporalList((prev) => {
            const updated = [...prev]
            updated[index] = { ...updated[index], ...update }
            return updated
        })
    }, [])

    const handleImageClick = useCallback(
        async (index: number, selectedImage: Image) => {
            const currentItem = temporalList[index]
            if (currentItem.loading) return // Evitar doble click

            updateTemporalListItem(index, { loading: true })

            try {
                const fileName = currentItem.code || String(currentItem.id)
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: JSON.stringify({ url: selectedImage.imageUrl, name: fileName }),
                })
                const data = await res.json()

                if (!res.ok) {
                    toast.error(`Error al subir la imagen de ${currentItem.name}...`, { duration: 5000 })
                    updateTemporalListItem(index, { selectedImage: undefined, loading: false })
                    return
                }

                updateTemporalListItem(index, {
                    selectedImage: { ...selectedImage, imageUrl: data.url },
                    loading: false,
                })
            } catch (error) {
                console.error('Error al procesar la imagen:', error)
                toast.error(`Error al subir la imagen de ${currentItem.name}...`, { duration: 5000 })
                updateTemporalListItem(index, { selectedImage: undefined, loading: false })
            }
        },
        [temporalList, updateTemporalListItem]
    )

    const handleSubmit = useCallback(async () => {
        setLoading(true)
        try {
            const splittedList = splitArray(productsAdded)
            for (let i = 0; i < splittedList.length; i++) {
                toast(`Actualizando tanda ${i + 1} de ${splittedList.length}`, { duration: 5000 })
                await fetch('/api/products', {
                    method: 'POST',
                    body: JSON.stringify(splittedList[i]),
                })
            }
            toast.success('Actualización completa, espere que refresque el sitio...', { duration: 5000 })
            router.refresh()
        } catch (error) {
            console.error('Fallo al actualizar:', error)
            toast.error('Error al actualizar productos. Intente nuevamente.', { duration: 5000 })
        } finally {
            setLoading(false)
        }
    }, [productsAdded, router])

    return { temporalList, handleImageClick, loading, setLoading, handleSubmit, productsAdded }
}
