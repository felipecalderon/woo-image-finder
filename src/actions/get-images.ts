import { config } from '@/constants/env'
import { ResponseAPI } from '@/interfaces/common.interface'
import { unstable_cache } from 'next/cache'

interface Searchs {
    q: string
}

interface ErrorMessage {
    error: {
        message: string
    }
}

const apikey = config.SERP_APIKEY

export const getImages = async (search: Searchs[]) => {
    if (!apikey) throw new Error('No hay apikey')
    if (search.length === 0) return []
    try {
        const response = await fetch('https://google.serper.dev/images', {
            method: 'POST',
            headers: {
                'X-API-KEY': apikey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(search),
        })
        const data: Promise<ResponseAPI[] & [ErrorMessage]> = await response.json()
        return data
    } catch (error) {
        throw new Error('Error al listar imágenes')
    }
}
// Función cacheada con unstable_cache
export const getCachedImages = unstable_cache(
    async (titles: Array<{ q: string; location: string; hl: string; num: number }>) => {
        return await getImages(titles)
    },
    // Clave de caché, se actualiza si cambia la api
    [`cache:${apikey}`]
)
