'use client'

import { ResponseAPI } from '@/interfaces/common.interface'
import { Product } from '@/interfaces/product.interface'
import {
    buildProductImageQuery,
    buildProductImageSearchKey,
    getCachedProductImageSearch,
    getCachedProductImageSearches,
    saveCachedProductImageSearch,
} from '@/lib/image-search-cache'
import { searchImagesAction } from '@/actions/search-images'
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

type SearchLoadingMap = Record<string, boolean>

type ImageSearchResult = {
    searchResults: Record<string, ResponseAPI | undefined>
    searchLoadingKeys: SearchLoadingMap
    searchPending: boolean
    fetchProductImages: (index: number) => Promise<ResponseAPI | undefined>
    fetchAllProductImages: () => Promise<void>
}

type SearchResponse = ResponseAPI & {
    error?: {
        message: string
    }
}

export const useImageSearch = (products: Product[]): ImageSearchResult => {
    const [searchResults, setSearchResults] = useState<Record<string, ResponseAPI | undefined>>({})
    const [searchLoadingKeys, setSearchLoadingKeys] = useState<SearchLoadingMap>({})
    const [searchPending, startTransition] = useTransition()
    const inFlightRef = useRef(new Map<string, Promise<ResponseAPI | undefined>>())
    const searchResultsRef = useRef<Record<string, ResponseAPI | undefined>>({})

    const productKeys = useMemo(() => products.map((product) => buildProductImageSearchKey(product)), [products])

    useEffect(() => {
        searchResultsRef.current = searchResults
    }, [searchResults])

    useEffect(() => {
        let cancelled = false

        const preloadCache = async () => {
            const cachedEntries = await getCachedProductImageSearches(productKeys)
            if (cancelled || cachedEntries.length === 0) return

            setSearchResults((current) => {
                const next = { ...current }
                for (const entry of cachedEntries) {
                    next[entry.key] = entry.response
                }
                return next
            })
        }

        preloadCache().catch((error) => {
            console.error('Error preloading image cache:', error)
        })

        return () => {
            cancelled = true
        }
    }, [productKeys])

    const setLoadingForKey = useCallback((key: string, loading: boolean) => {
        setSearchLoadingKeys((current) => {
            const next = { ...current }
            if (loading) {
                next[key] = true
            } else {
                delete next[key]
            }
            return next
        })
    }, [])

    const fetchProductImages = useCallback(
        async (index: number) => {
            const product = products[index]
            if (!product) return undefined

            const key = buildProductImageSearchKey(product)
            const currentResult = searchResultsRef.current[key]
            if (currentResult) return currentResult

            const existingRequest = inFlightRef.current.get(key)
            if (existingRequest) return await existingRequest

            const request = (async () => {
                setLoadingForKey(key, true)

                try {
                    const cached = await getCachedProductImageSearch(key)
                    if (cached?.response) {
                        searchResultsRef.current[key] = cached.response
                        setSearchResults((current) => ({ ...current, [key]: cached.response }))
                        return cached.response
                    }

                    const payload: SearchResponse = await new Promise((resolve, reject) => {
                        startTransition(() => {
                            void searchImagesAction({
                                q: buildProductImageQuery(product),
                                location: 'Chile',
                                hl: 'es-419',
                                num: 5,
                            })
                                .then(resolve)
                                .catch(reject)
                        })
                    })

                    if (payload.error) {
                        throw new Error(payload.error.message || 'Error al buscar imágenes')
                    }

                    searchResultsRef.current[key] = payload
                    setSearchResults((current) => ({ ...current, [key]: payload }))
                    await saveCachedProductImageSearch(key, payload)
                    return payload
                } catch (error) {
                    console.error('Error fetching product images:', error)
                    toast.error(`No se pudieron traer imágenes de ${product.name}`, { duration: 4000 })
                    return undefined
                } finally {
                    setLoadingForKey(key, false)
                    inFlightRef.current.delete(key)
                }
            })()

            inFlightRef.current.set(key, request)
            return await request
        },
        [products, setLoadingForKey, startTransition],
    )

    const fetchAllProductImages = useCallback(async () => {
        for (let index = 0; index < products.length; index++) {
            await fetchProductImages(index)
        }
    }, [fetchProductImages, products.length])

    return { searchResults, searchLoadingKeys, searchPending, fetchProductImages, fetchAllProductImages }
}
