export interface ProductImageVariant {
    url: string
}

export interface ProductImage {
    url?: string
    small_thumb?: ProductImageVariant
    large_thumb?: ProductImageVariant
}

export interface ProductCategory {
    id: number
    name: string
}

export interface ProductInventory {
    id: number
    stock: number
    ware_house_id: number
    average_cost: number
    location: string
}

export interface Product {
    id: number
    name: string
    code: string
    description?: string
    price?: number
    price_sale?: number
    product_type?: string
    is_tax?: boolean
    currency?: string
    image?: ProductImage | null
    url_image?: string | null
    category?: ProductCategory | null
    category_id?: number | null
    inventories?: ProductInventory[]
    enabled?: boolean
}
