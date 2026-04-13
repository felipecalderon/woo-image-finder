'use client'

import { getCategories } from '@/actions/categories'
import { ProductDesktopRow } from '@/components/table-products/product-desktop-row'
import { ProductMobileCard } from '@/components/table-products/product-mobile-card'
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
    LoaderCircle,
    Search,
    UploadCloud,
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
    const { searchResults, searchLoadingKeys, searchPending, fetchProductImages } = useImageSearch(products)
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

    const desktopRows = useMemo(
        () =>
            temporalList.map((p, i) => {
                const currentImageUrl = p.image?.url || p.url_image || ''
                const productKey = buildProductImageSearchKey(p)
                const imageSearch = searchResults[productKey]
                const images = imageSearch?.images ?? []
                const isSearching = Boolean(searchLoadingKeys[productKey])

                return (
                    <ProductDesktopRow
                        key={p.id}
                        index={i}
                        product={p}
                        currentImageUrl={currentImageUrl}
                        images={images}
                        isSearching={isSearching}
                        loadingAutomate={loadingAutomate}
                        loading={loading}
                        onFetchImages={fetchProductImages}
                        onSelectImage={handleImageClick}
                    />
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

    const mobileCards = useMemo(
        () =>
            temporalList.map((p, i) => {
                const currentImageUrl = p.image?.url || p.url_image || ''
                const productKey = buildProductImageSearchKey(p)
                const imageSearch = searchResults[productKey]
                const images = imageSearch?.images ?? []
                const isSearching = Boolean(searchLoadingKeys[productKey])

                return (
                    <ProductMobileCard
                        key={p.id}
                        index={i}
                        product={p}
                        currentImageUrl={currentImageUrl}
                        images={images}
                        isSearching={isSearching}
                        loadingAutomate={loadingAutomate}
                        loading={loading}
                        onFetchImages={fetchProductImages}
                        onSelectImage={handleImageClick}
                    />
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
                <div className="relative w-full flex-1 max-w-none md:max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar productos..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="pl-8 bg-white"
                    />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center md:flex-1 md:gap-2">
                    <div className="relative w-full min-w-0 md:min-w-[220px]">
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

            <div className="overflow-hidden rounded-xl border bg-white shadow-sm md:block hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50">
                            <TableHead className="w-[350px] font-bold text-slate-700 uppercase text-[11px] tracking-wider">
                                Productos Actuales
                            </TableHead>
                            <TableHead className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">
                                <div className="flex items-center justify-between gap-3">
                                    <span>Resultados de GOOGLE</span>
                                    {/* <Button
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
                                    </Button> */}
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {desktopRows.length > 0 ? (
                            desktopRows
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

            <div className="space-y-4 md:hidden">
                {mobileCards.length > 0 ? (
                    mobileCards
                ) : (
                    <div className="rounded-xl border bg-white p-6 text-center text-slate-400 shadow-sm">
                        <p>
                            Se buscó {query.toUpperCase()} {categoryQuery ? `en ${categoryQuery}` : ''}
                        </p>
                        <p>No hay productos aquí :(</p>
                    </div>
                )}
            </div>

            {/* Paginación */}
            <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                    Página {meta.page} de {meta.pages} ({meta.total} productos)
                </div>
                <div className="flex items-center gap-2">
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
                    'fixed right-3 top-3 z-[60] flex items-center justify-center gap-2 rounded-full bg-green-600 px-3 py-2 text-xs font-bold text-white shadow-lg transition-all active:scale-95 hover:bg-green-700 sm:right-4 sm:top-4 sm:px-4 sm:py-2.5',
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
                        'fixed bottom-3 left-3 right-3 z-[60] flex items-center justify-center gap-2 rounded-full border-2 border-white bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-2xl transition-all active:scale-95 hover:bg-blue-700 sm:left-auto sm:right-4 sm:bottom-6 sm:w-auto sm:px-6',
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
