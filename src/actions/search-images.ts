'use server'

import { getImages } from '@/actions/get-images'
import { ResponseAPI } from '@/interfaces/common.interface'

type SearchParams = {
    q: string
    location?: string
    hl?: string
    num?: number
}

type SearchResponse = ResponseAPI & {
    error?: {
        message: string
    }
}

export const searchImagesAction = async (params: SearchParams): Promise<SearchResponse> => {
    const [result] = await getImages([
        {
            q: params.q,
            location: params.location ?? 'Chile',
            hl: params.hl ?? 'es-419',
            num: params.num ?? 5,
        },
    ])

    if (!result) {
        throw new Error('Sin resultados')
    }

    return result as SearchResponse
}
