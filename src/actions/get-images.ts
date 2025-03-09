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
        console.error({ error })
        throw new Error('Error listar imágenes')
    }
}
// Función cacheada con unstable_cache
export const getCachedImages = unstable_cache(
    async (titles: Array<{ q: string; location: string; hl: string; num: number }>) => {
        return await getImages(titles)
    },
    // Clave de caché, que puede incluir identificadores estáticos
    [`cache-${apikey}`]
)
