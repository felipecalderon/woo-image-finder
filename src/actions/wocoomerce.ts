import { config } from '@/constants/env'
import { Product } from '@/interfaces/product.interface'

interface ResponseGeo {
    meta: {
        page: number
        pageSize: number
        total: number
        pages: number
    }
    data: Product[]
}

export const getProducts = async (page = '1', pageSize = '50') => {
    try {
        const url = 'https://www.geoconstructor.cl/wp-json/custom/v1/products-without-image'
        const args = new URLSearchParams({
            page,
            pageSize,
        })

        const response = await fetch(`${url}?${args}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const data: Promise<ResponseGeo> = await response.json()
        return data
    } catch (error) {
        console.error(error)
        throw new Error('Error al obtener productos')
    }
}

interface UpdateImage {
    id: number
    images: {
        src: string
    }[]
}
interface UpdateProducts {
    update: UpdateImage[]
}

export const updateProducts = async (updateImage: UpdateImage[]) => {
    try {
        const update: UpdateProducts = {
            update: updateImage,
        }
        const url = 'https://www.geoconstructor.cl/wp-json/wc/v3/products/batch'
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Basic ' + btoa(`${config.WP_CLIENT}:${config.WP_SECRET}`),
            },
            body: JSON.stringify(update),
        })
        const data: any = await response.json()
        return data
    } catch (error) {
        console.error(error)
        throw new Error('Error al obtener productos')
    }
}
