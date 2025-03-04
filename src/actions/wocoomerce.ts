import { config } from '@/constants/env'
import { ImageProduct, Product } from '@/interfaces/product.interface'
import { convertToJpg } from '@/lib/convert-jpg'

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
    images: [
        {
            id: number
        }
    ]
}
interface UpdateProducts {
    update: UpdateImage[]
}

export const updateProducts = async () => {
    const updateExmple: UpdateProducts = {
        update: [
            {
                id: 36178,
                images: [
                    {
                        id: 37263,
                    },
                ],
            },
        ],
    }
    try {
        const url = 'https://www.geoconstructor.cl/wp-json/wc/v3/products/batch'
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Basic ' + btoa(`${config.WP_CLIENT}:${config.WP_SECRET}`),
            },
            body: JSON.stringify(updateExmple),
        })
        const data: any = await response.json()
        console.log({ response, data: data.update[0] })
        return data
    } catch (error) {
        console.error(error)
        throw new Error('Error al obtener productos')
    }
}

export const uploadImage = async (imageUrl: string, fileName: string) => {
    // 1. Descargar la imagen como blob
    const imageResponse = await fetch(imageUrl)
    const imageBlob = await imageResponse.blob()

    // 2. Convertir la imagen a JPG usando Canvas
    // const jpgBlob = await convertToJpg(imageBlob)

    // 3. Crear FormData para la subida
    const formData = new FormData()
    formData.append('file', imageBlob, `${fileName}.jpg`)

    // 4. Subir la imagen a WordPress
    const response = await fetch('https://www.geoconstructor.cl/wp-json/wp/v2/media', {
        method: 'POST',
        headers: {
            Authorization: 'Basic ' + btoa(`Administrador:${config.WORDPRESS_PASSWORD}`),
        },
        body: formData,
    })

    return response.json()
}
