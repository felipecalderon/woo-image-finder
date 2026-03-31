'use server'
import { config } from '@/constants/env'
import { PaginationMeta } from '@/interfaces/common.interface'
import { ProductCategory } from '@/interfaces/product.interface'

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
        categories?: ProductCategory[]
    }
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

export const getCategories = async (page = '1', pageSize = '50') => {
    try {
        if (!config.EXTERNAL_API_URL) {
            throw new Error('Falta EXTERNAL_API_URL')
        }

        const url = new URL(`${config.EXTERNAL_API_URL}/api/v1/categorias`)
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
        const data = payload.data?.categories || []
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
        console.error('Error fetching categorias:', error)
        throw error
    }
}
