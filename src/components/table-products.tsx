'use client'

import { getCategories } from '@/actions/categories'
import { ImageThumbnail } from '@/components/thumbnail'
import { PaginationMeta } from '@/interfaces/common.interface'
import { useImageSearch } from '@/hooks/image-search'
import { useImageSelection } from '@/hooks/img-selection'
import { buildProductImageSearchKey } from '@/lib/image-search-cache'
import { cn } from '@/lib/utils'
import { Image } from '@/interfaces/image.interface'
import { Product, ProductCategory } from '@/interfaces/product.interface'
import {
    Bot,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    Image as ImageIcon,
    LoaderCircle,
    Search,
    UploadCloud,
    Link,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useDebounce } from 'use-debounce'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'

type Props = {
    products: Product[]
    meta: PaginationMeta
    search: string
    categories: ProductCategory[]
    categoriesLoading: boolean
    categoriesMeta: PaginationMeta
    categoryId: string
}

const sortCategories = (items: ProductCategory[]) => [...items].sort((a, b) => a.name.localeCompare(b.name, 'es'))

export default function TableProducts({
    products,
    meta,
    search,
    categories,
    categoriesLoading,
    categoriesMeta,
    categoryId,
}: Props) {
    const { temporalList, handleImageClick, handleSubmit, loading, productsAdded } = useImageSelection(products)
    const { searchResults, searchLoadingKeys, searchPending, fetchProductImages, fetchAllProductImages } =
        useImageSearch(products)
    const [loadingAutomate, setLoadingAutomate] = useState(false)
    const router = useRouter()
    const [text, setText] = useState(search)
    const [query] = useDebounce(text, 500)
    const [selectedCategory, setSelectedCategory] = useState(categoryId)
    const [categoryQuery, setCategoryQuery] = useState('')
    const [categoryOpen, setCategoryOpen] = useState(false)
    const categoryInputRef = useRef<HTMLInputElement>(null)
    const [categoriesState, setCategoriesState] = useState(sortCategories(categories))
    const [categoriesMetaState, setCategoriesMetaState] = useState(categoriesMeta)
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        setCategoriesState(sortCategories(categories))
        setCategoriesMetaState(categoriesMeta)
    }, [categories, categoriesMeta])

    useEffect(() => {
        setSelectedCategory(categoryId)
        const selected = categoriesState.find((category) => String(category.id) === String(categoryId))
        setCategoryQuery(selected?.name ?? '')
    }, [categoriesState, categoryId])

    const updateParams = (updater: (params: URLSearchParams) => void) => {
        const params = new URLSearchParams(window.location.search)
        updater(params)
        router.push(`?${params.toString()}`)
    }

    useEffect(() => {
        if (query === search) return

        updateParams((params) => {
            if (query) {
                params.set('search', query)
            } else {
                params.delete('search')
            }
            params.set('page', '1')
        })
    }, [query, router, search])

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(window.location.search)
        params.set('page', newPage.toString())
        router.push(`?${params.toString()}`)
    }

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value)
        updateParams((params) => {
            if (value) {
                params.set('category_id', value)
            } else {
                params.delete('category_id')
            }
            params.set('page', '1')
        })
    }

    const clearCategory = () => handleCategoryChange('')

    const handleCategoryPageChange = (newPage: number) => {
        startTransition(async () => {
            try {
                const result = await getCategories(String(newPage))
                setCategoriesState(sortCategories(result.data))
                setCategoriesMetaState(result.meta)
                setCategoryOpen(true)
                categoryInputRef.current?.focus()
            } catch (error) {
                console.error('Error paginando categorías:', error)
            }
        })
    }

    const filteredCategories = useMemo(() => {
        if (!categoryQuery) return categoriesState
        const query = categoryQuery.toLowerCase()
        return categoriesState.filter((category) => category.name.toLowerCase().includes(query))
    }, [categoriesState, categoryQuery])

    const categoriesBusy = categoriesLoading || isPending

    const automatizar = async () => {
        setLoadingAutomate(true)

        try {
            for (let index = 0; index < temporalList.length; index++) {
                try {
                    const product = temporalList[index]
                    const imageSearch = await fetchProductImages(index)
                    const images = imageSearch?.images

                    if (!images?.[0]?.imageUrl) continue

                    const [primeraImg, segundaImg] = images
                    const esGeo = primeraImg.imageUrl.includes('geoconstructor')

                    if (esGeo && !segundaImg?.imageUrl) continue

                    const hasExistingImage = Boolean(product.image?.url || product.url_image)
                    if (hasExistingImage) continue

                    const targetImage = esGeo ? segundaImg : primeraImg
                    if (!targetImage?.imageUrl) continue

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
                const productKey = buildProductImageSearchKey(p)
                const imageSearch = searchResults[productKey]
                const images = imageSearch?.images ?? []
                const isSearching = Boolean(searchLoadingKeys[productKey])

                return (
                    <TableRow key={p.id} className="group transition-all hover:bg-slate-50/50">
                        <TableCell className="align-top border-r p-4 pt-6 w-[350px] min-w-[350px]">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="relative group/img shrink-0">
                                        <span className="bg-green-700 absolute -top-2 -left-2 z-10 text-[9px] text-white px-1.5 py-0.5 rounded shadow-sm font-medium">
                                            {p.category?.name ?? 'Sin categoría'}
                                        </span>
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
                                                className="w-full h-auto object-cover rounded-lg border-2 border-green-500 shadow-md transition-transform hover:scale-[1.02] cursor-pointer"
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
                            <div className="flex flex-col h-full gap-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Imágenes del producto
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => void fetchProductImages(i)}
                                        disabled={isSearching || loadingAutomate || loading}
                                        className="shrink-0"
                                    >
                                        {isSearching ? (
                                            <LoaderCircle className="animate-spin h-4 w-4" />
                                        ) : (
                                            <ImageIcon className="h-4 w-4" />
                                        )}
                                        <span>{images.length > 0 ? 'Recargar' : 'Traer imágenes'}</span>
                                    </Button>
                                </div>

                                {images.length > 0 ? (
                                    <div className="flex flex-row flex-wrap gap-3">
                                        {images.map((image) => {
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
                                ) : (
                                    <div className="min-h-[120px] rounded-xl border border-dashed bg-slate-50/80 px-4 py-6 text-sm text-slate-400 flex items-center justify-center text-center">
                                        {isSearching
                                            ? 'Buscando imágenes...'
                                            : 'Presiona el botón para cargar solo las imágenes de este producto.'}
                                    </div>
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                )
            }),
        [
            fetchProductImages,
            handleImageClick,
            loading,
            loadingAutomate,
            searchLoadingKeys,
            searchResults,
            temporalList,
        ],
    )

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar productos..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="pl-8 bg-white"
                    />
                </div>

                <div className="flex flex-1 items-center gap-2">
                    <div className="relative w-full min-w-[220px]">
                        <Input
                            ref={categoryInputRef}
                            placeholder={categoriesBusy ? 'Cargando categorías...' : 'Buscar categoría...'}
                            value={categoryQuery}
                            onChange={(e) => {
                                setCategoryQuery(e.target.value)
                                setCategoryOpen(true)
                            }}
                            onFocus={() => setCategoryOpen(true)}
                            onBlur={() => setCategoryOpen(false)}
                            className="pr-8 bg-white"
                            disabled={categoriesBusy}
                            aria-label="Buscar categoría"
                        />
                        {categoriesBusy ? (
                            <LoaderCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
                        ) : (
                            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        )}
                        {categoryOpen && !categoriesBusy && (
                            <div className="absolute z-30 mt-2 w-full max-h-64 overflow-hidden rounded-md border bg-white shadow-lg">
                                <div className="max-h-52 overflow-auto">
                                    <button
                                        type="button"
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => {
                                            clearCategory()
                                            setCategoryQuery('')
                                        }}
                                    >
                                        Todas las categorías
                                    </button>
                                    {filteredCategories.length > 0 ? (
                                        filteredCategories.map((category) => (
                                            <button
                                                key={category.id}
                                                type="button"
                                                className={cn(
                                                    'w-full text-left px-3 py-2 text-sm hover:bg-slate-50',
                                                    String(category.id) === String(selectedCategory) && 'bg-slate-100',
                                                )}
                                                onMouseDown={(event) => event.preventDefault()}
                                                onClick={() => {
                                                    handleCategoryChange(String(category.id))
                                                    setCategoryQuery(category.name)
                                                    setCategoryOpen(false)
                                                    categoryInputRef.current?.blur()
                                                }}
                                            >
                                                {category.name}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-3 py-2 text-sm text-slate-400">Sin resultados</div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between border-t px-2 py-1 text-[11px] text-slate-500">
                                    <span>
                                        Página {categoriesMetaState.page} de {categoriesMetaState.pages}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            className={cn(
                                                'rounded px-2 py-0.5 text-xs',
                                                categoriesMetaState.isPrevPage
                                                    ? 'hover:bg-slate-100 text-slate-700'
                                                    : 'text-slate-300 cursor-not-allowed',
                                            )}
                                            onMouseDown={(event) => event.preventDefault()}
                                            onClick={() =>
                                                categoriesMetaState.isPrevPage &&
                                                handleCategoryPageChange(categoriesMetaState.page - 1)
                                            }
                                            disabled={!categoriesMetaState.isPrevPage}
                                        >
                                            Anterior
                                        </button>
                                        <button
                                            type="button"
                                            className={cn(
                                                'rounded px-2 py-0.5 text-xs',
                                                categoriesMetaState.isNextPage
                                                    ? 'hover:bg-slate-100 text-slate-700'
                                                    : 'text-slate-300 cursor-not-allowed',
                                            )}
                                            onMouseDown={(event) => event.preventDefault()}
                                            onClick={() =>
                                                categoriesMetaState.isNextPage &&
                                                handleCategoryPageChange(categoriesMetaState.page + 1)
                                            }
                                            disabled={!categoriesMetaState.isNextPage}
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {selectedCategory && !categoriesBusy && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                clearCategory()
                                setCategoryQuery('')
                            }}
                        >
                            Limpiar
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-xl border shadow-sm overflow-hidden bg-white">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50">
                            <TableHead className="w-[350px] font-bold text-slate-700 uppercase text-[11px] tracking-wider">
                                Productos Actuales
                            </TableHead>
                            <TableHead className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">
                                <div className="flex items-center justify-between gap-3">
                                    <span>Resultados de GOOGLE</span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => void fetchAllProductImages()}
                                        disabled={
                                            searchPending || loadingAutomate || loading || temporalList.length === 0
                                        }
                                    >
                                        {searchPending ? (
                                            <LoaderCircle className="animate-spin h-4 w-4" />
                                        ) : (
                                            <ImageIcon className="h-4 w-4" />
                                        )}
                                        <span>Extraer todas las imágenes</span>
                                    </Button>
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tableRows.length > 0 ? (
                            tableRows
                        ) : (
                            <TableRow>
                                <TableCell colSpan={2} className="h-32 text-center text-slate-400">
                                    <p>
                                        Se buscó {query.toUpperCase()} {categoryQuery ? `en ${categoryQuery}` : ''}
                                    </p>
                                    <p>No hay productos aquí :(</p>
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
                    (loadingAutomate || loading || searchPending) && 'opacity-50 pointer-events-none',
                )}
                onClick={automatizar}
                disabled={loadingAutomate || loading || searchPending}
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
