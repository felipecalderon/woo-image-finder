import { config } from '@/constants/env'
import { PaginationMeta } from '@/interfaces/common.interface'
import { Product } from '@/interfaces/product.interface'

interface ExternalMeta {
    code: number
    message: string
    current_page: number
    next_page: number
    prev_page: number
    total_pages: number
    total_count: number
}

interface ExternalResponse {
    data?: {
        products?: Product[]
    }
    products?: Product[]
    meta?: ExternalMeta
}

const buildHeaders = () => {
    if (!config.AUTH_TOKEN || !config.COMPANY_TOKEN) {
        throw new Error('Faltan credenciales de la API externa')
    }

    return {
        'Content-Type': 'application/json',
        authorization: config.AUTH_TOKEN,
        Company: config.COMPANY_TOKEN,
    }
}

export const getProducts = async (page = '1', pageSize = '20', search = '', categoryId = '') => {
    try {
        if (!config.EXTERNAL_API_URL) {
            throw new Error('Falta EXTERNAL_API_URL')
        }

        const url = new URL(`${config.EXTERNAL_API_URL}/api/v1/productos`)
        if (search) url.searchParams.set('query', search)
        if (categoryId) url.searchParams.set('category_id', categoryId)
        url.searchParams.set('page', page)

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: buildHeaders(),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('External API Error:', response.status, errorText)
            throw new Error(`External API error ${response.status}: ${errorText.slice(0, 100)}`)
        }

        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
            const body = await response.text()
            console.error('Expected JSON, got:', contentType, 'Body:', body)
            throw new Error('Unexpected response from external API (not JSON)')
        }

        const payload: ExternalResponse = await response.json()
        const data = payload.data?.products || []
        const rawMeta = payload.meta

        const meta: PaginationMeta = {
            page: Number(rawMeta?.current_page ?? page),
            pageSize: Number(pageSize) || data.length,
            total: Number(rawMeta?.total_count ?? data.length),
            pages: Number(rawMeta?.total_pages ?? 1),
            isPrevPage: Number(rawMeta?.prev_page ?? -1) !== -1,
            isNextPage: Number(rawMeta?.next_page ?? -1) !== -1,
        }

        return { data, meta }
    } catch (error) {
        console.error('Error fetching productos:', error)
        throw error
    }
}

type UpdateProductPayload = {
    name: string
    enabled?: boolean
    category_id: number
    product_type: number
    is_tax: boolean
    currency: number
    code?: string
    description?: string
    is_variant?: boolean
    is_profit?: boolean
    unit_cost?: number
    price: number
    is_weight_barcode?: boolean
    barcode?: string
    type_code?: string
    unit_item?: string
    sii_tax_id?: number
    image?: string
}

export const updateProductImage = async (productId: number, payload: UpdateProductPayload) => {
    try {
        if (!config.EXTERNAL_API_URL) {
            throw new Error('Falta EXTERNAL_API_URL')
        }

        const url = `${config.EXTERNAL_API_URL}/api/v1/productos/${productId}`
        const body = new URLSearchParams()
        body.set('name', payload.name)
        body.set('category_id', String(payload.category_id))
        body.set('product_type', String(payload.product_type))
        body.set('is_tax', String(payload.is_tax))
        body.set('currency', String(payload.currency))
        body.set('price', String(payload.price))

        if (payload.enabled !== undefined) body.set('enabled', String(payload.enabled))
        if (payload.code !== undefined) body.set('code', payload.code)
        if (payload.description !== undefined) body.set('description', payload.description)
        if (payload.is_variant !== undefined) body.set('is_variant', String(payload.is_variant))
        if (payload.is_profit !== undefined) body.set('is_profit', String(payload.is_profit))
        if (payload.unit_cost !== undefined) body.set('unit_cost', String(payload.unit_cost))
        if (payload.is_weight_barcode !== undefined) body.set('is_weight_barcode', String(payload.is_weight_barcode))
        if (payload.barcode !== undefined) body.set('barcode', payload.barcode)
        if (payload.type_code !== undefined) body.set('type_code', payload.type_code)
        if (payload.unit_item !== undefined) body.set('unit_item', payload.unit_item)
        if (payload.sii_tax_id !== undefined) body.set('sii_tax_id', String(payload.sii_tax_id))
        if (payload.image) body.set('image', payload.image)
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                ...buildHeaders(),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body,
        })

        if (!response.ok) {
            throw new Error(`External API update failed: ${response.status}`)
        }

        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
            return await response.json()
        }

        return { ok: true }
    } catch (error) {
        console.error('Error updating product image:', error)
        throw error
    }
}
