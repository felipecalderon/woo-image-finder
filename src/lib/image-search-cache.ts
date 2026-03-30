import { ResponseAPI } from '@/interfaces/common.interface'
import { Product } from '@/interfaces/product.interface'
import { cleanText } from '@/lib/clean-text'

type CachedImageSearchEntry = {
    key: string
    response: ResponseAPI
}

const DB_NAME = 'geo-image-search-cache'
const STORE_NAME = 'search-results'
const DB_VERSION = 1

let dbPromise: Promise<IDBDatabase> | null = null

const normalizeText = (value: string) => cleanText(value).toLowerCase().replace(/\s+/g, ' ').trim()

const openDatabase = () => {
    if (typeof indexedDB === 'undefined') {
        return Promise.reject(new Error('IndexedDB no está disponible'))
    }

    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION)

            request.onupgradeneeded = () => {
                const db = request.result
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'key' })
                }
            }

            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
        })
    }

    return dbPromise
}

const readEntry = async (key: string): Promise<CachedImageSearchEntry | null> => {
    const db = await openDatabase()

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.get(key)

        request.onsuccess = () => resolve((request.result as CachedImageSearchEntry | undefined) ?? null)
        request.onerror = () => reject(request.error)
    })
}

const writeEntry = async (entry: CachedImageSearchEntry) => {
    const db = await openDatabase()

    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.put(entry)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
    })
}

export const buildProductImageSearchKey = (product: Product) => {
    const identifier = product.code?.trim() || String(product.id)
    return `${identifier}::${normalizeText(product.name)}`
}

export const buildProductImageQuery = (product: Product) => cleanText(product.name).trim()

export const getCachedProductImageSearch = async (key: string) => {
    if (typeof indexedDB === 'undefined') return null
    return await readEntry(key)
}

export const getCachedProductImageSearches = async (keys: string[]) => {
    if (typeof indexedDB === 'undefined' || keys.length === 0) return []
    const results = await Promise.all(keys.map(async (key) => await readEntry(key)))
    return results.filter((entry): entry is CachedImageSearchEntry => Boolean(entry))
}

export const saveCachedProductImageSearch = async (key: string, response: ResponseAPI) => {
    if (typeof indexedDB === 'undefined') return
    await writeEntry({ key, response })
}
