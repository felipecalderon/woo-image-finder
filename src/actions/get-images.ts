import { config } from '@/constants/env'
import { ResponseAPI } from '@/interfaces/common.interface'

interface Searchs {
    q: string
}

interface ErrorMessage {
    error: {
        message: string
    }
}
export const getImages = async (search: Searchs[]) => {
    const apikey = config.SERP_APIKEY
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
