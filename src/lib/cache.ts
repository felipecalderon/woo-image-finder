import { getImages } from '@/actions/get-images'

const cache = new Map()
interface Titles {
    q: string
    location: string
    hl: string
    num: number
}

export const getCachedImages = async (titles: Titles[]) => {
    const cacheKey = JSON.stringify(titles) // Crea una clave única basada en los títulos
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey) // Devuelve el resultado en cache si existe
    }

    // Si no está cacheado, llama a getImages y almacena el resultado
    const resultSearchs = await getImages(titles)
    cache.set(cacheKey, resultSearchs)
    return resultSearchs
}
