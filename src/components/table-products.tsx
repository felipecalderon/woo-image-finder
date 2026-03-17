'use client'
import { ResponseAPI } from '@/interfaces/common.interface'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Product } from '@/interfaces/product.interface'
import React, { useMemo, useState, useEffect } from 'react'
import { ImageThumbnail } from '@/components/thumbnail'
import { useImageSelection } from '@/hooks/img-selection'
import { Image } from '@/interfaces/image.interface'
import {
    Bot,
    ChevronLeft,
    ChevronRight,
    LoaderCircle,
    Search,
    UploadCloud,
    CheckCircle2,
    Image as ImageIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDebounce } from 'use-debounce'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

type Meta = {
    page: number
    pageSize: number
    total: number
    pages: number
    isPrevPage: boolean
    isNextPage: boolean
}

type Props = {
    resultImages: ResponseAPI[]
    products: Product[]
    meta: Meta
    search: string
}
export default function TableProducts({ resultImages, products, meta, search }: Props) {
    const { temporalList, handleImageClick, handleSubmit, loading, setLoading, productsAdded } =
        useImageSelection(products)
    const [loadingAutomate, setLoadingAutomate] = useState(false)
    const router = useRouter()
    const [text, setText] = useState(search)
    const [query] = useDebounce(text, 500)

    useEffect(() => {
        if (query === search) return

        const params = new URLSearchParams()
        if (query) {
            params.set('search', query)
        }
        params.set('page', '1') // Reset a pagina 1 al buscar
        router.push(`?${params.toString()}`)
    }, [query, router, search])

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(window.location.search)
        params.set('page', newPage.toString())
        router.push(`?${params.toString()}`)
    }

    const automatizar = async () => {
        console.log('automatizando...')
        setLoadingAutomate(true)

        try {
            for (let index = 0; index < temporalList.length; index++) {
                try {
                    const product = temporalList[index]
                    const images = resultImages[index]?.images

                    // Validación en cascada con optional chaining
                    if (!images?.[0]?.imageUrl) continue

                    const [primeraImg, segundaImg] = images
                    const esGeo = primeraImg.imageUrl.includes('geoconstructor')

                    // Validar existencia de segunda imagen si es geo
                    if (esGeo && !segundaImg?.imageUrl) continue

                    const hasExistingImage = Boolean(product.image?.url || product.url_image)

                    // No procesar si ya tiene imagen
                    if (hasExistingImage) continue

                    // Seleccionar imagen adecuada
                    const targetImage = esGeo ? segundaImg : primeraImg
                    if (!targetImage?.imageUrl) continue

                    // Preparar objeto imagen
                    const tempImage: Image = {
                        ...targetImage,
                        imageUrl: targetImage.imageUrl,
                    }

                    await handleImageClick(index, tempImage)
                } catch (error) {
                    console.error(`Error en item ${index}:`, error)
                    continue
                }
            }
        } catch (error) {
            console.error('Error general inesperado:', error)
        } finally {
            setLoadingAutomate(false)
        }
    }

    const tableRows = useMemo(
        () =>
            temporalList.map((p, i) => {
                const currentImageUrl = p.image?.url || p.url_image || ''

                return (
                    <TableRow key={p.id} className="group transition-all hover:bg-slate-50/50">
                        <TableCell className="align-top border-r p-4 w-[350px] min-w-[350px]">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-start gap-3">
                                    {/* Current Image */}
                                    <div className="relative group/img shrink-0">
                                        {currentImageUrl ? (
                                            <img
                                                src={currentImageUrl}
                                                className="w-32 h-32 object-cover rounded-lg border shadow-sm bg-white"
                                                alt={p.name}
                                            />
                                        ) : (
                                            <div className="w-32 h-32 bg-slate-100 flex flex-col items-center justify-center rounded-lg border border-dashed text-slate-400 text-[10px] gap-1">
                                                <ImageIcon size={20} />
                                                <span>Sin imagen</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold bg-slate-50 text-slate-500 mb-1">
                                            {p.code}
                                        </div>
                                        <h3
                                            className="text-sm font-bold text-slate-900 leading-tight line-clamp-3"
                                            title={p.name}
                                        >
                                            {p.name}
                                        </h3>
                                    </div>
                                </div>

                                {/* Selected Image Status */}
                                {p.selectedImage ? (
                                    <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-xl relative overflow-hidden animate-in fade-in slide-in-from-top-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="bg-green-500 rounded-full p-0.5 text-white">
                                                <CheckCircle2 size={12} />
                                            </div>
                                            <span className="text-[11px] font-bold text-green-700 uppercase tracking-wider">
                                                Nueva seleccionada
                                            </span>
                                        </div>
                                        <div className="relative group/newimg">
                                            <img
                                                src={p.selectedImage.imageUrl}
                                                className="w-full h-32 object-cover rounded-lg border-2 border-green-500 shadow-md transition-transform hover:scale-[1.02] cursor-pointer"
                                                onClick={() => window.open(p.selectedImage?.imageUrl, '_blank')}
                                            />
                                            {p.loading && (
                                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                                                    <LoaderCircle className="animate-spin text-green-700" size={24} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    p.loading && (
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center gap-2">
                                            <LoaderCircle className="animate-spin text-blue-700" size={16} />
                                            <span className="text-xs font-medium text-blue-700">
                                                Subiendo imagen...
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>
                        </TableCell>

                        <TableCell className="align-top p-4">
                            <div className="flex flex-col h-full">
                                <div className="flex flex-row flex-wrap gap-3">
                                    {resultImages[i]?.images?.map((image) => {
                                        const isSelected = p.selectedImage?.thumbnailUrl === image.thumbnailUrl
                                        return (
                                            <div
                                                key={image.imageUrl}
                                                className={cn(
                                                    'transition-all duration-300 rounded-xl',
                                                    isSelected
                                                        ? 'ring-4 ring-green-500 ring-offset-2 scale-95 shadow-lg'
                                                        : 'hover:scale-105 active:scale-95',
                                                )}
                                            >
                                                <ImageThumbnail
                                                    image={image}
                                                    onClick={() => handleImageClick(i, image)}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                )
            }),
        [temporalList, resultImages, handleImageClick],
    )

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar productos..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-xl border shadow-sm overflow-hidden bg-white">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50">
                            <TableHead className="w-[350px] font-bold text-slate-700 uppercase text-[11px] tracking-wider">
                                Actuales (sólo vigentes)
                            </TableHead>
                            <TableHead className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">
                                {!resultImages.length
                                    ? 'Estado general'
                                    : 'Resultados de GOOGLE: Clic sobre la imagen para marcarla'}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tableRows.length > 0 ? (
                            tableRows
                        ) : (
                            <TableRow>
                                <TableCell colSpan={2} className="h-32 text-center text-slate-400">
                                    {!resultImages.length
                                        ? 'Todos los productos están con sus respectivas fotos, ¡Felicitaciones!'
                                        : 'No hay productos para mostrar'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between py-4">
                <div className="text-sm text-muted-foreground">
                    Página {meta.page} de {meta.pages} ({meta.total} productos)
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(meta.page - 1)}
                        disabled={!meta.isPrevPage}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(meta.page + 1)}
                        disabled={!meta.isNextPage}
                    >
                        Siguiente
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Botón para actualizar automáticamente */}
            <button
                className={cn(
                    'flex justify-center items-center gap-2 fixed top-4 right-4 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 px-4 rounded-full shadow-lg transition-all active:scale-95 z-[60]',
                    (loadingAutomate || loading || !resultImages.length) && 'opacity-50 pointer-events-none',
                )}
                onClick={automatizar}
                disabled={loadingAutomate || loading}
            >
                {loadingAutomate ? <LoaderCircle className="animate-spin" size={16} /> : <Bot size={16} />}
                <span>{loadingAutomate ? 'Automatizando...' : 'Automatizar selección'}</span>
            </button>

            {/* Botón para subir las fotos */}
            {productsAdded.length > 0 && (
                <button
                    className={cn(
                        'flex justify-center items-center gap-2 fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 px-6 rounded-full shadow-2xl transition-all active:scale-95 z-[60] border-2 border-white',
                        (loading || loadingAutomate) && 'opacity-50 pointer-events-none',
                    )}
                    onClick={handleSubmit}
                    disabled={loading || loadingAutomate}
                >
                    {loading ? <LoaderCircle className="animate-spin" size={20} /> : <UploadCloud size={20} />}
                    <span>
                        {loading
                            ? 'Actualizando...'
                            : `Subir ${productsAdded.length} ${productsAdded.length > 1 ? 'productos' : 'producto'}`}
                    </span>
                </button>
            )}
        </div>
    )
}
